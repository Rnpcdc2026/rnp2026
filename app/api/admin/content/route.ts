import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// Tables autorisées + champs autorisés par table (anti-injection)
const ALLOWED: Record<string, string[]> = {
  visits: ['code', 'title', 'description', 'slot_label', 'slot_date', 'capacity', 'is_active', 'display_order'],
  workshops: ['code', 'title', 'description', 'speaker', 'slot_label', 'capacity', 'is_active', 'display_order'],
  accommodation_nights: ['night_date', 'label', 'description', 'is_active'],
  events: ['title', 'subtitle', 'start_date', 'end_date', 'location', 'registration_deadline', 'contact_email', 'is_open'],
};

async function requireAuth() {
  const userClient = createClient();
  const { data: { user } } = await userClient.auth.getUser();
  return user;
}

function pickFields(table: string, payload: any) {
  const allowed = ALLOWED[table];
  if (!allowed) return null;
  const result: any = {};
  for (const key of allowed) {
    if (key in payload) result[key] = payload[key];
  }
  return result;
}

// ─── POST : créer ────────────────────────────────────────
export async function POST(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { table, eventId, data } = await req.json();
  if (!ALLOWED[table]) return NextResponse.json({ error: 'Table non autorisée' }, { status: 400 });

  const fields = pickFields(table, data);
  if (!fields) return NextResponse.json({ error: 'Champs invalides' }, { status: 400 });

  // event_id requis sauf pour la table events elle-même
  if (table !== 'events') fields.event_id = eventId;

  const supabase = createAdminClient();
  const { data: row, error } = await supabase.from(table).insert(fields).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, row });
}

// ─── PATCH : modifier ────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { table, id, data } = await req.json();
  if (!ALLOWED[table]) return NextResponse.json({ error: 'Table non autorisée' }, { status: 400 });

  const fields = pickFields(table, data);
  if (!fields) return NextResponse.json({ error: 'Champs invalides' }, { status: 400 });

  const supabase = createAdminClient();
  const { data: row, error } = await supabase.from(table).update(fields).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, row });
}

// ─── DELETE : supprimer ──────────────────────────────────
export async function DELETE(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const table = searchParams.get('table');
  const id = searchParams.get('id');
  if (!table || !ALLOWED[table]) return NextResponse.json({ error: 'Table non autorisée' }, { status: 400 });
  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
