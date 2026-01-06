/**
 * AdaptiveResult - Composants adaptatifs selon l'intention détectée
 *
 * Affiche différents résultats selon que l'utilisateur soit :
 * - Recruteur (need_external)
 * - Candidat (personal_search)
 * - Ambigu (ambiguous)
 */

import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  MapPin,
  Clock,
  Star,
  Zap,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  Send,
  Building2
} from 'lucide-react';
import type { IntentType } from '../lib/jobEngine';
import type { MatchedTalent } from '../lib/orchestrator/types';
import type { SimpleAnnouncementDraft } from '../lib/simpleAnnounce';

// ============================================================================
// Types
// ============================================================================

interface AdaptiveResultProps {
  intent: IntentType;
  prompt: string;
  draft?: SimpleAnnouncementDraft | null;
  matchedTalents?: MatchedTalent[];
  onPublishWithoutAccount?: () => void;
  onCreateAccount?: () => void;
  onApplyWithoutAccount?: (missionId: string) => void;
  onCreateProfile?: () => void;
  onClarify?: (clarifiedIntent: 'need_external' | 'personal_search') => void;
}

// ============================================================================
// Composant Principal
// ============================================================================

export function AdaptiveResult({
  intent,
  prompt,
  draft,
  matchedTalents = [],
  onPublishWithoutAccount,
  onCreateAccount,
  onApplyWithoutAccount,
  onCreateProfile,
  onClarify
}: AdaptiveResultProps) {

  // Si ambigu → clarification
  if (intent === 'ambiguous') {
    return (
      <ClarificationBox
        prompt={prompt}
        onClarify={onClarify}
      />
    );
  }

  // Si recruteur → résultat avec annonce + talents
  if (intent === 'need_external') {
    return (
      <RecruiterResult
        draft={draft}
        matchedTalents={matchedTalents}
        onPublishWithoutAccount={onPublishWithoutAccount}
        onCreateAccount={onCreateAccount}
      />
    );
  }

  // Si candidat → résultat avec missions matchées
  if (intent === 'personal_search') {
    return (
      <TalentResult
        prompt={prompt}
        onApplyWithoutAccount={onApplyWithoutAccount}
        onCreateProfile={onCreateProfile}
      />
    );
  }

  return null;
}

// ============================================================================
// Clarification (Ambiguë)
// ============================================================================

