# 🚨 Alertis - Système de Gestion d'Alertes d'Urgence

## 📋 Description

Alertis est une application web en temps réel permettant aux citoyens de signaler des situations d'urgence et aux services de secours (SAMU, Police, Pompiers) de recevoir, accepter et gérer ces alertes en temps réel via WebSocket.

### Architecture

Le projet est composé de trois parties principales :
- **Frontend** : Application React + TypeScript avec Vite
- **Backend** : API Express.js avec Socket.io pour la communication temps réel
- **Base de données** : Supabase (PostgreSQL) avec authentification intégrée

---

## 🎯 Fonctionnalités principales

### Pour les Clients (Citoyens)
- ✅ Inscription et connexion sécurisées (JWT)
- ✅ Sélection du type d'urgence par catégorie/sous-catégorie
- ✅ Envoi d'alertes avec géolocalisation
- ✅ Suivi en temps réel du statut de l'alerte
- ✅ Historique des demandes

### Pour les Patrouilles (Services d'urgence)
- ✅ Dashboard dédié par type de service (SAMU, Police, Pompiers)
- ✅ Réception instantanée des alertes pertinentes
- ✅ Acceptation et prise en charge des alertes
- ✅ Visualisation des alertes sur une carte interactive
- ✅ Gestion des alertes (En attente, En cours, Résolues)

---

## 🛠️ Technologies utilisées

### Frontend
- **React 19** avec **TypeScript**
- **Vite** - Build tool et dev server
- **React Router** - Navigation et routes protégées
- **Socket.io-client** - Communication temps réel
- **Leaflet / React-Leaflet** - Cartographie interactive
- **TanStack Query** - Gestion des états et cache
- **Supabase JS** - Client pour l'authentification et la BDD
- **Lucide React** - Bibliothèque d'icônes

### Backend
- **Node.js** avec **Express 5**
- **Socket.io** - WebSocket pour le temps réel
- **jsonwebtoken** + **jwks-rsa** - Validation des JWT Supabase
- **Supabase JS** - Client serveur pour la BDD
- **Swagger** - Documentation API
- **CORS** - Gestion des origines
- **Nodemon** - Auto-reload en développement

### Base de données
- **Supabase** (PostgreSQL)
- Authentification intégrée avec JWT
- Row Level Security (RLS)
- Triggers et fonctions automatiques

---

## 📦 Installation et Configuration

### Prérequis
- Node.js >= 18.x
- npm ou yarn
- Compte Supabase (gratuit)

### 1️⃣ Cloner le projet

```bash
git clone <url-du-repo>
cd Alertis
```

### 2️⃣ Configuration de Supabase

#### Créer un projet Supabase
1. Rendez-vous sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et les clés API (anon key et service role key)

#### Exécuter les migrations SQL

Dans le dashboard Supabase (SQL Editor), exécutez le fichier :
```
supabase/migrations/20260211105203_init_profiles.sql
```

Cela créera :
- Les tables `clients` et `patrols`
- Les tables `categories`, `sub_categories`, et `alerts`
- Les triggers pour la création automatique de profils
- Les politiques de sécurité RLS

#### Créer les catégories d'urgence

Insérez les données suivantes dans la table `categories` :

```sql
INSERT INTO categories (name, icon, color) VALUES
  ('Santé', '🏥', '#FF5252'),
  ('Danger', '⚠️', '#FFC107'),
  ('Incendie', '🔥', '#FF6F00');
```

Puis les sous-catégories dans `sub_categories` (adaptez les `category_id` selon vos IDs) :

```sql
-- Pour Santé
INSERT INTO sub_categories (name, category_id) VALUES
  ('Malaise', <id_sante>),
  ('Accident', <id_sante>),
  ('Blessure grave', <id_sante>);

-- Pour Danger
INSERT INTO sub_categories (name, category_id) VALUES
  ('Agression', <id_danger>),
  ('Vol', <id_danger>),
  ('Comportement suspect', <id_danger>);

-- Pour Incendie
INSERT INTO sub_categories (name, category_id) VALUES
  ('Feu de forêt', <id_incendie>),
  ('Feu de bâtiment', <id_incendie>),
  ('Feu de véhicule', <id_incendie>);
```

#### Créer des comptes patrouilles

Les patrouilles doivent être créées manuellement via l'interface Supabase :

1. Dans l'onglet **Authentication**, créez des utilisateurs
2. Dans la table **patrols**, insérez les profils correspondants :

```sql
INSERT INTO patrols (id, email, nom, type, name_patrols) VALUES
  ('<uuid-user-1>', 'samu@example.com', 'SAMU Paris', 'samu', 'SAMU 75'),
  ('<uuid-user-2>', 'police@example.com', 'Police Nationale', 'police', 'Police Paris'),
  ('<uuid-user-3>', 'pompiers@example.com', 'Sapeurs Pompiers', 'firefighter', 'Pompiers Paris');
```

