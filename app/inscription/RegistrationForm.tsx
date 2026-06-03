'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Event, Visit, AccommodationNight, Workshop, Entity } from '@/lib/types';
import styles from './inscription.module.css';

type Props = {
  event: Event;
  visits: Visit[];
  nights: AccommodationNight[];
  workshops: Workshop[];
  entities: Entity[];
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
  visitId: string | null;
  noVisit: boolean;
  nightIds: string[];
  workshopIds: string[];
  busTransport: boolean;
};

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  entity: '',
  role: '',
  diet: '',
  visitId: null,
  noVisit: false,
  nightIds: [],
  workshopIds: [],
  busTransport: false,
};

export default function RegistrationForm({
  event,
  visits,
  nights,
  workshops,
  entities,
  visitsAvailability,
  prefill,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    ...initialFormData,
    firstName: prefill?.firstName || '',
    lastName: prefill?.lastName || '',
    email: prefill?.email || '',
    entity: prefill?.entity || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const formatDateFr = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const selectedVisit = visits.find((v) => v.id === form.visitId) || null;
  const selectedNights = nights.filter((n) => form.nightIds.includes(n.id));

  const nextStep = (n: number) => {
    setError(null);
    if (n === 2) {
      if (!form.firstName || !form.lastName || !form.email || !form.entity) {
        setError('Merci de renseigner les champs obligatoires (prénom, nom, email, entité).');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setError('Email invalide.');
        return;
      }
    }
    if (n === 3 && !form.visitId && !form.noVisit) {
      setError('Merci de sélectionner une visite ou de cocher "Je ne participerai pas".');
      return;
    }
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
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
      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>Visite</span>
        <span className={`${styles.summaryValue} ${!selectedVisit && !form.noVisit ? styles.empty : ''}`}>
          {selectedVisit ? `${selectedVisit.title}` : form.noVisit ? 'Aucune' : '—'}
        </span>
      </div>
      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>Nuitées</span>
        <span className={`${styles.summaryValue} ${selectedNights.length === 0 ? styles.empty : ''}`}>
          {selectedNights.length === 0
            ? step >= 3 ? 'Aucune' : '—'
            : selectedNights.map((n) => n.night_date.slice(8, 10)).join(' & ') + ' oct.'}
        </span>
      </div>
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
          Rencontre Nationale Patrimoine <strong>2026</strong>
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
                  votre badge d'accès.
                </p>
              </div>

              <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label>Prénom *</label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => update('firstName', e.target.value)}
                      placeholder="Marie"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Nom *</label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => update('lastName', e.target.value)}
                      placeholder="Dupont"
                      required
                    />
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.field}>
                    <label>Email professionnel *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="prenom.nom@cdc-habitat.fr"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Téléphone</label>
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
                    <label>Entité / Filiale *</label>
                    <select
                      value={form.entity}
                      onChange={(e) => update('entity', e.target.value)}
                      required
                    >
                      <option value="">Sélectionner...</option>
                      {entities.map((ent) => (
                        <option key={ent.id} value={ent.name}>
                          {ent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Fonction</label>
                    <input
                      type="text"
                      value={form.role}
                      onChange={(e) => update('role', e.target.value)}
                      placeholder="Votre poste actuel"
                    />
                  </div>
                </div>
                <div className={`${styles.fieldGroup} ${styles.full}`}>
                  <div className={styles.field}>
                    <label>Régime alimentaire (facultatif)</label>
                    <select
                      value={form.diet}
                      onChange={(e) => update('diet', e.target.value)}
                    >
                      <option value="">Aucune restriction</option>
                      <option>Végétarien</option>
                      <option>Végétalien</option>
                      <option>Sans gluten</option>
                      <option>Sans porc</option>
                      <option>Autre allergie / intolérance</option>
                    </select>
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

        {/* STEP 2 — Visites */}
        {step === 2 && (
          <div className={styles.stepPanel}>
            <div>
              <div className={styles.panelIntro}>
                <h2>Choisissez votre visite lyonnaise.</h2>
                <p>
                  Le 7 octobre en fin de journée ou le 9 octobre matin, découvrez le
                  patrimoine et les opérations emblématiques de la métropole. Une visite par
                  participant.
                </p>
              </div>

              <div className={styles.cards}>
                {visits.map((v) => {
                  const remaining = visitsAvailability[v.id] ?? v.capacity;
                  const isFull = remaining <= 0;
                  const isSelected = form.visitId === v.id;
                  return (
                    <div
                      key={v.id}
                      className={`${styles.card} ${isSelected ? styles.cardSelected : ''} ${isFull ? styles.cardDisabled : ''}`}
                      onClick={() => {
                        if (isFull) return;
                        update('visitId', isSelected ? null : v.id);
                        update('noVisit', false);
                      }}
                    >
                      <div className={styles.cardImage}>
                        <Image
                          src={`/visits/${v.code}.jpg`}
                          alt={v.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 900px) calc(100vw - 48px), 350px"
                        />
                      </div>
                      <div className={styles.cardBody}>
                        <div className={styles.cardCheck}>
                          <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
                            <path d="M2 6l3 3 5-6" />
                          </svg>
                        </div>
                        <span className={styles.cardTag}>{v.slot_label}</span>
                        <h3>{v.title}</h3>
                        <div className={styles.cardMeta}>
                          {isFull
                            ? 'Complet'
                            : `${remaining} place${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''} · ${v.capacity} max`}
                        </div>
                        {v.description && <p className={styles.cardDesc}>{v.description}</p>}
                      </div>
                    </div>
                  );
                })}
                <div
                  className={`${styles.card} ${form.noVisit ? styles.cardSelected : ''}`}
                  onClick={() => {
                    update('noVisit', !form.noVisit);
                    update('visitId', null);
                  }}
                >
                  <div className={styles.cardBody}>
                    <div className={styles.cardCheck}>
                      <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
                        <path d="M2 6l3 3 5-6" />
                      </svg>
                    </div>
                    <span className={styles.cardTag}>Aucune</span>
                    <h3>Je ne participerai pas aux visites</h3>
                    <div className={styles.cardMeta}>—</div>
                    <p className={styles.cardDesc}>
                      Vous ne pourrez pas vous rendre disponible sur les créneaux proposés.
                    </p>
                  </div>
                </div>
              </div>
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

        {/* STEP 3 — Nuitées + transport */}
        {step === 3 && (
          <div className={styles.stepPanel}>
            <div>
              <div className={styles.panelIntro}>
                <h2>Réservez vos nuitées.</h2>
                <p>
                  L'hébergement est pris en charge dans un hôtel partenaire de la métropole
                  lyonnaise. Sélectionnez les nuits dont vous avez besoin.
                </p>
              </div>

              <div className={styles.nights}>
                {nights.map((n) => {
                  const isSelected = form.nightIds.includes(n.id);
                  return (
                    <div
                      key={n.id}
                      className={`${styles.nightRow} ${isSelected ? styles.nightSelected : ''}`}
                      onClick={() => {
                        update(
                          'nightIds',
                          isSelected
                            ? form.nightIds.filter((id) => id !== n.id)
                            : [...form.nightIds, n.id]
                        );
                      }}
                    >
                      <div className={styles.nightInfo}>
                        <div>
                          <div className={styles.nightDay}>
                            {formatDateFr(n.night_date).split(' ').slice(0, 1)[0]}
                          </div>
                          <div className={styles.nightDate}>
                            {formatDateFr(n.night_date).split(' ').slice(1).join(' ')}
                          </div>
                        </div>
                        {n.description && (
                          <div className={styles.nightDetail}>{n.description}</div>
                        )}
                      </div>
                      <div className={styles.nightToggle} />
                    </div>
                  );
                })}
              </div>

              <div className={styles.busBox}>
                <label className={styles.checkLine}>
                  <input
                    type="checkbox"
                    checked={form.busTransport}
                    onChange={(e) => update('busTransport', e.target.checked)}
                  />
                  <span>
                    <strong>Transport en bus</strong> — Je souhaite emprunter le bus
                    organisé depuis Lyon Part-Dieu vers le lieu du séminaire.
                  </span>
                </label>
              </div>

              <div className={styles.infoBox}>
                <strong>À noter —</strong> Les frais d'hébergement et de transport sont pris
                en charge par votre entité de rattachement. Les détails pratiques vous seront
                communiqués 15 jours avant l'événement.
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
              <button
                className={styles.btnPrimary}
                onClick={submit}
                disabled={submitting}
              >
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
                <span className={styles.confirmLabel}>Visite</span>
                <span className={styles.confirmValue}>
                  {selectedVisit ? selectedVisit.title : 'Aucune'}
                </span>
              </div>
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>Nuitées</span>
                <span className={styles.confirmValue}>
                  {selectedNights.length === 0
                    ? 'Aucune'
                    : selectedNights
                        .map((n) =>
                          new Date(n.night_date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                          })
                        )
                        .join(' & ')}
                </span>
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
