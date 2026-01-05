/**
 * Client LLM pour parsing et génération
 */

export interface LLMResponse {
  content: string;
  usage?: {
    tokens: number;
  };
}

export class LLMClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }
  }

  async parseBrief(userPrompt: string): Promise<any> {
    const systemPrompt = `Tu es un expert en analyse de besoins business. 
Analyse le prompt utilisateur et extrais les informations structurées suivantes :
- intent: l'intention principale
- location: la localisation si mentionnée
- budget: montant et devise si mentionné
- constraints: liste des contraintes identifiées
- goals: liste des objectifs identifiés
- timeline: délai souhaité si mentionné
- context: autres informations pertinentes

Réponds UNIQUEMENT avec un JSON valide, sans texte supplémentaire.`;

    const response = await this.callAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    try {
      return JSON.parse(response.content);
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      // Fallback parsing
      return this.fallbackParse(userPrompt);
    }
  }

  async generateOrchestrationPlan(parsedBrief: any, matchedServices: any[]): Promise<any> {
    const systemPrompt = `Tu es un expert en orchestration de services. 
À partir du brief analysé et des services recommandés, génère un plan d'exécution structuré avec :
- phases d'exécution numérotées
- description de chaque phase
- services impliqués (par ID)
- dépendances entre phases si nécessaire
- estimation de coût total
- estimation de timeline

Réponds UNIQUEMENT avec un JSON valide.`;

    const userPrompt = `Brief: ${JSON.stringify(parsedBrief)}
Services recommandés: ${JSON.stringify(matchedServices)}`;

    const response = await this.callAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    try {
      return JSON.parse(response.content);
    } catch (error) {
      console.error('Error parsing orchestration plan:', error);
      return this.fallbackOrchestrationPlan(matchedServices);
    }
  }

  private async callAPI(messages: Array<{ role: string; content: string }>): Promise<LLMResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
    };
  }

  private fallbackParse(prompt: string): any {
    // Fallback simple si l'API échoue
    const lower = prompt.toLowerCase();
    return {
      intent: 'augmenter ventes',
      location: lower.includes('paris') ? 'Paris' : undefined,
      budget: undefined,
      constraints: lower.includes('petit budget') || lower.includes('petit') ? ['budget limité'] : [],
      goals: ['augmenter ventes'],
      timeline: undefined,
      context: {},
    };
  }

  private fallbackOrchestrationPlan(services: any[]): any {
    return {
      executionPlan: [
        {
          phase: 1,
          description: 'Mise en place initiale',
          services: services.slice(0, 2).map((s: any) => s.serviceId),
          dependencies: [],
        },
      ],
      estimatedTotalCost: services.reduce((sum: number, s: any) => sum + (s.estimatedCost || 0), 0),
      estimatedTimeline: '2-4 semaines',
    };
  }
}
