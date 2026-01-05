# Configurer l'authentification Git

## 🔑 Créer un token GitHub

### 1. Va sur GitHub
- https://github.com/settings/tokens
- Ou : GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

### 2. Clique sur "Generate new token" → "Generate new token (classic)"

### 3. Configure le token :
- **Note** : "UWI Project"
- **Expiration** : 90 days (ou No expiration)
- **Scopes** : Coche seulement `repo` (tout en bas)

### 4. Clique sur "Generate token"

### 5. **IMPORTANT** : Copie le token immédiatement (tu ne pourras plus le voir après)

## 🔧 Configurer Git avec le token

### Option A : Utiliser le token pour ce push seulement

```bash
git push https://TON_TOKEN@github.com/lastminutejob75/UWI.git main
```

Remplace `TON_TOKEN` par le token que tu as copié.

### Option B : Configurer Git pour toujours utiliser le token

```bash
git remote set-url origin https://TON_TOKEN@github.com/lastminutejob75/UWI.git
git push origin main
```

## ⚠️ Sécurité

- Ne partage jamais ton token
- Ne le mets pas dans des fichiers publics
- Si tu le perds, supprime-le et crée-en un nouveau

## ✅ Alternative plus simple : GitHub Desktop

C'est beaucoup plus simple d'utiliser GitHub Desktop :
1. Ouvre GitHub Desktop
2. Clique sur "Commit"
3. Clique sur "Push origin"

C'est tout ! Pas besoin de token.


