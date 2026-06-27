import Image from 'next/image';
import styles from './programme.module.css';

export default function ProgrammePage() {
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

        <h1 className={styles.pageTitle}>Programme</h1>
        <p className={styles.intro}>
          Deux journées d&apos;échanges, de visites et de rencontres au cœur de Lyon Confluence.
        </p>

        {/* Jeudi 8 octobre */}
        <section className={styles.day}>
          <h2 className={styles.dayTitle}>Jeudi 8 octobre 2026</h2>

          <div className={styles.slot}>
            <h3 className={styles.slotTime}>Matin (9h00 – 12h30)</h3>
            <p className={styles.slotName}>Les Rencontres au Sucre</p>
            <p className={styles.text}>
              Plénière d&apos;ouverture des Rencontres Annuelles Patrimoine et Maîtrise
              d&apos;Ouvrage, suivie d&apos;un cocktail déjeunatoire sur le rooftop du
              Sucre, en surplomb du quartier Confluence.
            </p>
          </div>

          <div className={styles.slot}>
            <h3 className={styles.slotTime}>Après-midi (14h00 – 17h30)</h3>
            <p className={styles.slotName}>Visites des sites CDC Habitat</p>
            <p className={styles.text}>
              Quatre visites au choix pour découvrir les opérations CDC Habitat à Lyon :
            </p>
            <ul className={styles.list}>
              <li>Vieux-Lyon — quartier historique et patrimonial</li>
              <li>Part-Dieu — centre d&apos;affaires en pleine mutation</li>
              <li>Croix-Rousse — l&apos;esprit canut et l&apos;habitat de pente</li>
              <li>Confluence — l&apos;éco-quartier à deux pas du Sucre</li>
            </ul>
            <p className={styles.text}>
              Chaque participant choisit une visite parmi ces quatre options.
            </p>
          </div>

          <div className={styles.slot}>
            <h3 className={styles.slotTime}>Soirée (19h30 – 23h00)</h3>
            <p className={styles.slotName}>Dîner de gala au Selcius</p>
            <p className={styles.text}>
              Soirée festive au Selcius, restaurant méditerranéen en bord de Saône, à
              quelques pas du Sucre. Adresse : 43 quai Rambaud, 69002 Lyon.
            </p>
          </div>
        </section>

        <hr className={styles.separator} />

        {/* Vendredi 9 octobre */}
        <section className={styles.day}>
          <h2 className={styles.dayTitle}>Vendredi 9 octobre 2026</h2>

          <div className={styles.slot}>
            <h3 className={styles.slotTime}>Matin (9h00 – 12h30)</h3>
            <p className={styles.slotName}>Ateliers thématiques + plénière</p>
            <p className={styles.text}>
              Quatre ateliers en parallèle, chaque participant en choisit deux :
            </p>
            <ul className={styles.list}>
              <li>Prolongement de la pièce &quot;Un toit pour tous&quot;</li>
              <li>Mesure de la Biodiversité</li>
              <li>BIM — continuité numérique</li>
              <li>Écriture du projet stratégique</li>
            </ul>
            <p className={styles.text}>
              La matinée se conclut par une plénière de restitution et un cocktail au Sucre.
            </p>
          </div>

          <div className={styles.slot}>
            <h3 className={styles.slotTime}>Après-midi (14h00 – 17h00)</h3>
            <p className={styles.slotName}>Visites culturelles à Lyon</p>
            <p className={styles.text}>
              Cinq parcours pour découvrir Lyon hors des sentiers battus :
            </p>
            <ul className={styles.list}>
              <li>Musée des Confluences — architecture contemporaine et collections</li>
              <li>Festival Airt de Famille — programmation arts vivants</li>
              <li>Quartier Saint-Jean (Unesco) — Renaissance et traboules</li>
              <li>Aquarium de Lyon — biodiversité aquatique</li>
              <li>Biennale d&apos;Art Contemporain — édition 2026</li>
            </ul>
            <p className={styles.text}>
              Chaque participant choisit une visite parmi ces cinq options.
            </p>
          </div>
        </section>

        <p className={styles.note}>
          Horaires précis et programme détaillé à confirmer. Toute mise à jour vous sera
          communiquée par email.
        </p>

        <div className={styles.actions}>
          <a href="/inscription" className={styles.btnSecondary}>
            ← Retour au formulaire
          </a>
        </div>
      </div>
    </main>
  );
}
