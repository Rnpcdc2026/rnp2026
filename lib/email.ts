import { Resend } from 'resend';
import { render } from '@react-email/render';
import ConfirmationEmail from '@/emails/ConfirmationEmail';
import InvitationEmail from '@/emails/InvitationEmail';
import ReminderEmail from '@/emails/ReminderEmail';
import { createAdminClient } from '@/lib/supabase/admin';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const REPLY_TO = process.env.EMAIL_REPLY_TO;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const DEV_EMAIL = process.env.RESEND_DEV_EMAIL;
const IS_DEV = process.env.NODE_ENV !== 'production';

const PRESENCE_LABELS: Record<string, string> = {
  attends_thursday_morning: 'Jeudi matin',
  attends_thursday_afternoon: 'Jeudi après-midi',
  attends_thursday_evening: 'Jeudi soir',
  attends_friday_morning: 'Vendredi matin',
  attends_friday_afternoon: 'Vendredi après-midi',
};

const TRANSPORT_LABELS: Record<string, string> = {
  train: 'Train',
  plane: 'Avion',
  car: 'Voiture personnelle',
  public_or_walk: 'Transport en commun / à pied',
};

function formatEventDates(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sMonth = s.toLocaleDateString('fr-FR', { month: 'long' });
  const eMonth = e.toLocaleDateString('fr-FR', { month: 'long' });
  if (sMonth === eMonth) {
    return `${s.getDate()} & ${e.getDate()} ${eMonth} ${e.getFullYear()}`;
  }
  return `${s.getDate()} ${sMonth} — ${e.getDate()} ${eMonth} ${e.getFullYear()}`;
}

function formatDeadline(d: string): string {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export async function sendConfirmationEmail(params: {
  registrationId: string;
  eventId: string;
}) {
  console.log('[EMAIL] Starting sendConfirmationEmail', params);

  if (!process.env.RESEND_API_KEY) {
    console.error('[EMAIL] RESEND_API_KEY is missing!');
    return;
  }

  const supabase = createAdminClient();
  let registration: any = null;
  let event: any = null;
  let subject = '';

  try {
    console.log('[EMAIL] Step 1/6 — Loading registration + hotel');
    const { data: reg, error: regErr } = await supabase
      .from('registrations')
      .select('*, hotel:hotels(title)')
      .eq('id', params.registrationId)
      .single();
    if (regErr) {
      console.error('[EMAIL] Registration query error:', regErr.message);
      return;
    }
    if (!reg) {
      console.error('[EMAIL] Registration not found');
      return;
    }
    registration = reg;

    console.log('[EMAIL] Step 2/6 — Loading event');
    const { data: ev, error: evErr } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.eventId)
      .single();
    if (evErr) {
      console.error('[EMAIL] Event query error:', evErr.message);
      return;
    }
    if (!ev) {
      console.error('[EMAIL] Event not found');
      return;
    }
    event = ev;

    console.log('[EMAIL] Step 3/6 — Loading visits');
    const { data: rvs } = await supabase
      .from('registration_visits')
      .select('visit:visits(title, slot_label)')
      .eq('registration_id', registration.id);

    const allVisits = ((rvs || []) as any[]).map((rv) => rv.visit).filter(Boolean);
    const thursdayVisit: string | null =
      allVisits.find((v: any) => v.slot_label?.toLowerCase().includes('jeudi'))?.title ?? null;
    const fridayVisit: string | null =
      allVisits.find((v: any) => v.slot_label?.toLowerCase().includes('vendredi'))?.title ?? null;

    console.log('[EMAIL] Step 4/6 — Loading workshops');
    const { data: rws } = await supabase
      .from('registration_workshops')
      .select('workshop:workshops(title, display_order)')
      .eq('registration_id', registration.id);

    const workshops: string[] = ((rws || []) as any[])
      .map((rw) => rw.workshop)
      .filter(Boolean)
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((w: any) => w.title);

    console.log('[EMAIL] Step 5/6 — Building presenceSlots + labels');
    const presenceSlots = Object.entries(PRESENCE_LABELS)
      .filter(([key]) => (registration as any)[key] === true)
      .map(([, label]) => label);

    const hotelName = (registration.hotel as any)?.title ?? 'Non renseigné';
    const transportLabel =
      TRANSPORT_LABELS[(registration as any).transport_mode] ??
      (registration as any).transport_mode ??
      'Non renseigné';

    console.log('[EMAIL] Step 6/6 — Rendering React-Email template');
    const html = await render(
      ConfirmationEmail({
        firstName: registration.first_name,
        reference: registration.reference,
        eventTitle: event.title,
        eventDates: formatEventDates(event.start_date, event.end_date),
        eventLocation: event.location || 'Lyon',
        presenceSlots,
        thursdayVisit,
        workshops,
        fridayVisit,
        hotelName,
        transportLabel,
        diet: registration.diet || null,
        contactEmail: event.contact_email || 'contact@cdc-habitat.fr',
        appUrl: APP_URL,
      })
    );
    console.log('[EMAIL] Render OK, html length =', html?.length);

    subject = `Inscription confirmée — ${event.title} · ${registration.reference}`;

    const toEmail = IS_DEV && DEV_EMAIL ? DEV_EMAIL : registration.email;
    if (IS_DEV && DEV_EMAIL && DEV_EMAIL !== registration.email) {
      console.log(`[EMAIL] DEV MODE: overriding ${registration.email} → ${DEV_EMAIL}`);
    }
    console.log('[EMAIL] Sending via Resend to', toEmail, 'from', FROM);

    let finalSubject = subject;
    if (IS_DEV && DEV_EMAIL && DEV_EMAIL !== registration.email) {
      finalSubject = `[DEV → ${registration.email}] ${subject}`;
    }
    const result = await resend.emails.send({
      from: FROM,
      to: toEmail,
      replyTo: REPLY_TO,
      subject: finalSubject,
      html,
    });

    console.log('[EMAIL] Resend response:', JSON.stringify(result));

    await supabase
      .from('registrations')
      .update({ confirmation_email_sent_at: new Date().toISOString() })
      .eq('id', registration.id);

    await supabase.from('email_log').insert({
      event_id: params.eventId,
      registration_id: registration.id,
      email_type: 'confirmation',
      to_email: registration.email,
      subject,
      resend_id: result.data?.id || null,
      status: result.error ? 'failed' : 'sent',
      error_message: result.error?.message || null,
    });

    console.log('[EMAIL] Done.');
  } catch (err: any) {
    console.error('[EMAIL] CRASH in sendConfirmationEmail:', err?.message);
    console.error('[EMAIL] Stack:', err?.stack);
    try {
      await supabase.from('email_log').insert({
        event_id: params.eventId,
        registration_id: registration?.id || null,
        email_type: 'confirmation',
        to_email: registration?.email || 'unknown',
        subject: subject || 'unknown',
        status: 'failed',
        error_message: (err?.message || 'unknown') + ' | ' + (err?.stack || '').slice(0, 500),
      });
    } catch (logErr: any) {
      console.error('[EMAIL] Failed to write email_log:', logErr?.message);
    }
  }
}

