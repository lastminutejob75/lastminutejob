import { useState, useRef } from 'react';
import { X, Mail, Phone, FileText, Upload, XCircle } from 'lucide-react';

interface PrescreenQuestion {
  id: string;
  question_text: string;
  question_order: number;
}

interface PrescreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: PrescreenQuestion[];
  jobTitle: string;
  contactEmail?: string;
  contactPhone?: string;
}

export default function PrescreenModal({
  isOpen,
  onClose,
  questions,
  jobTitle,
  contactEmail,
  contactPhone
}: PrescreenModalProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limiter à 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximale : 5MB');
        return;
      }
      // Accepter seulement PDF, DOC, DOCX
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format de fichier non supporté. Veuillez utiliser PDF, DOC ou DOCX');
        return;
      }
      setCvFile(file);
      setCvFileName(file.name);
    }
  };

  const removeCv = () => {
    setCvFile(null);
    setCvFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (method: 'email' | 'phone') => {
    const answersText = questions
      .map((q, i) => `${i + 1}. ${q.question_text}\nRéponse: ${answers[q.id] || 'Non répondu'}`)
      .join('\n\n');

    if (method === 'email' && contactEmail) {
      const cvNote = cvFile ? `\n\n📎 CV joint : ${cvFileName}\n(Je peux vous envoyer mon CV sur demande si nécessaire)` : '';
      const subject = encodeURIComponent(`[LastMinuteJob by UWI] Candidature - ${jobTitle}`);
      const body = encodeURIComponent(`Bonjour,\n\nJe souhaite postuler pour le poste de ${jobTitle}.\n\nRéponses aux questions de pré-sélection:\n\n${answersText}${cvNote}\n\nCordialement\n\n---\nCette candidature a été envoyée via LastMinuteJob by UWI\nPlateforme de recrutement rapide\nwww.lastminutejob.pro`);
      window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    } else if (method === 'phone' && contactPhone) {
      window.location.href = `tel:${contactPhone.replace(/\s+/g, '')}`;
    }

    onClose();
  };

  const allAnswered = questions.every(q => answers[q.id]?.trim());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold">Questions de pré-sélection</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <p className="text-sm text-gray-600 mb-6">
            Veuillez répondre à ces questions avant de postuler pour <span className="font-medium">{jobTitle}</span>
          </p>

          <div className="space-y-6">
            {questions.map((question) => (
              <div key={question.id}>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {question.question_order + 1}. {question.question_text}
                </label>
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="Votre réponse..."
                />
              </div>
            ))}
          </div>

          {/* Upload CV - Optionnel */}
          <div className="mt-6 pt-6 border-t">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              <FileText className="w-4 h-4 inline mr-2" />
              Joindre un CV (optionnel)
            </label>
            {!cvFile ? (
              <label className="block">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-sm text-gray-600">Cliquez pour téléverser votre CV</span>
                    <span className="text-xs text-gray-400">PDF, DOC, DOCX (max 5MB)</span>
                  </div>
                </div>
              </label>
            ) : (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-blue-900 truncate">{cvFileName}</span>
                </div>
                <button
                  onClick={removeCv}
                  className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                  title="Retirer le CV"
                >
                  <XCircle className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t space-y-3">
            {contactEmail && contactPhone && (
              <>
                <button
                  onClick={() => handleSubmit('email')}
                  disabled={!allAnswered}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Postuler par email
                </button>
                <button
                  onClick={() => handleSubmit('phone')}
                  disabled={!allAnswered}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-50 active:bg-blue-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Postuler par téléphone
                </button>
              </>
            )}

            {contactEmail && !contactPhone && (
              <button
                onClick={() => handleSubmit('email')}
                disabled={!allAnswered}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Mail className="w-4 h-4" />
                Postuler par email
              </button>
            )}

            {!contactEmail && contactPhone && (
              <button
                onClick={() => handleSubmit('phone')}
                disabled={!allAnswered}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Phone className="w-4 h-4" />
                Postuler par téléphone
              </button>
            )}

            {!allAnswered && (
              <p className="text-xs text-center text-gray-500">
                Veuillez répondre à toutes les questions pour continuer
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
