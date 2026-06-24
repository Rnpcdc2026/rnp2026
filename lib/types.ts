// Types des entités de la base de données

export type Event = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  start_date: string;
  end_date: string;
  location: string | null;
  registration_deadline: string;
  contact_email: string | null;
  is_open: boolean;
};

export type Visit = {
  id: string;
  event_id: string;
  code: string;
  title: string;
  description: string | null;
  slot_label: string | null;
  slot_date: string | null;
  capacity: number;
  is_active: boolean;
  display_order: number;
};

export type Workshop = {
  id: string;
  event_id: string;
  code: string;
  title: string;
  description: string | null;
  speaker: string | null;
  slot_label: string | null;
  capacity: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
};

export type Hotel = {
  id: string;
  event_id: string;
  code: string;
  title: string;
  is_undecided: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

/** @deprecated supprimé du modèle RAPMO — remplacé par hotels + transport_mode */
export type AccommodationNight = {
  id: string;
  event_id: string;
  night_date: string;
  label: string | null;
  description: string | null;
  is_active: boolean;
};

export type Entity = {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
};

export type TransportMode = 'train' | 'plane' | 'car' | 'public_or_walk';

export type Registration = {
  id: string;
  event_id: string;
  reference: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  entity: string | null;
  role: string | null;
  diet: string | null;
  /** @deprecated remplacé par registration_visits jointure */
  visit_id: string | null;
  /** @deprecated remplacé par transport_mode */
  bus_transport: boolean;
  hotel_id: string | null;
  transport_mode: TransportMode | null;
  attends_thursday_morning: boolean;
  attends_thursday_afternoon: boolean;
  attends_thursday_evening: boolean;
  attends_friday_morning: boolean;
  attends_friday_afternoon: boolean;
  status: 'confirmed' | 'cancelled' | 'waitlist';
  confirmation_email_sent_at: string | null;
  reminder_email_sent_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type RegistrationVisit = {
  registration_id: string;
  visit_id: string;
  created_at: string;
};

export type RegistrationWithRelations = Registration & {
  visit: Visit | null;
  /** @deprecated remplacé par registration_visits */
  nights: AccommodationNight[];
  workshops: Workshop[];
  hotel?: Hotel | null;
  registration_visits?: RegistrationVisit[];
};

export type Invitation = {
  id: string;
  event_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  entity: string | null;
  invite_token: string;
  sent_at: string | null;
  opened_at: string | null;
  registered: boolean;
  reminder_count: number;
  last_reminder_at: string | null;
};

export type StatsOverview = {
  event_id: string;
  title: string;
  total_registered: number;
  total_invited: number;
  invitations_sent: number;
  bus_count: number;
};

export type StatsVisit = {
  id: string;
  title: string;
  slot_label: string | null;
  capacity: number;
  registered: number;
  remaining: number;
};

export type StatsNight = {
  id: string;
  night_date: string;
  label: string | null;
  count: number;
};
