# UWi Admin API - Documentation

Backend migré vers Supabase Edge Functions + PostgreSQL.

## Architecture

- **Base de données**: PostgreSQL (Supabase)
- **Backend**: Supabase Edge Functions (Deno)
- **Frontend**: React + TypeScript + Vite

## Tables

### `admin_users`
```sql
id          uuid PRIMARY KEY
email       text UNIQUE NOT NULL
pass_hash   text NOT NULL
salt        text NOT NULL
created_at  timestamptz DEFAULT now()
```

### `admin_sessions`
```sql
id          uuid PRIMARY KEY
token       text UNIQUE NOT NULL
admin_id    uuid REFERENCES admin_users(id)
created_at  timestamptz DEFAULT now()
expires_at  timestamptz NOT NULL
```

### `jobs`
```sql
id          uuid PRIMARY KEY
edit_token  text UNIQUE NOT NULL
title       text NOT NULL
body        text
parsed      jsonb (role, city, date, duration, hourly)
contact     jsonb (company, name, email, phone)
status      text ('pending'|'approved'|'rejected')
source      text
created_at  timestamptz DEFAULT now()
updated_at  timestamptz DEFAULT now()
```

## Edge Functions

### 1. `uwi-extract` (OpenAI extraction)
**Endpoint**: `POST /functions/v1/uwi-extract`

**Body**:
```json
{
  "prompt": "Serveur à Paris samedi 7 mars 18h-23h 15€/h"
}
```

**Response**:
```json
{
  "role": "Serveur",
  "city": "Paris",
  "date": "Samedi 7 mars",
  "duration": "18h-23h",
  "hourly": "15€/h"
}
```

**Configuration**: Nécessite `OPENAI_API_KEY` dans les secrets Supabase.

---

### 2. `geo-detect` (Détection de ville)
**Endpoint**: `POST /functions/v1/geo-detect`

**Body**:
```json
{
  "text": "Cherche serveur à Bruxelles"
}
```

**Response**:
```json
{
  "city": "Bruxelles"
}
```

---

### 3. `admin-auth` (Authentification admin)

#### Register
**Endpoint**: `POST /functions/v1/admin-auth/register`

**Body**:
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "ok": true,
  "token": "abc123...",
  "admin": {
    "id": "uuid",
    "email": "admin@example.com"
  }
}
```

**Note**: Le premier admin peut être créé sans authentification. Les suivants nécessitent un token admin valide.

#### Login
**Endpoint**: `POST /functions/v1/admin-auth/login`

**Body**:
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response**: Identique à `/register`

#### Logout
**Endpoint**: `POST /functions/v1/admin-auth/logout`

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "ok": true
}
```

