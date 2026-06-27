'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Event, Visit, Workshop, Entity, Hotel, TransportMode } from '@/lib/types';
import styles from './inscription.module.css';

type Invitee = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  entity: string;
};

type Props = {
  event: Event;
  visits: Visit[];
  workshops: Workshop[];
  entities: Entity[];
  hotels: Hotel[];
  visitsAvailability: Record<string, number>;
  prefill?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    entity?: string;
  } | null;
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  entity: string;
  role: string;
  diet: string;
  attends_thursday_morning: boolean;
  attends_thursday_afternoon: boolean;
  attends_thursday_evening: boolean;
  attends_friday_morning: boolean;
  attends_friday_afternoon: boolean;
  thursdayVisitId: string | null;
  fridayVisitId: string | null;
  workshopIds: string[];
  hotelId: string | null;
  transportMode: TransportMode | null;
};

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  entity: '',
  role: '',
  diet: '',
  attends_thursday_morning: false,
  attends_thursday_afternoon: false,
  attends_thursday_evening: false,
  attends_friday_morning: false,
  attends_friday_afternoon: false,
  thursdayVisitId: null,
  fridayVisitId: null,
  workshopIds: [],
  hotelId: null,
  transportMode: null,
};

type VisitCardProps = {
  visit: Visit;
  isSelected: boolean;
  remaining: number | null;
  onClick: () => void;
};

function VisitCard({ visit, isSelected, remaining, onClick }: VisitCardProps) {
  const [imgError, setImgError] = useState(false);
  const isFull = remaining !== null && remaining <= 0;

  return (
    <div
      className={`${styles.visitCard} ${isSelected ? styles.visitCardSelected : ''} ${isFull ? styles.visitCardDisabled : ''}`}
      onClick={isFull ? undefined : onClick}
    >
      {imgError ? (
        <div className={styles.visitImageFallback}>{visit.title}</div>
      ) : (
        <img
          className={styles.visitImage}
          src={`/visits/${visit.code}.jpg`}
          alt={visit.title}
          onError={() => setImgError(true)}
        />
      )}
      <div className={styles.visitCardBody}>
        <div className={styles.visitTitle}>{visit.title}</div>
        {visit.description && (
          <div className={styles.visitDesc}>{visit.description}</div>
        )}
        {remaining !== null && (
          <div className={`${styles.visitCapacity} ${isFull ? styles.visitCapacityFull : ''}`}>
            {isFull ? 'Complet' : `${remaining} places restantes`}
          </div>
        )}
      </div>
    </div>
  );
}

const PRESENCE_LABELS: Record<string, string> = {
  attends_thursday_morning: 'Jeudi matin',
  attends_thursday_afternoon: 'Jeudi après-midi',
  attends_thursday_evening: 'Jeudi soir',
  attends_friday_morning: 'Vendredi matin',
  attends_friday_afternoon: 'Vendredi après-midi',
};

const TRANSPORT_OPTIONS: { value: TransportMode; label: string }[] = [
  { value: 'train', label: 'Train' },
  { value: 'plane', label: 'Avion' },
  { value: 'car', label: 'Voiture personnelle' },
  { value: 'public_or_walk', label: 'Transport en commun / à pied' },
];

