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
    <div className="mt-6 rounded-3xl border-4 border-orange-300 bg-gradient-to-br from-orange-100 to-amber-100 p-8 sm:p-10 animate-in fade-in slide-in-from-top-2 duration-500 shadow-2xl">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-xl animate-pulse">
          <Zap size={32} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black text-orange-900 mb-2">
            ⚡ Précisez votre besoin
          </h3>
          <p className="text-base text-orange-800 leading-relaxed font-semibold">
            <span className="font-bold">"{prompt}"</span>
            <br />
            <span className="text-orange-700">→ Que souhaitez-vous faire ?</span>
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <button
          onClick={() => onClarify?.('need_external')}
          className="group relative overflow-hidden p-6 rounded-2xl border-4 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:border-blue-500 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 text-left shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-rotate-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-125 transition-transform shadow-lg">
                <Briefcase className="text-white" size={28} />
              </div>
              <span className="text-xl font-black text-slate-900">Je cherche quelqu'un</span>
            </div>
            <p className="text-base text-slate-700 leading-relaxed font-semibold">
              📢 Publier une annonce et trouver des talents
            </p>
          </div>
        </button>

        <button
          onClick={() => onClarify?.('personal_search')}
          className="group relative overflow-hidden p-6 rounded-2xl border-4 border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 hover:border-orange-500 hover:from-orange-100 hover:to-orange-200 transition-all duration-300 text-left shadow-xl hover:shadow-2xl transform hover:scale-105 hover:rotate-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-125 transition-transform shadow-lg">
                <Users className="text-white" size={28} />
              </div>
              <span className="text-xl font-black text-slate-900">Je cherche du travail</span>
            </div>
            <p className="text-base text-slate-700 leading-relaxed font-semibold">
              💼 Voir les missions disponibles et postuler
            </p>
          </div>
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
    <div className="mt-6 space-y-5 animate-in fade-in slide-in-from-left duration-500">
      {/* Annonce générée */}
      <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50/30 p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <CheckCircle2 className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              ✨ Votre annonce est prête
            </h3>
            <p className="text-sm text-blue-600 font-medium">
              Optimisée par l'IA pour attirer les meilleurs talents
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white border border-blue-100">
            <h4 className="text-lg font-bold text-slate-900 mb-2">{draft.jobTitle}</h4>
            {draft.location && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                <MapPin size={16} className="text-blue-500" />
                <span className="font-medium">{draft.location}</span>
              </div>
            )}
            <p className="text-sm text-slate-700 leading-relaxed">{draft.description}</p>
          </div>

          {draft.missions.length > 0 && (
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <div className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Missions principales
              </div>
              <ul className="space-y-2">
                {draft.missions.slice(0, 3).map((m, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Talents matchés */}
      {matchedTalents && matchedTalents.length > 0 && (
        <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 sm:p-8 shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900">
                  🎉 {matchedTalents.length} talent{matchedTalents.length > 1 ? 's' : ''} trouvé{matchedTalents.length > 1 ? 's' : ''} !
                </h3>
                <p className="text-sm text-green-700 font-medium flex items-center gap-1.5 mt-1">
                  <Clock size={14} />
                  Disponibles maintenant
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {matchedTalents.slice(0, 3).map((talent) => (
              <div key={talent.id} className="group bg-white rounded-xl border-2 border-green-200 p-4 hover:border-green-400 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-slate-900 text-base">
                        {talent.first_name} {talent.last_name?.charAt(0)}.
                      </span>
                      {talent.rating && talent.rating >= 4.5 && (
                        <span className="text-xs bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold shadow-sm">
                          <Star size={12} fill="currentColor" />
                          {talent.rating}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-green-500" />
                        <span className="font-medium">{talent.city}</span>
                      </span>
                      {talent.total_missions && talent.total_missions > 0 && (
                        <span className="flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                          <span>{talent.total_missions} missions</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-green-100 border border-green-300 text-green-800 font-bold text-sm group-hover:bg-green-200 transition-colors">
                    ✓ Dispo
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="space-y-4">
        <button
          onClick={onPublishWithoutAccount}
          className="group w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          <Send size={20} className="group-hover:translate-x-1 transition-transform" />
          <span>
            Publier l'annonce
            {matchedTalents && matchedTalents.length > 0 && (
              <span className="font-normal"> + contacter les {matchedTalents.length} talents</span>
            )}
          </span>
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 py-1 bg-white text-slate-500 font-semibold rounded-full">OU</span>
          </div>
        </div>

        <button
          onClick={onCreateAccount}
          className="group w-full px-6 py-4 border-2 border-blue-300 bg-white hover:bg-blue-50 text-blue-700 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 hover:border-blue-400 hover:shadow-md transform hover:scale-[1.01]"
        >
          <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
          Créer un compte recruteur
        </button>

        <div className="text-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-bold text-blue-700">💡 Avec un compte :</span> notifications automatiques, historique des annonces, matching prioritaire
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
    <div className="mt-6 space-y-5 animate-in fade-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 sm:p-8 shadow-lg">
        <div className="flex items-start gap-4 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md flex-shrink-0">
            <Zap className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-orange-900 mb-1">
              ✨ Missions qui correspondent à votre profil
            </h3>
            <p className="text-sm text-orange-700 leading-relaxed">
              Basé sur : <span className="font-semibold">"{prompt}"</span>
            </p>
          </div>
        </div>
      </div>

      {/* Liste des missions */}
      <div className="space-y-3">
        {mockMissions.map((mission, index) => (
          <div
            key={mission.id}
            className="group relative overflow-hidden rounded-xl border-2 border-slate-200 bg-white p-5 hover:border-orange-400 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.01]"
            onClick={() => onApplyWithoutAccount?.(mission.id)}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {mission.urgency === 'high' && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-12 -mt-12 opacity-50"></div>
            )}
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-bold text-slate-900">{mission.title}</h4>
                  {mission.urgency === 'high' && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-red-100 to-orange-100 text-red-700 font-bold shadow-sm animate-pulse">
                      🔥 Urgent
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                  <Building2 size={16} className="text-orange-500" />
                  <span className="font-medium">{mission.company}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-orange-500" />
                    <span className="font-medium">{mission.city}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-orange-500" />
                    <span>{mission.time}</span>
                  </span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <div className="text-2xl font-bold text-orange-600">
                  {mission.pay}
                </div>
                <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm flex items-center gap-2 group-hover:from-orange-600 group-hover:to-orange-700 transition-all shadow-md">
                  Postuler
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="space-y-4 pt-2">
        <button
          onClick={onCreateProfile}
          className="group w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
          Créer mon profil talent
        </button>

        <div className="text-center p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-bold text-orange-700">💡 Avec un profil :</span> recevez des alertes automatiques, postulez en 1 clic, construisez votre réputation
          </p>
        </div>
      </div>
    </div>
  );
}
