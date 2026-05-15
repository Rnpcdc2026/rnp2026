import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  // Vérifier qu'un admin est connecté
  const userClient = createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { eventId, contacts } = await req.json() as {
      eventId: string;
      contacts: { email: string; first_name?: string; last_name?: string; entity?: string }[];
    };

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json({ error: 'Format invalide' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Préparer les rows
    const rows = contacts
      .filter((c) => c.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))
      .map((c) => ({
        event_id: eventId,
        email: c.email.toLowerCase().trim(),
        first_name: c.first_name?.trim() || null,
        last_name: c.last_name?.trim() || null,
        entity: c.entity?.trim() || null,
      }));

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Aucun email valide' }, { status: 400 });
    }

    // Insert avec gestion des doublons (UNIQUE event_id, email)
    const { data, error } = await supabase
      .from('invitations')
      .upsert(rows, { onConflict: 'event_id,email', ignoreDuplicates: true })
      .select();

    if (error) {
      console.error('Import error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      total: rows.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
