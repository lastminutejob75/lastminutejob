/**
 * QuickApplyModal - Modal pour postuler SANS créer de compte
 *
 * Permet à un talent de postuler avec juste :
 * - Nom/Prénom
 * - Email
 * - Téléphone
 *
 * Friction minimale, conversion maximale
 */

import React, { useState } from 'react';
import { X, Send, Loader, CheckCircle } from 'lucide-react';

interface QuickApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionTitle?: string;
  missionCompany?: string;
  onSubmit: (data: QuickApplyData) => Promise<void>;
}

export interface QuickApplyData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message?: string;
}

export function QuickApplyModal({
  isOpen,
  onClose,
  missionTitle = 'cette mission',
  missionCompany,
  onSubmit
}: QuickApplyModalProps) {
  const [formData, setFormData] = useState<QuickApplyData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation basique
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation email simple
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Email invalide');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      setIsSuccess(true);

      // Fermer après 2 secondes
      setTimeout(() => {
        onClose();
        // Reset après fermeture
        setTimeout(() => {
          setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
          setIsSuccess(false);
        }, 300);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error on change
    if (error) setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isSuccess ? 'Candidature envoyée !' : 'Postuler en 30 secondes'}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {isSuccess
                  ? 'Nous vous recontacterons rapidement'
                  : `Pour ${missionTitle}${missionCompany ? ` - ${missionCompany}` : ''}`
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              disabled={isSubmitting}
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Candidature envoyée avec succès !
              </h3>
              <p className="text-slate-600">
                L'employeur va recevoir votre candidature et vous recontactera rapidement.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom Prénom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Jean"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Dupont"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jean.dupont@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="06 12 34 56 78"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Message optionnel */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Message (optionnel)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Présentez brièvement votre profil et votre motivation..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Envoyer ma candidature
                  </>
                )}
              </button>

              {/* Info */}
              <p className="text-xs text-center text-slate-600">
                💡 En postulant, vous acceptez que vos coordonnées soient transmises à l'employeur
              </p>

              {/* CTA Créer profil */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-center text-slate-600 mb-2">
                  Vous postulez souvent ?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    // TODO: Rediriger vers création profil
                    console.log('Créer profil talent');
                  }}
                  className="w-full text-sm text-orange-600 font-medium hover:underline"
                >
                  Créer un profil pour postuler en 1 clic
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Hook pour gérer le modal
// ============================================================================

export function useQuickApplyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<{
    id: string;
    title?: string;
    company?: string;
  } | null>(null);

  const openModal = (missionId: string, title?: string, company?: string) => {
    setSelectedMission({ id: missionId, title, company });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedMission(null), 300);
  };

  return {
    isOpen,
    selectedMission,
    openModal,
    closeModal
  };
}
