import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendConfirmationEmail } from '@/lib/email';

interface RegisterPayload {
  eventId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  entity: string;
  role: string;
  diet?: string;
  hotelId: string;
  transportMode: string;
  attends_thursday_morning: boolean;
  attends_thursday_afternoon: boolean;
  attends_thursday_evening: boolean;
  attends_friday_morning: boolean;
  attends_friday_afternoon: boolean;
  thursdayVisitId?: string;
  fridayVisitId?: string;
  workshopIds: string[];
}

function validatePayload(body: RegisterPayload): string | null {
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return 'Email manquant ou invalide.';
  }
  if (!body.firstName?.trim()) return 'Prénom manquant.';
  if (!body.lastName?.trim()) return 'Nom manquant.';
  if (!body.phone?.trim()) return 'Téléphone manquant.';
  if (!body.entity?.trim()) return 'Entité manquante.';
  if (!body.role?.trim()) return 'Fonction manquante.';
  if (!['train', 'plane', 'car', 'public_or_walk'].includes(body.transportMode)) {
    return 'Mode de transport invalide.';
  }
  if (!body.hotelId?.trim()) return 'Hôtel manquant.';
  const anyPresence =
    body.attends_thursday_morning ||
    body.attends_thursday_afternoon ||
    body.attends_thursday_evening ||
    body.attends_friday_morning ||
    body.attends_friday_afternoon;
  if (!anyPresence) return "Merci d'indiquer au moins un créneau de présence.";
  if (body.attends_thursday_afternoon && !body.thursdayVisitId?.trim()) {
    return 'Visite du jeudi après-midi manquante.';
  }
  if (body.attends_friday_morning && (!body.workshopIds || body.workshopIds.length !== 2)) {
    return 'Vous devez sélectionner exactement 2 ateliers.';
  }
  if (body.attends_friday_afternoon && !body.fridayVisitId?.trim()) {
    return 'Visite du vendredi après-midi manquante.';
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterPayload;

    const validationError = validatePayload(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('slug', 'rapmo-2026')
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Événement introuvable.' }, { status: 500 });
    }

    const { data: registrationId, error: rpcError } = await supabase.rpc(
      'register_participant',
      {
        p_event_id: event.id,
        p_email: body.email.trim().toLowerCase(),
        p_first_name: body.firstName.trim(),
        p_last_name: body.lastName.trim(),
        p_phone: body.phone.trim(),
        p_entity: body.entity.trim(),
        p_role: body.role.trim(),
        p_diet: body.diet?.trim() || null,
        p_hotel_id: body.hotelId,
        p_transport_mode: body.transportMode,
        p_attends_thu_morning: body.attends_thursday_morning,
        p_attends_thu_afternoon: body.attends_thursday_afternoon,
        p_attends_thu_evening: body.attends_thursday_evening,
        p_attends_fri_morning: body.attends_friday_morning,
        p_attends_fri_afternoon: body.attends_friday_afternoon,
        p_thursday_visit_id: body.thursdayVisitId || null,
        p_friday_visit_id: body.fridayVisitId || null,
        p_workshop_ids: body.workshopIds || [],
      }
    );

    if (rpcError) {
      const { code } = rpcError;
      if (code === 'P0001') {
        return NextResponse.json(
          {
            error:
              "Cette visite est complète. Veuillez retourner à l'étape précédente et choisir une autre visite.",
          },
          { status: 409 }
        );
      }
      if (code === 'P0002') {
        return NextResponse.json(
          {
            error:
              'Vous êtes déjà inscrit aux Rencontres. Pour toute modification, contactez rapmo.lyon@gmail.com.',
            alreadyRegistered: true,
          },
          { status: 409 }
        );
      }
      if (code === 'P0003') {
        return NextResponse.json(
          {
            error:
              "Votre email ne figure pas dans la liste des invités. Si c'est une erreur, contactez rapmo.lyon@gmail.com.",
          },
          { status: 403 }
        );
      }
      console.error('RPC register_participant unexpected error:', rpcError);
      return NextResponse.json(
        { error: 'Une erreur est survenue. Veuillez réessayer dans quelques instants.' },
        { status: 500 }
      );
    }

    const { data: reg, error: refError } = await supabase
      .from('registrations')
      .select('reference')
      .eq('id', registrationId as string)
      .single();

    if (refError || !reg) {
      return NextResponse.json(
        { success: true, registrationId, reference: null },
        { status: 201 }
      );
    }

    sendConfirmationEmail({ registrationId: registrationId as string, eventId: event.id })
      .catch(err => console.error('[EMAIL] sendConfirmationEmail failed:', err?.message));

    return NextResponse.json(
      { success: true, registrationId, reference: reg.reference },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register route error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur. Merci de réessayer.' },
      { status: 500 }
    );
  }
}
