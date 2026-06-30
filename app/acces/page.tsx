import Image from 'next/image';
import styles from './acces.module.css';

export default function AccesPage() {
  return (
    <main className={styles.page}>
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
        <div className={styles.headerTitle}>
          Rencontres Annuelles Patrimoine et Maîtrise d&apos;Ouvrage <strong>2026</strong>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <a href="/inscription" className={styles.backLink}>← Retour au formulaire</a>
        </div>

        <h1 className={styles.pageTitle}>Accès au Sucre — Lyon Confluence</h1>
        <p className={styles.address}>50 quai Rambaud, 69002 Lyon</p>

        {/* En train */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>En train</h2>
          <p className={styles.text}>
            Lyon compte trois gares TGV. Privilégiez <strong>Lyon-Perrache</strong>, la plus proche du Sucre.
          </p>
          <div className={styles.subsection}>
            <p className={styles.subsectionTitle}>Depuis Lyon-Perrache (10 minutes)</p>
            <p className={styles.text}>
              Tramway <strong>T1</strong> ou <strong>T2</strong> direction Debourg,
              arrêt <strong>Hôtel de Région-Montrochet</strong>, puis 5 minutes à pied.
            </p>
          </div>
          <div className={styles.subsection}>
            <p className={styles.subsectionTitle}>Depuis Lyon-Part-Dieu (20 minutes)</p>
            <p className={styles.text}>
              Tramway <strong>T1</strong> direct, direction Debourg,
              arrêt <strong>Hôtel de Région-Montrochet</strong>, puis 5 minutes à pied.
            </p>
          </div>
        </section>

        {/* En avion */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>En avion</h2>
          <p className={styles.text}>
            L&apos;aéroport <strong>Lyon-Saint-Exupéry (LYS)</strong> est à 35 minutes du Sucre.
          </p>
          <div className={styles.subsection}>
            <p className={styles.subsectionTitle}>Rhônexpress</p>
            <p className={styles.text}>
              Navette ferroviaire directe entre l&apos;aéroport et la gare de Part-Dieu en moins de 30 minutes.
            </p>
            <ul className={styles.list}>
              <li>Tarif : 16 € aller simple, 28 € aller-retour</li>
              <li>Fréquence : toutes les 15 minutes en journée</li>
              <li>Premier départ aéroport 5h00 — dernier minuit</li>
              <li>
                Billets sur{' '}
                <a href="https://www.rhonexpress.fr" target="_blank" rel="noopener noreferrer" className={styles.link}>
                  rhonexpress.fr
                </a>{' '}
                ou aux distributeurs en gare
              </li>
            </ul>
            <p className={styles.text}>
              Depuis Part-Dieu, prendre le tramway <strong>T1</strong> jusqu&apos;à{' '}
              <strong>Hôtel de Région-Montrochet</strong>.
            </p>
          </div>
          <p className={styles.text}>
            Alternative : taxi ou VTC depuis l&apos;aéroport, environ 45–55 €, 35–45 minutes selon trafic.
          </p>
        </section>

        {/* En voiture */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>En voiture</h2>
          <p className={styles.text}>
            Le carrefour autoroutier de Lyon relie :{' '}
            <strong>Paris (A6), Marseille-Méditerranée (A7), Genève (A42), les Alpes et l&apos;Italie (A43)</strong>.
          </p>
          <div className={styles.subsection}>
            <p className={styles.subsectionTitle}>Stationnement recommandé</p>
            <p className={styles.text}>
              <strong>Parking du Pôle de Commerces et de Loisirs Confluence</strong><br />
              5 rue Paul Montrochet, 69002 Lyon<br />
              1 500 places — à 5 minutes à pied du Sucre
            </p>
            <p className={styles.text}>
              À noter : bornes de recharge pour véhicules électriques sur place.
            </p>
          </div>
        </section>

        {/* En transports en commun */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>En transports en commun (depuis Lyon)</h2>
          <ul className={styles.list}>
            <li>
              <strong>Tramway T1 et T2</strong> — arrêt{' '}
              <strong>Hôtel de Région-Montrochet</strong> (5 minutes à pied)
            </li>
            <li><strong>Bus S1</strong> — arrêt <strong>La Sucrière</strong> (2 minutes à pied)</li>
            <li><strong>Métro A</strong> — station <strong>Perrache</strong> (15 minutes à pied)</li>
            <li><strong>Vélo&apos;v</strong> — station Confluence/Docks, juste en face</li>
          </ul>
        </section>

        {/* En taxi */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>En taxi</h2>
          <p className={styles.text}>Principales centrales lyonnaises :</p>
          <ul className={styles.list}>
            <li><strong>Radio Taxi</strong> : 04 72 10 86 86</li>
            <li><strong>Allo Taxi</strong> : 04 78 28 23 23</li>
            <li><strong>Taxi Lyonnais</strong> : 04 78 26 81 81</li>
          </ul>
        </section>

        {/* Plan d'accès */}
        <div className={styles.planSection}>
          <p className={styles.address}>Le Sucre — 50 quai Rambaud, 69002 Lyon</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/docs/plan-acces.jpg"
            alt="Plan d'accès au Sucre — Lyon Confluence"
            className={styles.planImage}
          />
        </div>

        <div className={styles.actions}>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Le%20Sucre%2C%2050%20quai%20Rambaud%2C%2069002%20Lyon"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimary}
          >
            Ouvrir dans Google Maps
          </a>
          <a href="/docs/plan-acces.pdf" download className={styles.btnPrimary}>
            Télécharger le plan (PDF)
          </a>
          <a href="/inscription" className={styles.btnSecondary}>
            ← Retour au formulaire
          </a>
        </div>
      </div>
    </main>
  );
}
