# Configuration Twilio pour la vérification SMS

## Statut

✅ **Toutes les fonctions Edge sont déployées et opérationnelles**

⚠️ **Les identifiants Twilio doivent être configurés dans le Dashboard Supabase pour que les SMS soient réellement envoyés**

En mode développement (sans secrets configurés), le code s'affiche dans la réponse :
```json
{"success":true,"message":"Code genere (mode developpement)","devCode":"945842"}
```

## Vos identifiants Twilio

- **Account SID**: `VOTRE_ACCOUNT_SID_TWILIO`
- **Auth Token**: `VOTRE_AUTH_TOKEN_TWILIO`
- **Numéro de téléphone**: `VOTRE_NUMERO_TWILIO`

## Configuration dans Supabase

### Option 1: Via le Dashboard Supabase (RECOMMANDÉ)

1. Allez sur https://supabase.com/dashboard/project/wxxansemobnyvvdnhmyg/settings/functions
2. Cliquez sur "Edge Function Secrets"
3. Ajoutez ces 3 secrets :

| Nom du secret | Valeur |
|---------------|--------|
| `TWILIO_ACCOUNT_SID` | `VOTRE_ACCOUNT_SID_TWILIO` |
| `TWILIO_AUTH_TOKEN` | `VOTRE_AUTH_TOKEN_TWILIO` |
| `TWILIO_PHONE_NUMBER` | `VOTRE_NUMERO_TWILIO` |

4. Sauvegardez chaque secret

### Option 2: Via le CLI Supabase (si vous l'avez installé)

```bash
# Configurer les secrets (remplacez par vos vraies valeurs)
npx supabase secrets set TWILIO_ACCOUNT_SID=VOTRE_ACCOUNT_SID_TWILIO
npx supabase secrets set TWILIO_AUTH_TOKEN=VOTRE_AUTH_TOKEN_TWILIO
npx supabase secrets set TWILIO_PHONE_NUMBER=VOTRE_NUMERO_TWILIO
```

## Vérification

Après avoir ajouté les secrets, testez à nouveau :

```bash
curl -X POST "https://wxxansemobnyvvdnhmyg.supabase.co/functions/v1/send-sms-verification" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4eGFuc2Vtb2JueXZ2ZG5obXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NjQ2NzksImV4cCI6MjA3NzA0MDY3OX0.CLsOgFLYR5xF91JeZZCWb_dD4YAuKVtfZ2vUJdj0_VE" \
  -H "Content-Type: application/json" \
  -d '{"phone": "VOTRE_NUMERO_TWILIO", "type": "publish"}'
```

Vous devriez recevoir :
```json
{"success":true,"message":"Code envoye par SMS"}
```

Et un SMS avec le code devrait arriver sur votre téléphone.

## Architecture

```
Utilisateur                Edge Function              Twilio API
    |                           |                          |
    |-- Demande code SMS ------>|                          |
    |                           |                          |
    |                           |-- POST /Messages ------->|
    |                           |   (Account SID + Token)  |
    |                           |                          |
    |                           |<----- SMS envoyé --------|
    |                           |                          |
    |<--- Code généré ----------|                          |
    |                           |                          |
    |                                                      |
    |<----------------- SMS reçu -------------------------|
```

## Notes importantes

- Les secrets sont **automatiquement injectés** dans les Edge Functions comme variables d'environnement
- Vous n'avez pas besoin de redéployer les fonctions après avoir ajouté les secrets
- Les secrets sont sécurisés et ne sont jamais exposés côté client
- Le numéro Twilio doit être vérifié et actif dans votre compte Twilio

## Fonctions déployées

✅ **`send-sms-verification`** - Envoie les codes SMS via Twilio Messages API
✅ **`verify-sms-code`** - Vérifie les codes SMS entrés par l'utilisateur
✅ **`send-verification-code`** - Envoie les codes par email via Resend
✅ **`verify-code`** - Vérifie les codes email entrés par l'utilisateur
✅ **`uwi-extract`** - Extraction de données UWI (ébauche)
✅ **`geo-detect`** - Détection géographique
✅ **`admin-auth`** - Authentification administrateur
✅ **`admin-jobs`** - Gestion des annonces (admin)
✅ **`admin-import`** - Import de données (admin)

## Flux utilisateur

1. L'utilisateur entre son numéro de téléphone
2. Clique sur "Publier l'annonce"
3. Si seulement le téléphone est valide (pas d'email), le système envoie un SMS
4. L'utilisateur reçoit un code à 6 chiffres par SMS
5. Il entre le code dans l'interface
6. Si le code est valide, l'annonce est publiée
