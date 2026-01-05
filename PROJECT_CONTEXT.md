# 🎯 Contexte du Projet

## Projet Actif

**UWi MVP – Prompt Orchestrator**

## Objectif

Construire une interface orchestrée par prompt capable d'analyser une demande utilisateur et de proposer des solutions exécutables par :

- 👤 **Humains**
- 🤖 **Agents IA** (`ai_agent`)
- 🛞 **Robots**
- 🧩 **SaaS**

## Flux Principal

1. **Input utilisateur** → Prompt libre
2. **Parsing** → `ParsedBrief` (compréhension structurée)
3. **Matching** → Services recommandés avec scores
4. **Orchestration** → `OrchestrationSuggestion` (plan d'action)

## Principes de Développement

✅ **TypeScript strict** - Toutes les options strictes activées
✅ **Next.js App Router** - Structure `/app` uniquement
✅ **Code simple, lisible, modulaire** - Séparation claire des responsabilités
✅ **Styling minimal** - Stubs HTML basiques, pas de CSS complexe
✅ **Supabase préparé** - Structure prête mais non intégrée pour l'instant

## Structure

```
/app              # Next.js App Router
  /brief          # Page: input prompt → JSON résultat
  /services       # Page: liste + formulaire ajout
  /api
    /orchestrate  # POST: prompt → ParsedBrief → OrchestrationSuggestion

/lib              # Logique métier modulaire
  llm.ts         # Client LLM (OpenAI)
  orchestrator.ts # Orchestration complète
  supabase.ts    # Préparation Supabase (stubs)

/types            # Types TypeScript stricts
  brief.ts       # ParsedBrief, ServiceMatch, OrchestrationSuggestion

/data             # Données statiques
  services.ts     # Base de services (ExecutionMode)
```

## Types Clés

- `ExecutionMode`: `"human" | "ai_agent" | "robot" | "saas"`
- `ParsedBrief`: Brief structuré après parsing
- `ServiceMatch`: Service recommandé avec score
- `OrchestrationSuggestion`: Plan d'action complet

## Notes Importantes

- **Ancien projet archivé** dans `archive_lmj_uwi_legacy/`
- **Pas d'intégration Supabase** pour l'instant (structure préparée)
- **Styling minimal** - focus sur la fonctionnalité
- **TypeScript strict** - pas de `any` sauf cas nécessaires avec vérifications

