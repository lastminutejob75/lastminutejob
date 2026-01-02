# Guide de Debugging - LastMinuteJob

## 🔍 Où déboguer le système d'email ?

### 1. **Supabase Edge Functions Logs** ⭐ (Principal)

**URL directe** :
```
https://supabase.com/dashboard/project/wxxansemobnyvvdnhmyg/functions
```

**Navigation** :
1. Dashboard Supabase → Votre projet
2. Menu de gauche → **Edge Functions**
3. Sélectionnez la fonction :
   - `send-verification-code` → Pour voir l'envoi de codes
   - `verify-code` → Pour voir la vérification

4. Onglet **Logs** :
   - Temps réel de tous les appels
   - Erreurs et exceptions
   - Console.log des fonctions
   - En mode dev, vous verrez le code ici : `[DEV MODE] Verification code for email@test.fr: 123456`

**Exemple de logs à surveiller** :
```
✅ Email sent successfully via Resend: re_abc123
❌ RESEND_API_KEY not configured - email not sent
❌ Resend API error: { message: "Invalid API key" }
✅ [DEV MODE] Verification code for test@example.com: 456789
```

### 2. **Browser DevTools - Console** 🌐

**Ouvrir** : Appuyez sur `F12` ou `Cmd+Option+I` (Mac)

**Onglet Console** :
- Après avoir cliqué sur "Envoyer le code de vérification"
- Cherchez la réponse de l'API
- En mode dev, vous verrez :

```json
{
  "success": true,
  "message": "Code généré (mode développement)",
  "devCode": "123456"  ← UTILISEZ CE CODE
}
```

### 3. **Browser DevTools - Network Tab** 📡

**Onglet Network** :
1. Rafraîchir la page avec Network ouvert
2. Cliquez sur "Envoyer le code"
3. Filtrez par : `send-verification-code`
4. Cliquez sur la requête

**Sections importantes** :
- **Headers** :
  - Status: `200 OK` (succès) ou `400/500` (erreur)
  - Authorization: Vérifier le Bearer token

- **Payload** (Request) :
  ```json
  {
    "email": "test@example.com",
    "type": "create"
  }
  ```

- **Response** :
  ```json
  {
    "success": true,
    "message": "Code envoyé",
    "devCode": "123456"  // Si mode dev
  }
  ```

- **Preview** : Vue formatée de la réponse

### 4. **Supabase Table Editor** 📊

**URL directe** :
```
https://supabase.com/dashboard/project/wxxansemobnyvvdnhmyg/editor
```

**Vérifier la table `verification_codes`** :
1. Dashboard → **Table Editor**
2. Sélectionnez `verification_codes`
3. Triez par `created_at` (DESC)
4. Vérifiez :
   - ✅ Un nouveau code est créé à chaque demande
   - ✅ `email` correspond à celui saisi
   - ✅ `code` est un nombre à 6 chiffres
   - ✅ `expires_at` est dans le futur (10 min)
   - ✅ `verified` = false (devient true après validation)
   - ✅ `type` = 'create' ou 'manage'

**Exemple de ligne** :
```
id: 8c18ab43-d9d7-44ce-bf94-a2d2c1ebac0d
email: test@example.com
code: 333106
type: create
expires_at: 2025-10-28 15:30:00
verified: false
created_at: 2025-10-28 15:20:00
```

### 5. **SQL Editor - Queries personnalisées** 💾

**URL** :
```
https://supabase.com/dashboard/project/wxxansemobnyvvdnhmyg/sql
```

**Queries utiles** :

#### Voir les derniers codes générés :
```sql
SELECT
  email,
  code,
  type,
  verified,
  expires_at,
  created_at,
  CASE
    WHEN expires_at > NOW() THEN '✅ Valid'
    ELSE '❌ Expired'
  END as status
FROM verification_codes
ORDER BY created_at DESC
LIMIT 10;
```

#### Codes non vérifiés et valides :
```sql
SELECT * FROM verification_codes
WHERE verified = false
  AND expires_at > NOW()
ORDER BY created_at DESC;
```

#### Statistiques :
```sql
SELECT
  type,
  COUNT(*) as total,
  SUM(CASE WHEN verified THEN 1 ELSE 0 END) as verified_count,
  SUM(CASE WHEN expires_at > NOW() AND NOT verified THEN 1 ELSE 0 END) as pending
FROM verification_codes
GROUP BY type;
```

### 6. **Resend Dashboard** 📧 (Si configuré)

**URL** :
```
https://resend.com/emails
```

**Ce que vous verrez** :
- Liste de tous les emails envoyés
- Statut : Delivered ✅ / Bounced ❌ / Failed ❌
- Timestamp d'envoi
- Destinataire
- Sujet
- Preview du contenu HTML
- Logs d'erreur détaillés

