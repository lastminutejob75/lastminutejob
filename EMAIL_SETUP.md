# Configuration de l'envoi d'emails

## Problème actuel

Le système de vérification par email **génère les codes correctement** et les stocke dans la base de données, mais **les emails ne sont pas envoyés** car aucun service d'envoi n'est configuré.

## Solution : Configurer Resend

Resend est le service d'envoi d'email recommandé par Supabase. Voici comment le configurer :

### 1. Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit
3. Vérifiez votre email

### 2. Obtenir une clé API

1. Dans le dashboard Resend, allez dans **API Keys**
2. Cliquez sur **Create API Key**
3. Donnez-lui un nom (ex: "LastMinuteJob Production")
4. Sélectionnez les permissions **Sending access**
5. Copiez la clé API (elle commence par `re_`)

### 3. Ajouter un domaine (Optionnel mais recommandé)

Pour envoyer depuis votre propre domaine :

1. Dans Resend, allez dans **Domains**
2. Cliquez sur **Add Domain**
3. Entrez votre domaine (ex: `lastminutejob.com`)
4. Suivez les instructions pour configurer les DNS records
5. Une fois vérifié, mettez à jour la fonction pour utiliser votre domaine

Sans domaine vérifié, vous pouvez utiliser :
```
from: 'onboarding@resend.dev'
```

### 4. Configurer la clé API dans Supabase

#### Via Supabase Dashboard :

1. Allez dans votre projet Supabase
2. Naviguez vers **Settings** > **Edge Functions** > **Environment Variables**
3. Ajoutez une nouvelle variable :
   - **Name**: `RESEND_API_KEY`
   - **Value**: Votre clé Resend (ex: `re_xxxxxxxxxxxxx`)
4. Sauvegardez

#### Via Supabase CLI :

```bash
# Set the secret
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx

# Verify it's set
supabase secrets list
```

### 5. Redéployer les Edge Functions

Les Edge Functions doivent être redéployées pour utiliser la nouvelle variable :

```bash
# Via le dashboard Supabase
# Les functions se redéploient automatiquement quand vous ajoutez une variable

# OU via CLI
supabase functions deploy send-verification-code
```

## Mode Développement

**Actuellement actif** : En l'absence de `RESEND_API_KEY`, le système fonctionne en mode développement :

- ✅ Les codes sont générés et stockés
- ✅ Les codes sont affichés dans les logs de la fonction
- ✅ Le code est retourné dans la réponse API (champ `devCode`)
- ❌ Aucun email n'est envoyé

**Avantages du mode dev** :
- Permet de tester sans configurer d'email
- Pas de coût d'envoi d'email
- Codes visibles dans la console

**Pour tester en mode dev** :
1. Ouvrez la console du navigateur
2. Regardez la réponse de l'API après avoir cliqué sur "Envoyer le code"
3. Le champ `devCode` contient le code à 6 chiffres
4. Utilisez ce code pour vérifier

## Mode Production

Une fois `RESEND_API_KEY` configurée :

- ✅ Les emails sont envoyés via Resend
- ✅ Template HTML professionnel
- ✅ Le code n'est plus visible dans les logs
- ✅ Le champ `devCode` n'est plus retourné
- ✅ Emails avec design LastMinuteJob

## Tarification Resend

- **Plan Gratuit** : 100 emails/jour, 3 000 emails/mois
- **Plan Pro** : À partir de $20/mois pour 50 000 emails/mois
- Parfait pour commencer et tester

## Alternative : Autres services d'email

Si vous préférez un autre service, vous pouvez modifier la fonction `send-verification-code` pour utiliser :

### SendGrid
```typescript
const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email }] }],
    from: { email: 'noreply@lastminutejob.com' },
    subject: emailSubject,
    content: [{ type: 'text/html', value: emailBody }]
  })
});
```

### Mailgun
```typescript
const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
  },
  body: new URLSearchParams({
    from: 'LastMinuteJob <noreply@lastminutejob.com>',
    to: email,
    subject: emailSubject,
    html: emailBody
  })
});
```

## Vérifier que ça fonctionne

1. Configurez `RESEND_API_KEY`
2. Redéployez la fonction
3. Testez en créant une annonce
4. Vérifiez votre boîte email
5. Si pas reçu, vérifiez :
   - Les logs dans Supabase > Edge Functions > Logs
   - Le dashboard Resend > Emails
   - Le dossier spam

## Sécurité

✅ Les codes sont :
- Générés aléatoirement (6 chiffres)
- Valables 10 minutes seulement
- À usage unique
- Stockés en base avec l'email associé
- Supprimés après vérification

## Support

Pour plus d'informations :
- [Documentation Resend](https://resend.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Secrets Management](https://supabase.com/docs/guides/functions/secrets)
