import React, { useState, useEffect } from 'react';
import { Plus, X, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PrescreenQuestion {
  id?: string;
  question_text: string;
  question_order: number;
}

interface PrescreenConfigProps {
  jobId: string;
  editToken: string;
}

export default function PrescreenConfig({ jobId, editToken }: PrescreenConfigProps) {
  const [questions, setQuestions] = useState<PrescreenQuestion[]>([
    { question_text: 'Êtes-vous disponible immédiatement ?', question_order: 0 },
    { question_text: 'Avez-vous au moins 2 ans d\'expérience ?', question_order: 1 },
    { question_text: 'Êtes-vous basé dans la région ?', question_order: 2 }
  ]);
  const [applicationLink, setApplicationLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [jobId]);

  const loadQuestions = async () => {
    const { data, error } = await supabase
      .from('prescreen_questions')
      .select('*')
      .eq('job_id', jobId)
      .order('question_order');

    if (data && data.length > 0) {
      setQuestions(data);
    }
  };

  const saveQuestions = async () => {
    setLoading(true);

    await supabase
      .from('prescreen_questions')
      .delete()
      .eq('job_id', jobId);

    const questionsToInsert = questions.map(q => ({
      job_id: jobId,
      question_text: q.question_text,
      question_order: q.question_order
    }));

    const { error } = await supabase
      .from('prescreen_questions')
      .insert(questionsToInsert);

    if (!error) {
      const link = `${window.location.origin}/#/apply/${jobId}`;
      setApplicationLink(link);
    }

    setLoading(false);
  };

  const updateQuestion = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].question_text = text;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index)
      .map((q, i) => ({ ...q, question_order: i }));
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    if (questions.length < 5) {
      setQuestions([...questions, {
        question_text: '',
        question_order: questions.length
      }]);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(applicationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Pre-screening (Oui/Non)
        </h3>
        <p className="text-sm text-slate-600">
          Configurez jusqu'à 5 questions rapides pour filtrer les candidats
        </p>
      </div>

      <div className="space-y-3">
        {questions.map((q, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={q.question_text}
                onChange={(e) => updateQuestion(index, e.target.value)}
                placeholder={`Question ${index + 1}`}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <button
              onClick={() => removeQuestion(index)}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {questions.length < 5 && (
        <button
          onClick={addQuestion}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Ajouter une question
        </button>
      )}

      <div className="pt-4 border-t border-slate-200">
        <button
          onClick={saveQuestions}
          disabled={loading || questions.some(q => !q.question_text.trim())}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {loading ? 'Génération...' : 'Générer le lien de candidature'}
        </button>
      </div>

      {applicationLink && (
        <div className="bg-blue-50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2">
            <LinkIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Lien de candidature généré
              </p>
              <p className="text-xs text-blue-700 break-all">
                {applicationLink}
              </p>
            </div>
          </div>
          <button
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copier le lien
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