function ClarificationBox({
  prompt,
  onClarify
}: {
  prompt: string;
  onClarify?: (intent: 'need_external' | 'personal_search') => void;
}) {
  return (
    <div className="mt-6 rounded-xl border-2 border-orange-200 bg-orange-50 p-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <Zap size={20} className="text-orange-600" />
        </div>
        <div>
          <h3 className="font-semibold text-orange-900 mb-1">
            Précisez votre besoin
          </h3>
          <p className="text-sm text-orange-700">
            "{prompt}" - Que souhaitez-vous faire ?
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <button
          onClick={() => onClarify?.('need_external')}
          className="group p-4 rounded-lg border-2 border-orange-200 bg-white hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
            <span className="font-semibold text-slate-900">Je cherche quelqu'un</span>
          </div>
          <p className="text-sm text-slate-600">
            Publier une annonce et trouver des talents
          </p>
        </button>

        <button
          onClick={() => onClarify?.('personal_search')}
          className="group p-4 rounded-lg border-2 border-orange-200 bg-white hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-orange-600 group-hover:scale-110 transition-transform" size={24} />
            <span className="font-semibold text-slate-900">Je cherche du travail</span>
          </div>
          <p className="text-sm text-slate-600">
            Voir les missions disponibles et postuler
          </p>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Résultat Recruteur
// ============================================================================

function RecruiterResult({
  draft,
  matchedTalents,
  onPublishWithoutAccount,
  onCreateAccount
}: {
  draft?: SimpleAnnouncementDraft | null;
  matchedTalents?: MatchedTalent[];
  onPublishWithoutAccount?: () => void;
  onCreateAccount?: () => void;
}) {
  if (!draft) return null;

  return (
    <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-left duration-500">
      {/* Annonce générée */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <CheckCircle2 className="text-blue-600" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Votre annonce est prête
          </h3>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-slate-900">{draft.jobTitle}</h4>
            {draft.location && (
              <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                <MapPin size={14} />
                {draft.location}
              </p>
            )}
          </div>

          <p className="text-sm text-slate-700">{draft.description}</p>

          {draft.missions.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-1">Missions</div>
              <ul className="list-disc pl-5 text-sm text-slate-600">
                {draft.missions.slice(0, 3).map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Talents matchés */}
      {matchedTalents && matchedTalents.length > 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="text-green-600" size={20} />
              <h3 className="font-semibold text-green-900">
                {matchedTalents.length} talent{matchedTalents.length > 1 ? 's' : ''} trouvé{matchedTalents.length > 1 ? 's' : ''} !
              </h3>
            </div>
            <span className="text-xs text-green-700 flex items-center gap-1">
              <Clock size={12} />
              Disponibles maintenant
            </span>
          </div>

          <div className="space-y-2">
            {matchedTalents.slice(0, 3).map((talent) => (
              <div key={talent.id} className="bg-white rounded-lg border border-green-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {talent.first_name} {talent.last_name?.charAt(0)}.
                      </span>
                      {talent.rating && talent.rating >= 4.5 && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star size={12} fill="currentColor" />
                          {talent.rating}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      <MapPin size={12} className="inline" /> {talent.city}
                      {talent.total_missions && talent.total_missions > 0 && (
                        <span className="ml-2">• {talent.total_missions} missions</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                    ✓ Dispo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="space-y-3">
        <button
          onClick={onPublishWithoutAccount}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Send size={18} />
          Publier l'annonce {matchedTalents && matchedTalents.length > 0 && `+ contacter les ${matchedTalents.length} talents`}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-slate-50 text-slate-500">OU</span>
          </div>
        </div>

        <button
          onClick={onCreateAccount}
          className="w-full px-6 py-3 border-2 border-blue-200 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
        >
          <UserPlus size={18} />
          Créer un compte recruteur
        </button>

        <div className="text-center">
          <p className="text-xs text-slate-600">
            💡 Avec un compte : notifications automatiques, historique des annonces, matching prioritaire
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Résultat Talent
// ============================================================================

function TalentResult({
  prompt,
  onApplyWithoutAccount,
  onCreateProfile
}: {
  prompt: string;
  onApplyWithoutAccount?: (missionId: string) => void;
  onCreateProfile?: () => void;
}) {
  // TODO: Récupérer les vraies missions depuis la DB
  // Pour l'instant, missions mockées
  const mockMissions = [
    {
      id: '1',
      title: 'Serveur expérimenté',
      company: 'Restaurant Le Comptoir',
      city: 'Paris',
      pay: '18€/h',
      time: 'Ce soir 18h-23h',
      urgency: 'high'
    },
    {
      id: '2',
      title: 'Bartender',
      company: 'Bar Le Central',
      city: 'Paris',
      pay: '20€/h',
      time: 'Demain soir 20h-2h',
      urgency: 'medium'
    },
    {
      id: '3',
      title: 'Aide cuisinier',
      company: 'Brasserie du Coin',
      city: 'Paris',
      pay: '16€/h',
      time: 'Ce week-end',
      urgency: 'low'
    }
  ];

  return (
    <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Zap className="text-orange-600" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-orange-900">
            Missions qui correspondent à votre profil
          </h3>
        </div>
        <p className="text-sm text-orange-700">
          Basé sur : "{prompt}"
        </p>
      </div>

      {/* Liste des missions */}
      <div className="space-y-3">
        {mockMissions.map((mission) => (
          <div
            key={mission.id}
            className="group rounded-lg border-2 border-slate-200 bg-white p-4 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => onApplyWithoutAccount?.(mission.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-900">{mission.title}</h4>
                  {mission.urgency === 'high' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                      🔥 Urgent
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
                  <Building2 size={14} />
                  {mission.company}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {mission.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {mission.time}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-orange-600 mb-1">
                  {mission.pay}
                </div>
                <button className="text-sm text-orange-600 font-semibold group-hover:underline flex items-center gap-1">
                  Postuler
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="space-y-3 pt-4">
        <button
          onClick={onCreateProfile}
          className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          <UserPlus size={18} />
          Créer mon profil talent
        </button>

        <div className="text-center">
          <p className="text-xs text-slate-600">
            💡 Avec un profil : recevez des alertes automatiques, postulez en 1 clic, construisez votre réputation
          </p>
        </div>
      </div>
    </div>
  );
}
