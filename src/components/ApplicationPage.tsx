import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, Send, Upload, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Question {
  id: string;
  question_text: string;
  question_order: number;
}

interface ApplicationPageProps {
  jobId: string;
}

export default function ApplicationPage({ jobId }: ApplicationPageProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState('');
  const [uploadingCv, setUploadingCv] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => {
    loadJobAndQuestions();
  }, [jobId]);

  const loadJobAndQuestions = async () => {
    setLoading(true);

    const { data: jobData } = await supabase
      .from('jobs')
      .select('title, status')
      .eq('id', jobId)
      .eq('status', 'approved')
      .maybeSingle();

    if (!jobData) {
      setError('Offre non trouvée ou non disponible');
      setLoading(false);
      return;
    }

    setJobTitle(jobData.title);

    const { data: questionsData, error: questionsError } = await supabase
      .from('prescreen_questions')
      .select('*')
      .eq('job_id', jobId)
      .order('question_order');

    if (questionsError || !questionsData || questionsData.length === 0) {
      setError('Aucune question de pre-screening configurée');
      setLoading(false);
      return;
    }

    setQuestions(questionsData);
    const initialAnswers: Record<string, boolean> = {};
    questionsData.forEach(q => {
      initialAnswers[q.id] = false;
    });
    setAnswers(initialAnswers);
    setLoading(false);
  };

  const handleAnswerChange = (questionId: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Le CV ne doit pas dépasser 5MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format accepté: PDF, DOC, DOCX uniquement');
      return;
    }

    setCvFile(file);
    setError('');
    setUploadingCv(true);

    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { data, error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(fileName, file);

    if (uploadError) {
      setError('Erreur lors de l\'upload du CV');
      setCvFile(null);
      setUploadingCv(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('cvs')
      .getPublicUrl(fileName);

    setCvUrl(publicUrl);
    setUploadingCv(false);
  };

  const handleRemoveCv = () => {
    setCvFile(null);
    setCvUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      setError('Nom et email requis');
      return;
    }

    setSubmitting(true);
    setError('');

    const { error: insertError } = await supabase
      .from('prescreen_applications')
      .insert({
        job_id: jobId,
        answers,
        applicant_name: name.trim(),
        applicant_email: email.trim(),
        applicant_phone: phone.trim() || null,
        cv_url: cvUrl || null,
        status: 'pending'
      });

    if (insertError) {
      setError('Erreur lors de l\'envoi. Réessayez.');
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
          <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Erreur</h2>
          <p className="text-sm sm:text-base text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Candidature envoyée !</h2>
          <p className="text-sm sm:text-base text-slate-600">
            Merci {name}, votre candidature a été transmise avec succès.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Candidature rapide [V2]
          </h1>
          <h2 className="text-lg sm:text-xl text-slate-600 mb-6 sm:mb-8">
            {jobTitle}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  CV (optionnel)
                </label>
                <p className="text-xs text-slate-500 mb-2">PDF, DOC ou DOCX - Max 5MB</p>

                {!cvFile ? (
                  <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      {uploadingCv ? 'Upload en cours...' : 'Cliquez pour ajouter votre CV'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCvUpload}
                      disabled={uploadingCv}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {cvFile.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(cvFile.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCv}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Retirer
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 sm:pt-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
                Questions de pré-sélection
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">
                Répondez par Oui ou Non
              </p>

              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question.id} className="bg-slate-50 rounded-lg p-3 sm:p-4">
                    <p className="text-sm sm:text-base text-slate-900 mb-3 font-medium">
                      {question.question_text}
                    </p>
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => handleAnswerChange(question.id, true)}
                        className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                          answers[question.id] === true
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAnswerChange(question.id, false)}
                        className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                          answers[question.id] === false
                            ? 'bg-red-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Envoyer ma candidature
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