#### Get Current Admin
**Endpoint**: `GET /functions/v1/admin-auth/me`

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "ok": true,
  "admin": {
    "id": "uuid",
    "email": "admin@example.com"
  }
}
```

---

### 4. `admin-jobs` (CRUD jobs - admin uniquement)

**Toutes les routes nécessitent**:
```
Authorization: Bearer <token>
```

#### List all jobs
**Endpoint**: `GET /functions/v1/admin-jobs`

**Response**:
```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Serveur",
      "body": "...",
      "parsed": { "role": "Serveur", "city": "Paris", ... },
      "contact": { "email": "...", "phone": "..." },
      "status": "approved",
      "created_at": "2025-10-29T..."
    }
  ]
}
```

#### Create job
**Endpoint**: `POST /functions/v1/admin-jobs`

**Body**:
```json
{
  "title": "Serveur",
  "body": "Description...",
  "parsed": {
    "role": "Serveur",
    "city": "Paris",
    "date": "Samedi 7 mars",
    "duration": "18h-23h",
    "hourly": "15€/h"
  },
  "contact": {
    "company": "Restaurant X",
    "name": "John Doe",
    "email": "contact@example.com",
    "phone": "+33612345678"
  },
  "status": "approved",
  "source": "import"
}
```

#### Update job
**Endpoint**: `PUT /functions/v1/admin-jobs/{id}`

**Body**: Mêmes champs que POST (tous optionnels)

#### Delete job
**Endpoint**: `DELETE /functions/v1/admin-jobs/{id}`

#### Update job status
**Endpoint**: `POST /functions/v1/admin-jobs/{id}/status`

**Body**:
```json
{
  "status": "approved"
}
```

---

### 5. `admin-import` (Import CSV & Scraping)

**Toutes les routes nécessitent**:
```
Authorization: Bearer <token>
```

#### Import CSV
**Endpoint**: `POST /functions/v1/admin-import/csv`

**Headers**:
```
Content-Type: text/csv
Authorization: Bearer <token>
```

**Body** (CSV brut):
```csv
title,body,role,city,date,duration,hourly,company,name,email,phone,status,source
Serveur,Description,Serveur,Paris,Samedi,18h-23h,15€/h,Restaurant,John,john@example.com,+33612345678,approved,import
```

**Response**:
```json
{
  "ok": true,
  "imported": 1,
  "ids": ["uuid1"]
}
```

#### Scrape URL
**Endpoint**: `POST /functions/v1/admin-import/scrape`

**Body**:
```json
{
  "url": "https://example.com/job-listing",
  "status": "approved",
  "source": "scrape"
}
```

**Response**:
```json
{
  "ok": true,
  "job": { ... }
}
```

---

## Utilisation Frontend

### Installation
```typescript
import { adminApi } from '@/lib/adminApi';
```

### Exemples

```typescript
// Login
const session = await adminApi.login('admin@example.com', 'password');

// Extract job data with AI
const extracted = await adminApi.extractJobData('Serveur Paris samedi 15€/h');

// Detect city
const city = await adminApi.detectCity('Serveur à Bruxelles');

// Create job
const job = await adminApi.createJob({
  title: 'Serveur',
  body: 'Description',
  parsed: extracted,
  contact: {
    email: 'contact@example.com',
    phone: '+33612345678'
  },
  status: 'approved'
});

// Get all jobs
const jobs = await adminApi.getJobs();

// Update job status
await adminApi.updateJobStatus(job.id, 'rejected');

// Import CSV
const result = await adminApi.importCSV(csvContent);

// Scrape URL
const scrapedJob = await adminApi.scrapeURL('https://example.com/job');

// Logout
await adminApi.logout();
```

---

## Sécurité

- **RLS activé** sur toutes les tables
- Tables `admin_users` et `admin_sessions` : accessible uniquement via service role (Edge Functions)
- Table `jobs` : lecture publique pour jobs approved, modification avec edit_token
- Sessions expirées automatiquement après 7 jours
- Mots de passe hashés avec SHA-256 + salt unique

---

## Configuration requise

### Variables d'environnement Supabase

Les variables suivantes sont **automatiquement configurées** dans Supabase Edge Functions :
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

### Secret à configurer manuellement

**OPENAI_API_KEY** : Pour utiliser la fonction `uwi-extract`

Configuration dans le dashboard Supabase :
1. Aller dans **Edge Functions** → **Settings**
2. Ajouter un secret : `OPENAI_API_KEY=sk-...`

---

## Testing

### Create first admin
```bash
curl -X POST https://your-project.supabase.co/functions/v1/admin-auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Extract job data
```bash
curl -X POST https://your-project.supabase.co/functions/v1/uwi-extract \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Serveur à Paris samedi 18h-23h 15€/h"}'
```

---

## Migration depuis Node/Express

✅ **Complété**:
- Base de données JSON → PostgreSQL Supabase
- Routes Express → Edge Functions Supabase (Deno)
- Authentification fichier → Base de données sécurisée
- CORS configuré sur toutes les fonctions
- RLS pour la sécurité des données

✅ **Compatible avec**:
- Frontend React existant
- Déploiement Vercel/Netlify
- Workflow existant