export default function RegistrationForm({
  event,
  visits,
  workshops,
  entities,
  hotels,
  visitsAvailability,
  prefill,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [inviteesLoading, setInviteesLoading] = useState(true);
  const [inviteesError, setInviteesError] = useState<string | null>(null);
  const [selectedInviteeId, setSelectedInviteeId] = useState('');
  const [showHelpMessage, setShowHelpMessage] = useState(false);
  const [step2Errors, setStep2Errors] = useState<{
    presence?: string;
    thursdayVisit?: string;
    workshops?: string;
    fridayVisit?: string;
  }>({});
  const [step3Errors, setStep3Errors] = useState<{
    hotel?: string;
    transport?: string;
  }>({});

  const thursdayVisits = visits.filter((v) => v.slot_label === 'jeudi-aprem');
  const fridayVisits = visits.filter((v) => v.slot_label === 'vendredi-aprem');
  const fridayWorkshops = workshops.filter((w) => w.slot_label === 'vendredi-matin');

  const visibleHotels = hotels
    .filter((h) => h.code !== 'hotel-9-placeholder')
    .sort((a, b) => {
      if (a.is_undecided && !b.is_undecided) return -1;
      if (!a.is_undecided && b.is_undecided) return 1;
      return (a.display_order ?? 999) - (b.display_order ?? 999);
    });

  const getVisitTitle = (id: string) => visits.find((v) => v.id === id)?.title ?? '';
  const getWorkshopTitle = (id: string) => workshops.find((w) => w.id === id)?.title ?? '';
  const getHotelName = (id: string | null) => hotels.find((h) => h.id === id)?.title ?? '';
  const getTransportLabel = (mode: TransportMode | null) =>
    TRANSPORT_OPTIONS.find((o) => o.value === mode)?.label ?? '';

  const update =<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateStep1 = () => {
    const errors: { invitee?: string; phone?: string; role?: string } = {};
    if (!selectedInviteeId) {
      errors.invitee = 'Merci de sélectionner votre nom dans la liste ci-dessus.';
    }
    if (!form.phone.trim()) {
      errors.phone = 'Merci de renseigner votre numéro de téléphone.';
    }
    if (!form.role.trim()) {
      errors.role = "Merci d'indiquer votre fonction.";
    }
    return errors;
  };

  const validateStep2 = () => {
    const errors: typeof step2Errors = {};
    const anyPresence =
      form.attends_thursday_morning ||
      form.attends_thursday_afternoon ||
      form.attends_thursday_evening ||
      form.attends_friday_morning ||
      form.attends_friday_afternoon;
    if (!anyPresence) {
      errors.presence = "Merci d'indiquer au moins un créneau de présence aux Rencontres.";
    }
    if (form.attends_thursday_afternoon && !form.thursdayVisitId) {
      errors.thursdayVisit = 'Merci de choisir une visite pour le jeudi après-midi.';
    }
    if (form.attends_friday_morning && form.workshopIds.length !== 2) {
      errors.workshops = 'Merci de sélectionner exactement 2 ateliers pour le vendredi matin.';
    }
    if (form.attends_friday_afternoon && !form.fridayVisitId) {
      errors.fridayVisit = 'Merci de choisir une visite pour le vendredi après-midi.';
    }
    return errors;
  };

  const validateStep3 = () => {
    const errors: typeof step3Errors = {};
    if (!form.hotelId) {
      errors.hotel = 'Merci de sélectionner un hôtel.';
    }
    if (!form.transportMode) {
      errors.transport = "Merci d'indiquer votre mode de transport.";
    }
    return errors;
  };

  useEffect(() => {
    fetch('/api/invitees')
      .then((res) => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then((data: Invitee[]) => {
        setInvitees(data);
        setInviteesLoading(false);
      })
      .catch(() => {
        setInviteesError(
          'Impossible de charger la liste des invités. Rafraîchissez la page ou contactez rapmo.lyon@gmail.com.'
        );
        setInviteesLoading(false);
      });
  }, []);

  useEffect(() => {
    if (Object.keys(step2Errors).length > 0) setStep2Errors(validateStep2());
    if (Object.keys(step3Errors).length > 0) setStep3Errors(validateStep3());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const handleInviteeSelect = (id: string) => {
    setSelectedInviteeId(id);
    setShowHelpMessage(false);
    if (!id) {
      update('firstName', '');
      update('lastName', '');
      update('email', '');
      update('entity', '');
      return;
    }
    const inv = invitees.find((i) => i.id === id);
    if (inv) {
      update('firstName', inv.first_name);
      update('lastName', inv.last_name);
      update('email', inv.email);
      update('entity', inv.entity);
    }
  };

  const formatDateFr = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  // TODO R3.3: remplacer par selectedThursdayVisit et selectedFridayVisit
  // const selectedVisit = visits.find((v) => v.id === form.visitId) || null;
  // TODO R3.4: supprimé, plus de nuitées
  // const selectedNights = nights.filter((n) => form.nightIds.includes(n.id));

  const nextStep = (n: number) => {
    setError(null);
    if (n === 2) {
      const errors = validateStep1();
      if (errors.invitee) { setError(errors.invitee); return; }
      if (errors.phone) { setError(errors.phone); return; }
      if (errors.role) { setError(errors.role); return; }
    }
    if (n === 3) {
      const errors = validateStep2();
      if (Object.keys(errors).length > 0) {
        setStep2Errors(errors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setStep2Errors({});
    }
    if (n === 4) {
      const errors = validateStep3();
      if (Object.keys(errors).length > 0) {
        setStep3Errors(errors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setStep3Errors({});
    }
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async () => {
    setError(null);

    const s1Errors = validateStep1();
    if (s1Errors.invitee || s1Errors.phone || s1Errors.role) {
      setError(s1Errors.invitee ?? s1Errors.phone ?? s1Errors.role ?? '');
      setStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const s2Errors = validateStep2();
    if (Object.keys(s2Errors).length > 0) {
      setStep2Errors(s2Errors);
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const s3Errors = validateStep3();
    if (Object.keys(s3Errors).length > 0) {
      setStep3Errors(s3Errors);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue lors de l'inscription.");
        setSubmitting(false);
        return;
      }
      setReference(data.reference);
      setStep(4);
    } catch (e) {
      setError("Erreur réseau. Merci de réessayer.");
      setSubmitting(false);
    }
  };

  const restart = () => {
    setForm(initialFormData);
    setReference(null);
    setStep(1);
    router.refresh();
  };

  const fullName = `${form.firstName} ${form.lastName}`.trim();

  const SummaryAside = () => (
    <aside className={styles.summary}>
      <div className={styles.summaryTitle}>Mon inscription</div>
      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>Participant</span>
        <span className={`${styles.summaryValue} ${!fullName ? styles.empty : ''}`}>
          {fullName || 'À renseigner'}
        </span>
      </div>
      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>Entité</span>
        <span className={`${styles.summaryValue} ${!form.entity ? styles.empty : ''}`}>
          {form.entity || '—'}
        </span>
      </div>
      {/* TODO R3.5: row Visite à réécrire (thursdayVisitId + fridayVisitId)
      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>Visite</span>
        <span className={`${styles.summaryValue} ${!selectedVisit && !form.noVisit ? styles.empty : ''}`}>
          {selectedVisit ? `${selectedVisit.title}` : form.noVisit ? 'Aucune' : '—'}
        </span>
      </div>
      */}
      {/* TODO R3.5: row Nuitées supprimé — remplacer par row Hôtel
      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>Nuitées</span>
        <span className={`${styles.summaryValue} ${selectedNights.length === 0 ? styles.empty : ''}`}>
          {selectedNights.length === 0
            ? step >= 3 ? 'Aucune' : '—'
            : selectedNights.map((n) => n.night_date.slice(8, 10)).join(' & ') + ' oct.'}
        </span>
      </div>
      */}
      <div className={styles.summaryDeadline}>
        Clôture des inscriptions le{' '}
        <strong>
          {new Date(event.registration_deadline).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </strong>
        . Une confirmation vous sera envoyée par email.
      </div>
      <a
        href="/programme"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.summaryAccessLink}
      >
        Voir le programme →
      </a>
      <a
        href="/acces"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.summaryLink}
      >
        Voir le plan d&apos;accès →
      </a>
    </aside>
  );

  return (
    <main>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>
          <Image
            src="/cdc-habitat-logo.jpg"
            alt="CDC Habitat"
            width={200}
            height={68}
            priority
            className={styles.logo}
          />
        </a>
        <div className={styles.headerMeta}>
          Rencontres Annuelles Patrimoine et Maîtrise d'Ouvrage <strong>2026</strong>
        </div>
      </header>

      <nav className={styles.progress}>
        {['Identité', 'Visites lyonnaises', 'Hébergement', 'Confirmation'].map((label, i) => {
          const stepNum = i + 1;
          const cls =
            step === stepNum
              ? styles.progressStepActive
              : step > stepNum
              ? styles.progressStepDone
              : '';
          return (
            <div key={i} className={`${styles.progressStep} ${cls}`}>
              <span className={styles.stepNum}>{stepNum}</span>
              <span className={styles.stepLabel}>{label}</span>
            </div>
          );
        })}
      </nav>

      <section className={styles.formWrap}>
        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* STEP 1 — Identité */}
        {step === 1 && (
          <div className={styles.stepPanel}>
            <div>
              <div className={styles.panelIntro}>
                <h2>Quelques mots sur vous.</h2>
                <p>
                  Ces informations nous permettent de préparer votre venue et de personnaliser
                  votre badge d&apos;accès.
                </p>
              </div>

              <p className={styles.requiredNotice}>
                Les champs marqués d&apos;un <span className={styles.required}>*</span> sont
                obligatoires.
              </p>

              <form className={styles.form} onSubmit={(e) => e.preventDefault()}>

                {/* Dropdown invité */}
                <div className={`${styles.fieldGroup} ${styles.full}`}>
                  <div className={styles.field}>
                    <label>Sélectionnez votre nom <span className={styles.required}>*</span></label>
                    <select
                      value={selectedInviteeId}
                      onChange={(e) => handleInviteeSelect(e.target.value)}
                      disabled={inviteesLoading || !!inviteesError}
                    >
                      {inviteesLoading ? (
                        <option value="" disabled>Chargement de la liste…</option>
                      ) : (
                        <>
                          <option value="">— Sélectionnez votre nom —</option>
                          {invitees.map((inv) => (
                            <option key={inv.id} value={inv.id}>
                              {inv.first_name} {inv.last_name} — {inv.entity}
                            </option>
                          ))}
                        </>
                      )}
                    </select>

                    {inviteesError && (
                      <p style={{ fontSize: 13, color: '#c0392b', marginTop: 6 }}>
                        {inviteesError}
                      </p>
                    )}

                    {!inviteesError && !inviteesLoading && (
                      <div style={{ marginTop: 8 }}>
                        <button
                          type="button"
                          onClick={() => setShowHelpMessage((v) => !v)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            fontSize: 13,
                            color: '#888',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          Mon nom n&apos;apparaît pas dans la liste
                        </button>
                        {showHelpMessage && (
                          <div
                            style={{
                              marginTop: 8,
                              padding: '10px 14px',
                              backgroundColor: '#f5f5f5',
                              borderRadius: 6,
                              fontSize: 13,
                              color: '#4C4C4B',
                              lineHeight: 1.5,
                            }}
                          >
                            Si vous êtes invité(e) et que votre nom n&apos;apparaît pas dans
                            la liste, merci de contacter l&apos;organisation à{' '}
                            <a href="mailto:rapmo.lyon@gmail.com" style={{ color: '#4C4C4B' }}>
                              rapmo.lyon@gmail.com
                            </a>
                            .
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Champs identité — verrouillés, préremplis par le dropdown */}
                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label>Prénom <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      value={form.firstName}
                      readOnly
                      style={selectedInviteeId ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Nom <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      value={form.lastName}
                      readOnly
                      style={selectedInviteeId ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                    />
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label>Email professionnel <span className={styles.required}>*</span></label>
                    <input
                      type="email"
                      value={form.email}
                      readOnly
                      style={selectedInviteeId ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Téléphone <span className={styles.required}>*</span></label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="06 ··· ··· ···"
                    />
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label>Entité / Filiale <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      value={form.entity}
                      readOnly
                      style={selectedInviteeId ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Fonction <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      value={form.role}
                      onChange={(e) => update('role', e.target.value)}
                      placeholder="Votre poste actuel"
                      required
                    />
                  </div>
                </div>
              </form>
            </div>

            <SummaryAside />

            <div className={styles.nav}>
              <span />
              <button className={styles.btnPrimary} onClick={() => nextStep(2)}>
                Continuer
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 8h12M9 3l5 5-5 5" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Présence */}
        {step === 2 && (
          <div className={styles.stepPanel}>
            <div>
              <div className={styles.panelIntro}>
                <h2>Votre présence aux Rencontres.</h2>
                <p>
                  Indiquez les créneaux auxquels vous participerez. Ces informations nous
                  permettent d&apos;organiser les visites et les ateliers.
                </p>
              </div>

              {step2Errors.presence && (
                <p className={styles.errorMessage}>{step2Errors.presence}</p>
              )}

              <div className={styles.sessionList}>
                <label className={`${styles.sessionItem} ${form.attends_thursday_morning ? styles.sessionItemChecked : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.attends_thursday_morning}
                    onChange={(e) => update('attends_thursday_morning', e.target.checked)}
                  />
                  <div>
                    <div className={styles.sessionLabel}>Jeudi 8 octobre — matin</div>
                    <div className={styles.sessionDesc}>RAPMO + cocktail déjeunatoire au Sucre</div>
                  </div>
                </label>

                <label className={`${styles.sessionItem} ${form.attends_thursday_afternoon ? styles.sessionItemChecked : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.attends_thursday_afternoon}
                    onChange={(e) => update('attends_thursday_afternoon', e.target.checked)}
                  />
                  <div>
                    <div className={styles.sessionLabel}>Jeudi 8 octobre — après-midi</div>
                    <div className={styles.sessionDesc}>Visites des sites CDC Habitat</div>
                  </div>
                </label>

                <label className={`${styles.sessionItem} ${form.attends_thursday_evening ? styles.sessionItemChecked : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.attends_thursday_evening}
                    onChange={(e) => update('attends_thursday_evening', e.target.checked)}
                  />
                  <div>
                    <div className={styles.sessionLabel}>Jeudi 8 octobre — soir</div>
                    <div className={styles.sessionDesc}>Dîner de gala au Selcius</div>
                  </div>
                </label>

                <label className={`${styles.sessionItem} ${form.attends_friday_morning ? styles.sessionItemChecked : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.attends_friday_morning}
                    onChange={(e) => update('attends_friday_morning', e.target.checked)}
                  />
                  <div>
                    <div className={styles.sessionLabel}>Vendredi 9 octobre — matin</div>
                    <div className={styles.sessionDesc}>Ateliers thématiques, plénière et cocktail</div>
                  </div>
                </label>

                <label className={`${styles.sessionItem} ${form.attends_friday_afternoon ? styles.sessionItemChecked : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.attends_friday_afternoon}
                    onChange={(e) => update('attends_friday_afternoon', e.target.checked)}
                  />
                  <div>
                    <div className={styles.sessionLabel}>Vendredi 9 octobre — après-midi</div>
                    <div className={styles.sessionDesc}>Visites culturelles à Lyon</div>
                  </div>
                </label>
              </div>

              {(form.attends_thursday_afternoon || form.attends_friday_morning || form.attends_friday_afternoon) && (
                <div className={styles.choicesContainer}>
                  <div className={styles.choicesTitle}>Vos choix de visites et d&apos;ateliers</div>
                  {form.attends_thursday_afternoon && (
                    <div className={styles.subSection}>
                      <div className={styles.subSectionTitle}>
                        Visites du jeudi après-midi <span>(1 à choisir)</span>
                      </div>
                      {step2Errors.thursdayVisit && (
                        <p className={styles.errorMessage}>{step2Errors.thursdayVisit}</p>
                      )}
                      <div className={styles.visitGrid}>
                        {thursdayVisits.map((v) => (
                          <VisitCard
                            key={v.id}
                            visit={v}
                            isSelected={form.thursdayVisitId === v.id}
                            remaining={null}
                            onClick={() =>
                              update('thursdayVisitId', form.thursdayVisitId === v.id ? null : v.id)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {form.attends_friday_morning && (
                    <div className={styles.subSection}>
                      <div className={styles.subSectionTitle}>
                        Ateliers du vendredi matin <span>(exactement 2 à choisir)</span>
                      </div>
                      <div className={styles.workshopCounter}>
                        {form.workshopIds.length}/2 ateliers sélectionnés
                      </div>
                      {step2Errors.workshops && (
                        <p className={styles.errorMessage}>{step2Errors.workshops}</p>
                      )}
                      <div className={styles.workshopList}>
                        {fridayWorkshops.map((w) => {
                          const isSelected = form.workshopIds.includes(w.id);
                          const isDisabled = !isSelected && form.workshopIds.length >= 2;
                          return (
                            <label
                              key={w.id}
                              className={`${styles.workshopItem} ${isSelected ? styles.workshopItemSelected : ''} ${isDisabled ? styles.workshopItemDisabled : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  if (isSelected) {
                                    update('workshopIds', form.workshopIds.filter((id) => id !== w.id));
                                  } else if (form.workshopIds.length < 2) {
                                    update('workshopIds', [...form.workshopIds, w.id]);
                                  }
                                }}
                              />
                              <div>
                                <div className={styles.visitTitle}>{w.title}</div>
                                {w.description && <div className={styles.visitDesc}>{w.description}</div>}
                                {w.speaker && <div className={styles.workshopSpeaker}>{w.speaker}</div>}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {form.attends_friday_afternoon && (
                    <div className={styles.subSection}>
                      <div className={styles.subSectionTitle}>
                        Visites du vendredi après-midi <span>(1 à choisir)</span>
                      </div>
                      {step2Errors.fridayVisit && (
                        <p className={styles.errorMessage}>{step2Errors.fridayVisit}</p>
                      )}
                      <div className={styles.visitGrid}>
                        {fridayVisits.map((v) => {
                          const remaining = v.capacity < 999
                            ? (visitsAvailability[v.id] ?? v.capacity)
                            : null;
                          return (
                            <VisitCard
                              key={v.id}
                              visit={v}
                              isSelected={form.fridayVisitId === v.id}
                              remaining={remaining}
                              onClick={() =>
                                update('fridayVisitId', form.fridayVisitId === v.id ? null : v.id)
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <SummaryAside />

            <div className={styles.nav}>
              <button className={styles.btnGhost} onClick={() => setStep(1)}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 8H2M7 3L2 8l5 5" />
                </svg>
                Retour
              </button>
              <button className={styles.btnPrimary} onClick={() => nextStep(3)}>
                Continuer
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 8h12M9 3l5 5-5 5" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Logistique */}
        {step === 3 && (
          <div className={styles.stepPanel}>
            <div>
              <div className={styles.panelIntro}>
                <h2>Logistique.</h2>
                <p>
                  Indiquez vos préférences d&apos;hébergement et de transport afin que nous
                  puissions organiser au mieux votre venue.
                </p>
              </div>

              {/* Régime alimentaire */}
              <div className={styles.logisticSection}>
                <h3 className={styles.logisticSectionTitle}>Régime alimentaire</h3>
                <p className={styles.fieldHelp}>
                  Indiquez vos contraintes ou préférences (végétarien, vegan, allergies,
                  intolérances…). Laissez vide si aucune.
                </p>
                <textarea
                  className={styles.textareaField}
                  value={form.diet}
                  onChange={(e) => update('diet', e.target.value)}
                  rows={3}
                  placeholder="Ex. Végétarien, allergie aux fruits à coque"
                />
              </div>

              {/* Hébergement */}
              <div className={styles.logisticSection}>
                <h3 className={styles.logisticSectionTitle}>Hébergement</h3>
                <p className={styles.fieldHelp}>
                  Indiquez l&apos;hôtel dans lequel vous avez réservé votre hébergement pour
                  la nuit du jeudi 8 au vendredi 9 octobre. Cette information nous sert
                  uniquement à la coordination logistique — chaque participant gère sa propre
                  réservation.
                </p>
                <select
                  className={styles.selectField}
                  value={form.hotelId ?? ''}
                  onChange={(e) => update('hotelId', e.target.value || null)}
                >
                  <option value="">— Sélectionnez un hôtel —</option>
                  {visibleHotels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title}
                    </option>
                  ))}
                </select>
                {step3Errors.hotel && (
                  <p className={styles.errorMessage}>{step3Errors.hotel}</p>
                )}
              </div>

              {/* Mode de transport */}
              <div className={styles.logisticSection}>
                <h3 className={styles.logisticSectionTitle}>Mode de transport</h3>
                <p className={styles.fieldHelp}>Comment comptez-vous rejoindre Lyon ?</p>
                <div className={styles.sessionList}>
                  {TRANSPORT_OPTIONS.map(({ value, label }) => (
                    <label
                      key={value}
                      className={`${styles.sessionItem} ${
                        form.transportMode === value ? styles.sessionItemChecked : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="transportMode"
                        value={value}
                        checked={form.transportMode === value}
                        onChange={() => update('transportMode', value)}
                      />
                      <div>
                        <div className={styles.sessionLabel}>{label}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {step3Errors.transport && (
                  <p className={styles.errorMessage}>{step3Errors.transport}</p>
                )}
              </div>
            </div>

            <SummaryAside />

            <div className={styles.nav}>
              <button className={styles.btnGhost} onClick={() => setStep(2)}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 8H2M7 3L2 8l5 5" />
                </svg>
                Retour
              </button>
              <button className={styles.btnPrimary} onClick={() => nextStep(4)}>
                Continuer
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 8h12M9 3l5 5-5 5" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Récapitulatif */}
        {step === 4 && !reference && (
          <div className={styles.stepPanel}>
            <div>
              <div className={styles.panelIntro}>
                <h2>Vérifiez vos informations.</h2>
                <p>
                  Relisez votre inscription avant de la soumettre. Vous pouvez modifier
                  chaque section en cliquant sur &quot;Modifier&quot;.
                </p>
              </div>

              {/* Bloc Identité */}
              <div className={styles.recapBlock}>
                <div className={styles.recapBlockHeader}>
                  <h3>Vos informations</h3>
                  <button className={styles.recapEditButton} onClick={() => setStep(1)}>
                    Modifier
                  </button>
                </div>
                <div className={styles.recapRow}>
                  <span className={styles.recapLabel}>Participant</span>
                  <span className={styles.recapValue}>{fullName}</span>
                </div>
                {form.email && (
                  <div className={styles.recapRow}>
                    <span className={styles.recapLabel}>Email</span>
                    <span className={styles.recapValue}>{form.email}</span>
                  </div>
                )}
                {form.entity && (
                  <div className={styles.recapRow}>
                    <span className={styles.recapLabel}>Entité</span>
                    <span className={styles.recapValue}>{form.entity}</span>
                  </div>
                )}
                {form.role && (
                  <div className={styles.recapRow}>
                    <span className={styles.recapLabel}>Fonction</span>
                    <span className={styles.recapValue}>{form.role}</span>
                  </div>
                )}
                {form.phone && (
                  <div className={styles.recapRow}>
                    <span className={styles.recapLabel}>Téléphone</span>
                    <span className={styles.recapValue}>{form.phone}</span>
                  </div>
                )}
              </div>

              {/* Bloc Présence */}
              <div className={styles.recapBlock}>
                <div className={styles.recapBlockHeader}>
                  <h3>Votre présence aux Rencontres</h3>
                  <button className={styles.recapEditButton} onClick={() => setStep(2)}>
                    Modifier
                  </button>
                </div>
                <div className={styles.recapSubSection}>
                  <div className={styles.recapSubSectionTitle}>Créneaux de présence</div>
                  <ul className={styles.recapList}>
                    {(
                      [
                        [form.attends_thursday_morning, 'Jeudi matin'],
                        [form.attends_thursday_afternoon, 'Jeudi après-midi'],
                        [form.attends_thursday_evening, 'Jeudi soir'],
                        [form.attends_friday_morning, 'Vendredi matin'],
                        [form.attends_friday_afternoon, 'Vendredi après-midi'],
                      ] as [boolean, string][]
                    )
                      .filter(([checked]) => checked)
                      .map(([, label]) => <li key={label}>{label}</li>)}
                  </ul>
                </div>
                {form.attends_thursday_afternoon && form.thursdayVisitId && (
                  <div className={styles.recapSubSection}>
                    <div className={styles.recapSubSectionTitle}>
                      Visite du jeudi après-midi
                    </div>
                    <p className={styles.recapValue}>
                      {getVisitTitle(form.thursdayVisitId)}
                    </p>
                  </div>
                )}
                {form.attends_friday_morning && form.workshopIds.length === 2 && (
                  <div className={styles.recapSubSection}>
                    <div className={styles.recapSubSectionTitle}>
                      Ateliers du vendredi matin
                    </div>
                    <ul className={styles.recapList}>
                      {form.workshopIds.map((id) => (
                        <li key={id}>{getWorkshopTitle(id)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {form.attends_friday_afternoon && form.fridayVisitId && (
                  <div className={styles.recapSubSection}>
                    <div className={styles.recapSubSectionTitle}>
                      Visite du vendredi après-midi
                    </div>
                    <p className={styles.recapValue}>
                      {getVisitTitle(form.fridayVisitId)}
                    </p>
                  </div>
                )}
              </div>

              {/* Bloc Logistique */}
              <div className={styles.recapBlock}>
                <div className={styles.recapBlockHeader}>
                  <h3>Logistique</h3>
                  <button className={styles.recapEditButton} onClick={() => setStep(3)}>
                    Modifier
                  </button>
                </div>
                {form.diet && (
                  <div className={styles.recapRow}>
                    <span className={styles.recapLabel}>Régime alimentaire</span>
                    <span className={styles.recapValue}>{form.diet}</span>
                  </div>
                )}
                {form.hotelId && (
                  <div className={styles.recapRow}>
                    <span className={styles.recapLabel}>Hébergement</span>
                    <span className={styles.recapValue}>{getHotelName(form.hotelId)}</span>
                  </div>
                )}
                {form.transportMode && (
                  <div className={styles.recapRow}>
                    <span className={styles.recapLabel}>Transport</span>
                    <span className={styles.recapValue}>
                      {getTransportLabel(form.transportMode)}
                    </span>
                  </div>
                )}
              </div>

              <p className={styles.rgpdNotice}>
                Vos données seront utilisées uniquement dans le cadre de l&apos;organisation
                du séminaire RAPMO 2026 et conservées par CDC Habitat conformément au RGPD.
                Pour toute question : rapmo.lyon@gmail.com.
              </p>
            </div>

            <SummaryAside />

            <div className={styles.nav}>
              <button className={styles.btnGhost} onClick={() => setStep(3)}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 8H2M7 3L2 8l5 5" />
                </svg>
                Retour
              </button>
              <button className={styles.btnPrimary} onClick={submit} disabled={submitting}>
                {submitting ? 'Enregistrement…' : 'Valider mon inscription'}
                {!submitting && (
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 8l4 4 8-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Confirmation */}
        {step === 4 && reference && (
          <div className={styles.confirmPanel}>
            <div className={styles.confirmMark}>
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M6 16l7 7 13-14" />
              </svg>
            </div>
            <h2>Inscription confirmée.</h2>
            <p>
              Un email récapitulatif vient de vous être envoyé à <strong>{form.email}</strong>.
              Vous recevrez le programme détaillé et les informations pratiques début septembre.
            </p>

            <div className={styles.confirmRecap}>
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>Participant</span>
                <span className={styles.confirmValue}>{fullName}</span>
              </div>
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>Entité</span>
                <span className={styles.confirmValue}>{form.entity}</span>
              </div>
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>Référence</span>
                <span className={styles.confirmValue}>{reference}</span>
              </div>
            </div>

            <div style={{ marginTop: 40 }}>
              <button className={styles.btnGhost} onClick={restart}>
                Inscrire un autre participant
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