export async function sendInvitationEmail(params: {
  invitationId: string;
  eventId: string;
}) {
  const supabase = createAdminClient();
  try {
    const { data: invitation } = await supabase.from('invitations').select('*').eq('id', params.invitationId).single();
    if (!invitation) return { success: false, error: 'Invitation introuvable' };
    const { data: event } = await supabase.from('events').select('*').eq('id', params.eventId).single();
    if (!event) return { success: false, error: 'Événement introuvable' };

    const inviteUrl = `${APP_URL}/inscription?token=${invitation.invite_token}`;
    const html = await render(
      InvitationEmail({
        firstName: invitation.first_name,
        eventTitle: event.title,
        eventDates: formatEventDates(event.start_date, event.end_date),
        eventLocation: event.location || 'Lyon',
        deadline: formatDeadline(event.registration_deadline),
        inviteUrl,
        contactEmail: event.contact_email || 'contact@cdc-habitat.fr',
      })
    );
    const subject = `Vous êtes invité·e — ${event.title}`;

    const result = await resend.emails.send({ from: FROM, to: invitation.email, replyTo: REPLY_TO, subject, html });
    await supabase.from('invitations').update({ sent_at: new Date().toISOString() }).eq('id', invitation.id);
    await supabase.from('email_log').insert({
      event_id: params.eventId,
      invitation_id: invitation.id,
      email_type: 'invitation',
      to_email: invitation.email,
      subject,
      resend_id: result.data?.id || null,
      status: result.error ? 'failed' : 'sent',
      error_message: result.error?.message || null,
    });
    return { success: !result.error, error: result.error?.message };
  } catch (err: any) {
    console.error('[EMAIL] sendInvitationEmail crash:', err?.message, err?.stack);
    return { success: false, error: err.message };
  }
}

export async function sendReminderEmail(params: {
  invitationId: string;
  eventId: string;
}) {
  const supabase = createAdminClient();
  try {
    const { data: invitation } = await supabase.from('invitations').select('*').eq('id', params.invitationId).single();
    if (!invitation || invitation.registered) return { success: false, error: 'Déjà inscrit ou invitation introuvable' };
    const { data: event } = await supabase.from('events').select('*').eq('id', params.eventId).single();
    if (!event) return { success: false, error: 'Événement introuvable' };

    const inviteUrl = `${APP_URL}/inscription?token=${invitation.invite_token}`;
    const html = await render(
      ReminderEmail({
        firstName: invitation.first_name,
        eventTitle: event.title,
        eventDates: formatEventDates(event.start_date, event.end_date),
        deadline: formatDeadline(event.registration_deadline),
        inviteUrl,
        contactEmail: event.contact_email || 'contact@cdc-habitat.fr',
      })
    );
    const subject = `⏳ Relance — ${event.title}, clôture le ${formatDeadline(event.registration_deadline)}`;

    const result = await resend.emails.send({ from: FROM, to: invitation.email, replyTo: REPLY_TO, subject, html });
    await supabase.from('invitations').update({
      reminder_count: (invitation.reminder_count || 0) + 1,
      last_reminder_at: new Date().toISOString(),
    }).eq('id', invitation.id);
    await supabase.from('email_log').insert({
      event_id: params.eventId,
      invitation_id: invitation.id,
      email_type: 'reminder',
      to_email: invitation.email,
      subject,
      resend_id: result.data?.id || null,
      status: result.error ? 'failed' : 'sent',
      error_message: result.error?.message || null,
    });
    return { success: !result.error, error: result.error?.message };
  } catch (err: any) {
    console.error('[EMAIL] sendReminderEmail crash:', err?.message, err?.stack);
    return { success: false, error: err.message };
  }
}
