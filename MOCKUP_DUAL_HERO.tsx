/**
 * MOCKUP - Nouveau Hero avec Double Parcours
 *
 * Ce fichier contient des exemples de composants pour la refonte UX
 * À intégrer dans App.tsx après validation du design
 */

import React, { useState } from 'react';
import { Briefcase, User, Zap, Target, Bell, Clock } from 'lucide-react';

// ============================================================================
// OPTION 1 : Switcher "Je suis..." avec Cards
// ============================================================================

export function DualPathHero() {
  const [userType, setUserType] = useState<'recruiter' | 'talent' | null>(null);

  if (!userType) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 mb-6 shadow-sm">
            <Zap size={16} className="text-orange-500" />
            <span className="font-semibold">Matching RH Instantané</span>
          </div>

          {/* Titre */}
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            Trouvez <span className="text-blue-600">OU</span> Trouvez-vous
          </h1>
          <p className="text-xl text-slate-600 mb-12">
            en moins de 2 heures ⚡
          </p>

          {/* Cards de choix */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Card Recruteur */}
            <button
              onClick={() => setUserType('recruiter')}
              className="group relative bg-white rounded-2xl border-2 border-slate-200 p-8 text-left hover:border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <Briefcase className="text-blue-600 group-hover:text-white" size={24} />
              </div>

              <h3 className="text-2xl font-bold mb-3 text-slate-900">
                Je recrute
              </h3>
              <p className="text-slate-600 mb-6">
                Publiez une annonce et trouvez les meilleurs talents automatiquement
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Zap size={16} className="text-blue-500" />
                  <span>Annonce générée en 30 sec</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Target size={16} className="text-blue-500" />
                  <span>Matching automatique avec talents</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock size={16} className="text-blue-500" />
                  <span>Résultats en moins de 2h</span>
                </div>
              </div>

              <div className="mt-6 px-4 py-2 rounded-lg bg-blue-500 text-white text-center font-semibold group-hover:bg-blue-600 transition-colors">
                Commencer →
              </div>
            </button>

            {/* Card Talent */}
            <button
              onClick={() => setUserType('talent')}
              className="group relative bg-white rounded-2xl border-2 border-slate-200 p-8 text-left hover:border-orange-500 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                <User className="text-orange-600 group-hover:text-white" size={24} />
              </div>

              <h3 className="text-2xl font-bold mb-3 text-slate-900">
                Je cherche une mission
              </h3>
              <p className="text-slate-600 mb-6">
                Créez votre profil et recevez des offres qui matchent avec vous
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Zap size={16} className="text-orange-500" />
                  <span>Profil en 2 minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Bell size={16} className="text-orange-500" />
                  <span>Notifications instantanées</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Target size={16} className="text-orange-500" />
                  <span>Postulez en 1 clic</span>
                </div>
              </div>

              <div className="mt-6 px-4 py-2 rounded-lg bg-orange-500 text-white text-center font-semibold group-hover:bg-orange-600 transition-colors">
                Voir les missions →
              </div>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span>Sans inscription</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span>92% de succès</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <span>&lt; 2 heures</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher le formulaire correspondant
  if (userType === 'recruiter') {
    return <RecruiterForm onBack={() => setUserType(null)} />;
  }

  return <TalentFlow onBack={() => setUserType(null)} />;
}

// ============================================================================
// Formulaire Recruteur (existant amélioré)
// ============================================================================

