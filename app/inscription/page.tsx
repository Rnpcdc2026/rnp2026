import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import RegistrationForm from './RegistrationForm';

export const revalidate = 0;

type SearchParams = {
  email?: string;
  firstName?: string;
  lastName?: string;
  entity?: string;
};

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', 'rapmo-2026')
    .single();

  if (!event) {
    notFound();
  }

  const [visitsRes, workshopsRes, hotelsRes, entitiesRes, registrationVisitsRes] =
    await Promise.all([
      supabase
        .from('visits')
        .select('*')
        .eq('event_id', event.id)
        .eq('is_active', true)
        .order('display_order'),
      supabase
        .from('workshops')
        .select('*')
        .eq('event_id', event.id)
        .eq('is_active', true)
        .order('display_order'),
      supabase
        .from('hotels')
        .select('*')
        .eq('event_id', event.id)
        .eq('is_active', true)
        .order('display_order'),
      supabase.from('entities').select('*').order('name'),
      supabase.from('registration_visits').select('visit_id'),
    ]);

  const visits = visitsRes.data ?? [];
  const visitIdSet = new Set(visits.map((v) => v.id));

  const occupancy = new Map<string, number>();
  for (const rv of registrationVisitsRes.data ?? []) {
    if (visitIdSet.has(rv.visit_id)) {
      occupancy.set(rv.visit_id, (occupancy.get(rv.visit_id) ?? 0) + 1);
    }
  }

  const visitsAvailability: Record<string, number> = {};
  visits.forEach((v) => {
    visitsAvailability[v.id] = Math.max(0, v.capacity - (occupancy.get(v.id) ?? 0));
  });

  return (
    <RegistrationForm
      event={event}
      visits={visits}
      workshops={workshopsRes.data ?? []}
      entities={entitiesRes.data ?? []}
      hotels={hotelsRes.data ?? []}
      visitsAvailability={visitsAvailability}
      prefill={
        searchParams.email || searchParams.firstName
          ? {
              email: searchParams.email,
              firstName: searchParams.firstName,
              lastName: searchParams.lastName,
              entity: searchParams.entity,
            }
          : null
      }
    />
  );
}
