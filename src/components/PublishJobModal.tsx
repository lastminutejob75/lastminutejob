/**
 * PublishJobModal - Modal pour publier une annonce SANS créer de compte
 *
 * Permet à un recruteur de publier avec juste :
 * - Nom/Prénom
 * - Email
 * - Téléphone
 * - Nom de l'entreprise (optionnel)
 *
 * Friction minimale, conversion maximale
 */

import React, { useState } from 'react';
import { X, Send, Loader, CheckCircle, Briefcase } from 'lucide-react';

interface PublishJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle?: string;
  onSubmit: (data: PublishJobData) => Promise<void>;
}

export interface PublishJobData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
}

export function PublishJobModal({
  isOpen,
  onClose,
  jobTitle = 'cette annonce',
  onSubmit
}: PublishJobModalProps) {
  const [formData, setFormData] = useState<PublishJobData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: ''
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
          setFormData({ firstName: '', lastName: '', email: '', phone: '', company: '' });
          setIsSuccess(false);
        }, 300);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Briefcase className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Publier l'annonce</h3>
              <p className="text-sm text-slate-600">{jobTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Annonce publiée !</h4>
                <p className="text-sm text-slate-600">
                  Nous vous contacterons par email dès que des talents correspondront.
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                Renseignez vos coordonnées pour recevoir les candidatures
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Jean"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dupont"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="jean.dupont@email.fr"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="06 12 34 56 78"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Restaurant Le Comptoir"
                  disabled={isSubmitting}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Publication en cours...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Publier l'annonce
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-center text-slate-500">
                En publiant, vous acceptez que nous partagions vos coordonnées avec les candidats potentiels.
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

// Hook pour gérer l'ouverture/fermeture du modal
export function usePublishJobModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState<string>('');

  const openModal = (title: string) => {
    console.log("[PublishJobModal] 🔓 Ouverture modal avec titre:", title);
    setJobTitle(title);
    setIsOpen(true);
  };

  const closeModal = () => {
    console.log("[PublishJobModal] 🔒 Fermeture modal");
    setIsOpen(false);
  };

  return {
    isOpen,
    jobTitle,
    openModal,
    closeModal
  };
}