**Note** : Le champ `type` doit être l'un des suivants : `samu`, `police`, `firefighter`

### 3️⃣ Configuration du Backend

```bash
cd Back
npm install
```

Créez un fichier `.env` à la racine du dossier `Back` :

```env
# Port du serveur
PORT=3000

# CORS (URL du frontend)
CORS_ORIGIN=http://localhost:5173

# Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Environment
NODE_ENV=development
```

### 4️⃣ Configuration du Frontend

```bash
cd ../Front
npm install
```

Créez un fichier `.env` à la racine du dossier `Front` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_anon_key
VITE_API_URL=http://localhost:3000
```

---

## 🚀 Démarrage du projet

### Lancer le Backend

```bash
cd Back
npm run dev
```

Le serveur démarre sur `http://localhost:3000`
- Documentation API : `http://localhost:3000/api-docs`
- Health check : `http://localhost:3000/api/health`

### Lancer le Frontend

Dans un nouveau terminal :

```bash
cd Front
npm run dev
```

L'application démarre sur `http://localhost:5173`

---

## 📖 Structure du projet

### Backend (`/Back`)

```
Back/
├── src/
│   ├── app.js                 # Configuration Express
│   ├── server.js              # Serveur HTTP + WebSocket
│   ├── config/
│   │   ├── db_client.js       # Client Supabase
│   │   ├── env.js             # Variables d'environnement
│   │   └── swagger.js         # Configuration Swagger
│   ├── controller/
│   │   └── healthController.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── notFound.js
│   └── routes/
│       ├── health.routes.js
│       └── index.js
├── package.json
└── .env
```

### Frontend (`/Front`)

```
Front/
├── src/
│   ├── App.tsx                # Point d'entrée, routage
│   ├── main.tsx               # Montage React
│   ├── components/
│   │   ├── categoryAccordion/    # Sélection catégories
│   │   ├── confirmModal/          # Modal de confirmation
│   │   ├── header/                # En-tête navigation
│   │   ├── map/                   # Carte Leaflet
│   │   ├── routes/                # Routes protégées
│   │   └── subCategoryButton/     # Boutons sous-catégories
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Contexte authentification
│   │   └── SocketContext.tsx      # Contexte Socket.io
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts          # Client Supabase
│   │       └── types.ts
│   ├── pages/
│   │   ├── ClientPage.tsx         # Page client (sélection urgence)
│   │   ├── AlertStatusPage.tsx    # Page statut alerte
│   │   ├── MyRequestsPage.tsx     # Historique alertes
│   │   ├── PatrolDashboard.tsx    # Dashboard patrouilles
│   │   └── authentification/
│   │       ├── LoginPage.tsx
│   │       └── RegisterPage.tsx
│   └── services/
│       ├── AuthService.ts         # Service authentification
│       ├── CategoryService.ts     # Service catégories
│       ├── PatrolService.ts       # Service patrouilles
│       └── socketService.ts       # Service WebSocket
├── package.json
├── vite.config.ts
└── .env
```

---

## 🔐 Authentification et Sécurité

### Flow d'authentification

1. **Inscription** : Les utilisateurs s'inscrivent via Supabase Auth
2. **Trigger automatique** : Un profil `client` est créé automatiquement dans la table `clients`
3. **Connexion** : Supabase génère un JWT signé avec une clé ES256
4. **Validation** : Le backend valide les JWT via JWKS (JSON Web Key Set)
5. **WebSocket** : Chaque événement Socket.io envoie le token pour validation

### Sécurité

- ✅ **JWT ES256** avec rotation de clés
- ✅ **Row Level Security** (RLS) sur toutes les tables
- ✅ **Routes protégées** côté frontend
- ✅ **Validation token** sur chaque événement WebSocket
- ✅ **CORS** configuré pour limiter les origines

---

## 🔌 Événements WebSocket

> 📚 **Guide complet** : Pour comprendre l'ordre d'exécution des événements et les bonnes pratiques, consultez [WEBSOCKET_BEST_PRACTICES.md](./WEBSOCKET_BEST_PRACTICES.md)

### Client → Serveur

#### `user:join`
Inscription au canal WebSocket
```javascript
socket.emit("user:join", {
  token: "jwt_token",
  userType: "client" | "patrol",
  patrolType?: "samu" | "police" | "firefighter"
});
```

#### `emergency:alert`
Envoi d'une alerte d'urgence
```javascript
socket.emit("emergency:alert", {
  token: "jwt_token",
  category: "Santé",
  subcategory: "Malaise",
  location: { latitude: 48.8566, longitude: 2.3522 },
  timestamp: "2026-02-13T10:30:00Z",
  clientName: "Jean Dupont"
});
```

#### `emergency:accept`
Acceptation d'une alerte par une patrouille
```javascript
socket.emit("emergency:accept", {
  token: "jwt_token",
  alertId: "uuid",
  patrolType: "samu",
  patrolName: "SAMU 75"
});
```