function RecruiterForm({ onBack }: { onBack: () => void }) {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        ← Retour
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-2">Décrivez votre besoin</h2>
        <p className="text-slate-600 mb-6">
          UWi va générer votre annonce et matcher les meilleurs talents
        </p>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Besoin d'un serveur à Paris ce samedi soir"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-4"
        />

        {/* NOUVEAU : Teaser Matching */}
        {prompt.trim() && (
          <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-green-800 mb-1">
              <Zap size={16} className="text-green-600" />
              Matching automatique activé
            </div>
            <p className="text-xs text-green-700">
              UWi va chercher les meilleurs talents disponibles dans votre ville et vous notifier instantanément
            </p>
          </div>
        )}

        <button
          disabled={!prompt.trim()}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Générer l'annonce + Matcher les talents
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Flow Talent (nouveau)
// ============================================================================

function TalentFlow({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        ← Retour
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-2">Missions disponibles maintenant</h2>
        <p className="text-slate-600 mb-6">
          Créez votre profil ou consultez les missions du jour
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <button className="p-4 border-2 border-orange-500 rounded-lg text-left hover:bg-orange-50 transition-colors">
            <div className="font-semibold text-lg mb-1">Créer mon profil</div>
            <div className="text-sm text-slate-600">
              2 minutes pour recevoir des offres personnalisées
            </div>
          </button>

          <button className="p-4 border-2 border-slate-200 rounded-lg text-left hover:bg-slate-50 transition-colors">
            <div className="font-semibold text-lg mb-1">Voir les missions</div>
            <div className="text-sm text-slate-600">
              150+ missions disponibles aujourd'hui
            </div>
          </button>
        </div>

        {/* Exemple de missions */}
        <div className="mt-6 space-y-3">
          <h3 className="font-semibold text-sm text-slate-500">Missions du jour :</h3>

          {[
            { job: 'Serveur', city: 'Paris', pay: '18€/h', time: 'Ce soir 18h-23h' },
            { job: 'Bartender', city: 'Lyon', pay: '20€/h', time: 'Demain 14h-22h' },
            { job: 'Cuisinier', city: 'Marseille', pay: '22€/h', time: 'Ce week-end' }
          ].map((mission, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-orange-300 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{mission.job}</div>
                  <div className="text-sm text-slate-600">
                    📍 {mission.city} • ⏱️ {mission.time}
                  </div>
                </div>
                <div className="text-lg font-bold text-orange-600">
                  {mission.pay}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// OPTION 2 : Tabs Horizontales (Alternative)
// ============================================================================

export function TabsHero() {
  const [activeTab, setActiveTab] = useState<'recruiter' | 'talent'>('recruiter');

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-full bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab('recruiter')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'recruiter'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏢 Je recrute
          </button>
          <button
            onClick={() => setActiveTab('talent')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'talent'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👤 Je cherche une mission
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
        {activeTab === 'recruiter' ? (
          <div>
            <h2 className="text-3xl font-bold mb-3">
              Trouvez les meilleurs talents en &lt; 2 heures
            </h2>
            <p className="text-slate-600 mb-6">
              Décrivez votre besoin, UWi crée l'annonce et matche les talents automatiquement
            </p>
            {/* Formulaire recruteur */}
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold mb-3">
              Trouvez votre prochaine mission aujourd'hui
            </h2>
            <p className="text-slate-600 mb-6">
              Créez votre profil et recevez des offres qui matchent avec vos compétences
            </p>
            {/* Flow talent */}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Component : Matching Teaser (à ajouter dans le formulaire existant)
// ============================================================================

export function MatchingTeaser({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <Zap size={20} className="text-green-600" />
        </div>
        <div>
          <div className="font-semibold text-sm text-green-900 mb-1">
            🎯 Matching automatique activé
          </div>
          <p className="text-xs text-green-700">
            UWi va chercher les meilleurs talents disponibles et vous notifier instantanément.
            En moyenne <span className="font-semibold">3-5 talents trouvés</span> en moins de 2 heures.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Component : Dual Stats (à ajouter sous le hero)
// ============================================================================

export function DualStats({ userType }: { userType: 'recruiter' | 'talent' }) {
  const stats = {
    recruiter: [
      { icon: '⚡', label: 'Matching en < 2h', value: '92%' },
      { icon: '🎯', label: 'Talents trouvés', value: '3-5' },
      { icon: '✅', label: 'Taux de succès', value: '92%' }
    ],
    talent: [
      { icon: '💼', label: 'Missions/jour', value: '150+' },
      { icon: '⏱️', label: 'Délai moyen', value: '24h' },
      { icon: '💰', label: 'Rémunération', value: '15-25€/h' }
    ]
  };

  return (
    <div className="flex flex-wrap justify-center gap-8 py-8">
      {stats[userType].map((stat, i) => (
        <div key={i} className="text-center">
          <div className="text-3xl mb-2">{stat.icon}</div>
          <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
          <div className="text-sm text-slate-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
