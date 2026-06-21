import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendConfirmationEmail } from '@/lib/email';

type RegisterPayload = {
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  entity: string;
  role?: string;
  diet?: string;
  visitId: string | null;
  noVisit: boolean;
  nightIds: string[];
  workshopIds: string[];
  busTransport: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterPayload;

    if (!body.firstName || !body.lastName || !body.email || !body.entity) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants.' },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: event, error: evErr } = await supabase
      .from('events')
      .select('*')
      .eq('id', body.eventId)
      .single();
    if (evErr || !event) {
      return NextResponse.json({ error: 'Evenement introuvable.' }, { status: 404 });
    }
    if (!event.is_open) {
      return NextResponse.json(
        { error: 'Les inscriptions sont fermees.' },
        { status: 403 }
      );
    }
    if (new Date(event.registration_deadline) < new Date()) {
      return NextResponse.json(
        { error: 'La date limite d inscription est depassee.' },
        { status: 403 }
      );
    }

    const { data: existing } = await supabase
      .from('registrations')
      .select('id, reference')
      .eq('event_id', body.eventId)
      .eq('email', body.email.toLowerCase())
      .eq('status', 'confirmed')
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        {
          error: 'Une inscription existe deja pour cet email (reference ' + existing.reference + '). Contactez l organisation pour la modifier.',
        },
        { status: 409 }
      );
    }

    const { data: invitation } = await supabase
      .from('invitations')
      .select('registered')
      .eq('event_id', body.eventId)
      .eq('email', body.email.toLowerCase())
      .maybeSingle();

    if (!invitation) {
      return NextResponse.json(
        { error: "Cette adresse n'est pas autorisée. Si vous êtes invité(e), contactez rnpcdc@gmail.com." },
        { status: 403 }
      );
    }

    if (invitation.registered) {
      return NextResponse.json(
        { error: 'Vous êtes déjà inscrit(e). Pour modifier votre inscription, contactez rnpcdc@gmail.com.' },
        { status: 409 }
      );
    }

    if (body.visitId) {
      const { data: visit } = await supabase
        .from('visits')
        .select('capacity')
        .eq('id', body.visitId)
        .single();
      const { count: currentCount } = await supabase
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .eq('visit_id', body.visitId)
        .eq('status', 'confirmed');
      if (visit && currentCount !== null && currentCount >= visit.capacity) {
        return NextResponse.json(
          { error: 'Cette visite est complete. Merci d en choisir une autre.' },
          { status: 409 }
        );
      }
    }

    const { data: refData } = await supabase.rpc('generate_registration_reference');
    const reference = refData as unknown as string;

    const { data: registration, error: regErr } = await supabase
      .from('registrations')
      .insert({
        event_id: body.eventId,
        reference,
        first_name: body.firstName.trim(),
        last_name: body.lastName.trim(),
        email: body.email.toLowerCase().trim(),
        phone: body.phone?.trim() || null,
        entity: body.entity,
        role: body.role?.trim() || null,
        diet: body.diet || null,
        visit_id: body.noVisit ? null : body.visitId,
        bus_transport: body.busTransport,
      })
      .select()
      .single();

    if (regErr || !registration) {
      console.error('Insertion error:', regErr);
      return NextResponse.json(
        { error: 'Erreur lors de l enregistrement.' },
        { status: 500 }
      );
    }

    if (body.nightIds.length > 0) {
      await supabase.from('registration_nights').insert(
        body.nightIds.map((nightId) => ({
          registration_id: registration.id,
          night_id: nightId,
        }))
      );
    }

    if (body.workshopIds.length > 0) {
      await supabase.from('registration_workshops').insert(
        body.workshopIds.map((workshopId) => ({
          registration_id: registration.id,
          workshop_id: workshopId,
        }))
      );
    }

    const { error: invUpdateErr } = await supabase
      .from('invitations')
      .update({ registered: true })
      .eq('event_id', body.eventId)
      .eq('email', body.email.toLowerCase());
    if (invUpdateErr) {
      console.error('[REGISTER] Failed to update invitation registered flag:', invUpdateErr.message);
    }

    try {
      await sendConfirmationEmail({
        registrationId: registration.id,
        eventId: body.eventId,
      });
    } catch (emailErr) {
      console.error('[REGISTER] Email send failed:', emailErr);
    }

    return NextResponse.json({
      success: true,
      reference,
      registrationId: registration.id,
    });
  } catch (error) {
    console.error('Register route error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur. Merci de reessayer.' },
      { status: 500 }
    );
  }
}