#### `emergency:resolve`
Résolution d'une alerte
```javascript
socket.emit("emergency:resolve", {
  alertId: "uuid",
  patrolType: "samu"
});
```

### Serveur → Client

#### `alert:new`
Nouvelle alerte pour les patrouilles
```javascript
socket.on("alert:new", (data) => {
  // data contient les infos de l'alerte
});
```

#### `alert:created`
Confirmation de création pour le client
```javascript
socket.on("alert:created", (data) => {
  // data.alertId, data.status
});
```

#### `alert:accepted`
Notification d'acceptation
```javascript
socket.on("alert:accepted", (data) => {
  // Alerte acceptée par une patrouille
});
```

#### `alert:status-update`
Mise à jour du statut
```javascript
socket.on("alert:status-update", (data) => {
  // Changement de statut d'alerte
});
```

#### `alert:resolved`
Alerte résolue
```javascript
socket.on("alert:resolved", (data) => {
  // Alerte terminée
});
```

---

## 🗄️ Schéma de base de données

### Tables principales

**`clients`**
- `id` (UUID, FK vers auth.users)
- `email`, `nom`, `prenom`, `tel`
- `created_at`, `updated_at`

**`patrols`**
- `id` (UUID, FK vers auth.users)
- `email`, `nom`, `type` (samu/police/firefighter)
- `name_patrols` (nom affiché)
- `matrice_id`, `created_at`, `updated_at`

**`categories`**
- `id` (SERIAL)
- `name`, `icon`, `color`

**`sub_categories`**
- `id` (SERIAL)
- `name`, `category_id` (FK vers categories)

**`alerts`**
- `id` (UUID)
- `sub_category_id` (FK vers sub_categories)
- `alert_location` (POINT)
- `status` (pending/in_progress/resolved)
- `client_id` (FK vers clients)
- `patrol_id` (FK vers patrols, nullable)
- `created_at`, `updated_at`

---

## 🧪 Tests et Développement

### Backend

```bash
cd Back

# Mode développement avec auto-reload
npm run dev

# Mode production
npm start
```

### Frontend

```bash
cd Front

# Mode développement
npm run dev

# Build production
npm run build

# Aperçu du build
npm run preview

# Linting
npm run lint
```

---

## 📝 Notes importantes

### Gestion des canaux WebSocket

Les clients rejoignent des canaux spécifiques :
- **Clients** : `client:${userId}` - canal privé par utilisateur
- **Patrouilles** : `alerts:${patrolType}` - canal par type de service

### Mapping Catégorie → Type de patrouille

```javascript
const CATEGORY_TO_PATROL_TYPE = {
  'santé': 'samu',
  'danger': 'police',
  'incendie': 'firefighter'
};
```

### Statuts d'alerte

- `pending` : En attente de prise en charge
- `in_progress` : Acceptée par une patrouille
- `resolved` : Terminée

### Géolocalisation

Le système utilise l'API Geolocation du navigateur pour obtenir la position GPS du client lors de l'envoi d'une alerte.

---

## 🐛 Dépannage

### Le WebSocket ne se connecte pas
- Vérifiez que le backend est bien démarré
- Vérifiez la variable `VITE_API_URL` dans le `.env` du frontend
- Vérifiez les CORS dans le `.env` du backend

### Les alertes ne s'affichent pas
- Vérifiez que les catégories et sous-catégories sont bien créées dans Supabase
- Vérifiez les RLS (Row Level Security) dans Supabase
- Vérifiez les logs du backend pour voir les erreurs JWT

### Erreur d'authentification
- Vérifiez que les clés Supabase sont correctes
- Vérifiez que le JWT n'est pas expiré
- Vérifiez que le JWKS endpoint est accessible

### La carte ne s'affiche pas
- Vérifiez que Leaflet CSS est bien importé
- Autorisez la géolocalisation dans le navigateur
- Vérifiez la console pour les erreurs Leaflet

---

## 🚧 Améliorations futures

- [ ] Notifications push
- [ ] Historique détaillé avec timeline
- [ ] Statistiques et analytics
- [ ] Chat en temps réel client/patrouille
- [ ] Application mobile (React Native)
- [ ] Tests unitaires et e2e
- [ ] CI/CD avec GitHub Actions
- [ ] Docker Compose pour déploiement facile

---

## 👥 Contribution

Pour contribuer au projet :

1. Forkez le repository
2. Créez une branche (`git checkout -b feature/amelioration`)
3. Committez vos changements (`git commit -m 'Ajout fonctionnalité X'`)
4. Pushez vers la branche (`git push origin feature/amelioration`)
5. Ouvrez une Pull Request

---

## 📄 Licence

Ce projet est développé dans un cadre éducatif pour l'EFREI Paris.

---

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation Swagger : `http://localhost:3000/api-docs`

---

**Développé avec ❤️ pour la gestion des urgences en temps réel**