**Problèmes courants** :
- ❌ **Email bounce** → Adresse invalide
- ❌ **Failed** → Problème API ou domain non vérifié
- ⚠️ **Spam** → L'email est dans le spam du destinataire

## 🐛 Scénarios de Debugging

### Scénario 1 : Le code n'est pas envoyé

**Étapes** :
1. ✅ Vérifier **Console Browser** → Le code devrait apparaître en `devCode`
2. ✅ Vérifier **Table verification_codes** → Le code est dans la DB
3. ❌ Si pas de `devCode` et pas d'email → Vérifier **Edge Functions Logs**

**Causes probables** :
- Variable `RESEND_API_KEY` non configurée (Mode dev actif)
- Erreur dans la fonction (visible dans logs)
- Problème CORS

### Scénario 2 : L'email n'arrive pas

**Étapes** :
1. ✅ Vérifier **Resend Dashboard** → Email envoyé ?
2. ✅ Vérifier **Spam/Junk** folder
3. ✅ Vérifier **Edge Functions Logs** → Erreur Resend ?

**Causes probables** :
- Email dans spam
- Domain non vérifié sur Resend
- Clé API Resend invalide
- Limite gratuite Resend atteinte (100/jour)

### Scénario 3 : Code invalide ou expiré

**Étapes** :
1. ✅ Vérifier **Table verification_codes** → `expires_at` dans le futur ?
2. ✅ Le code a déjà été utilisé ? → `verified = true`
3. ✅ Vous testez le bon code ?

**Causes probables** :
- Code expiré (> 10 minutes)
- Code déjà vérifié
- Typo dans le code saisi

### Scénario 4 : Erreur 500 ou 400

**Étapes** :
1. ✅ **Network Tab** → Voir le message d'erreur exact
2. ✅ **Edge Functions Logs** → Stack trace complète
3. ✅ **Payload** → Données envoyées correctes ?

**Causes probables** :
- Email invalide (pas de @)
- Type invalide (doit être 'create' ou 'manage')
- jobId manquant pour type 'manage'

## 🧪 Testing Workflow

### Test manuel complet :

1. **Générer un code** :
   - Ouvrez l'app : http://localhost:5173
   - Entrez un email de test
   - Cliquez "Envoyer le code"
   - Ouvrez **Console DevTools** → Copiez `devCode`

2. **Vérifier en DB** :
   ```sql
   SELECT * FROM verification_codes
   WHERE email = 'votre-email@test.com'
   ORDER BY created_at DESC LIMIT 1;
   ```

3. **Utiliser le code** :
   - Entrez le code dans l'interface
   - Cliquez "Vérifier"
   - Devrait retourner `success: true`

4. **Vérifier la vérification** :
   ```sql
   SELECT * FROM verification_codes
   WHERE email = 'votre-email@test.com'
   AND verified = true
   ORDER BY created_at DESC LIMIT 1;
   ```

### Test via curl :

```bash
# 1. Envoyer un code
curl -X POST \
  'https://wxxansemobnyvvdnhmyg.supabase.co/functions/v1/send-verification-code' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4eGFuc2Vtb2JueXZ2ZG5obXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NjQ2NzksImV4cCI6MjA3NzA0MDY3OX0.CLsOgFLYR5xF91JeZZCWb_dD4YAuKVtfZ2vUJdj0_VE' \
  -H 'Content-Type: application/json' \
  -d '{"email": "debug@test.com", "type": "create"}'

# 2. Récupérer le code de la DB (via SQL Editor ou Table Editor)

# 3. Vérifier le code
curl -X POST \
  'https://wxxansemobnyvvdnhmyg.supabase.co/functions/v1/verify-code' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4eGFuc2Vtb2JueXZ2ZG5obXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NjQ2NzksImV4cCI6MjA3NzA0MDY3OX0.CLsOgFLYR5xF91JeZZCWb_dD4YAuKVtfZ2vUJdj0_VE' \
  -H 'Content-Type: application/json' \
  -d '{"email": "debug@test.com", "code": "123456", "type": "create"}'
```

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez **Edge Functions Logs** en premier
2. Consultez **Network Tab** pour les erreurs API
3. Vérifiez la **Table verification_codes**
4. Testez avec le script curl ci-dessus
5. Consultez `EMAIL_SETUP.md` pour la configuration

## ✅ Checklist de santé

- [ ] Les codes sont créés dans `verification_codes`
- [ ] `expires_at` est dans le futur (10 min)
- [ ] En mode dev, `devCode` apparaît dans la réponse
- [ ] Edge Functions Logs montrent les requêtes
- [ ] Pas d'erreur 500/400 dans Network Tab
- [ ] Si Resend configuré : emails apparaissent dans Resend Dashboard
- [ ] La vérification marque `verified = true`
