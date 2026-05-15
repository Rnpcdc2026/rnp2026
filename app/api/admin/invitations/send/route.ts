import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendInvitationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const userClient = createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { invitationIds, eventId } = await req.json() as {
      invitationIds: string[];
      eventId: string;
    };

    if (!invitationIds?.length) {
      return NextResponse.json({ error: 'Aucune invitation sélectionnée' }, { status: 400 });
    }

    // Envoi séquentiel avec petit délai pour respecter rate-limit Resend (10/s)
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const id of invitationIds) {
      const result = await sendInvitationEmail({ invitationId: id, eventId });
      if (result.success) sent++;
      else {
        failed++;
        if (result.error) errors.push(result.error);
      }
      // Throttle léger : 120ms entre envois ≈ 8/s
      await new Promise((r) => setTimeout(r, 120));
    }

    return NextResponse.json({ sent, failed, errors: errors.slice(0, 5) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
