# RNP 2026 — Plateforme d'inscription

Plateforme web pour la **Rencontre Nationale Patrimoine 2026** de CDC Habitat (8–9 octobre 2026, Lyon).

Stack : **Next.js 14** (App Router) · **Supabase** (Postgres + Auth) · **Resend** (emails) · déploiement **Vercel**.

---

## 🎯 Ce que fait la plateforme

**Front public :**
- Page d'accueil (`/`)
- Parcours d'inscription en 4 étapes (`/inscription`) — identité, visites, hébergement, confirmation
- Email de confirmation automatique avec référence d'inscription

**Back-office admin (`/admin`) :**
- 🔐 Login sécurisé (Supabase Auth)
- 📊 Dashboard temps réel : KPIs, progression vs objectif, jauges visites, top entités, nuitées
- 👥 Liste des inscrits : recherche, filtres, export CSV (sélection ou filtre courant)
- 📧 Campagnes emails : import CSV de contacts, envoi d'invitations en masse, relances, historique
- ⚙️ CMS contenus : modifier visites, ateliers, nuitées, paramètres événement **sans coder**

---

## 🚀 Mise en route — 4 étapes

### 1. Cloner et installer

```bash
npm install
cp .env.example .env.local
```

### 2. Configurer Supabase (10 min)

1. Créer un projet sur [supabase.com](https://supabase.com) (tier gratuit).
2. Aller dans **SQL Editor** → coller le contenu de `supabase/schema.sql` → **Run**.
3. Aller dans **Settings → API** et copier dans `.env.local` :
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon public)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role secret — ne **jamais** exposer côté client)
4. Créer le premier admin : **Authentication → Users → Add user → Create new user** (avec email + mot de passe).

### 3. Configurer Resend (5 min)

1. Créer un compte sur [resend.com](https://resend.com).
2. Vérifier votre domaine d'envoi (DNS) — ou utiliser `onboarding@resend.dev` pour les tests (limité à votre adresse vérifiée).
3. Créer une API key → coller dans `.env.local` :
   ```
   RESEND_API_KEY=re_xxxxx
   EMAIL_FROM=Rencontre Patrimoine 2026 <noreply@votre-domaine.fr>
   EMAIL_REPLY_TO=sophie.mondet@cdc-habitat.fr
   ```

### 4. Lancer en local

```bash
npm run dev
```

Ouvrir :
- Front public : http://localhost:3000
- Admin : http://localhost:3000/admin/login

---

## 📦 Déploiement Vercel (production)

1. Push le projet sur GitHub.
2. Sur [vercel.com](https://vercel.com), **Import Project** → sélectionner le repo.
3. Dans **Settings → Environment Variables**, copier toutes les variables de `.env.local` (sauf qu'on remplace `NEXT_PUBLIC_APP_URL` par l'URL Vercel finale, ex. `https://rnp2026.vercel.app`).
4. **Deploy**. C'est tout.

**Domaine personnalisé** (recommandé) : dans Vercel → **Settings → Domains**, ajouter votre domaine (ex. `inscription.rnp2026.fr`). Vercel guide la config DNS.

---

## 🛠️ Premiers gestes après déploiement

1. **Se connecter au back-office** avec le compte admin créé à l'étape 2.4
2. Aller dans **Visites, ateliers, dates** et vérifier/ajuster :
   - Les dates de l'événement
   - Les visites lyonnaises (les 4 du seed sont indicatives)
   - Les ateliers (à compléter)
   - Date limite d'inscription
3. Aller dans **Invitations & relances → Importer un fichier**
   - Préparer un CSV avec colonnes : `email`, `prénom`, `nom`, `entité`
   - L'importer puis sélectionner tous → **Envoyer invitation**
4. Suivre les inscriptions au fil de l'eau via le **Tableau de bord** et la **Liste des inscrits**
5. Quelques jours avant la clôture : sélectionner les contacts sans réponse → **Relancer**

---

## 🗂️ Arborescence

```
rnp2026/
├── app/
│   ├── (auth)/admin/login/      # Page de connexion admin (sans sidebar)
│   ├── admin/                    # Back-office (sidebar + auth obligatoire)
│   │   ├── page.tsx              # Dashboard
│   │   ├── inscrits/             # Liste des inscrits + export CSV
│   │   ├── emails/               # Campagnes invitations + relances
│   │   └── contenus/             # CMS visites/ateliers/nuitées
│   ├── api/
│   │   ├── register/             # POST inscription publique
│   │   └── admin/                # CRUD contenus + envois email (auth requis)
│   ├── inscription/              # Parcours public en 4 étapes
│   ├── page.tsx                  # Landing
│   └── layout.tsx                # Layout racine
├── emails/                       # Templates React Email
│   ├── ConfirmationEmail.tsx
│   ├── InvitationEmail.tsx
│   └── ReminderEmail.tsx
├── lib/
│   ├── supabase/                 # Clients (browser, server, admin)
│   ├── email.ts                  # Logique d'envoi (Resend)
│   └── types.ts                  # Types TS partagés
├── supabase/schema.sql           # Schéma BDD complet + seed
└── middleware.ts                 # Protection des routes admin
```

---

## 🔒 Sécurité

- **Row Level Security activé** sur toutes les tables Supabase
- Les écritures publiques sont impossibles directement — tout passe par les routes API qui valident
- Les routes `/api/admin/*` vérifient une session admin valide (`supabase.auth.getUser()`)
- La `service_role` key n'est utilisée **que côté serveur** (Server Components, Route Handlers)
- Les emails utilisent un token unique par invitation pour traquer la conversion sans exposer les IDs

---

## 💰 Coûts

| Service | Tier gratuit | Suffit pour |
|---|---|---|
| Supabase | 500 MB BDD, 50k MAU | Largement pour 200 inscrits |
| Resend | 3 000 emails / mois | 200 invitations + 200 confirmations + 200 relances = 600 emails |
| Vercel | Hobby plan | Suffit pour ce trafic |

**Total : 0 € pour l'événement.** Au besoin, passer Resend en plan Pro (20 $/mois pour 50k emails).

---

## ❓ Dépannage

**"Auth error" à la connexion admin** → Vérifier que l'utilisateur existe dans Supabase Authentication → Users.

**Les emails ne partent pas** → Vérifier `RESEND_API_KEY` et que le domaine est vérifié dans Resend. Sinon utiliser `onboarding@resend.dev` (mais limité à votre email perso).

**`generate_registration_reference` n'existe pas** → Le schema.sql n'a pas été exécuté en entier. Le ré-exécuter (les `if not exists` empêchent les doublons).

**Erreur RLS sur écriture** → Vous tentez d'écrire sans passer par les routes API. Vérifier que vous utilisez le client `createAdminClient` (service_role) côté serveur.

---

## 📞 Contact projet

CDC Habitat — Direction du Patrimoine Groupe
Référence : **DPG-SMO-2026-01**
Contact : sophie.mondet@cdc-habitat.fr

