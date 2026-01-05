import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

interface PrescreenQuestion {
  question_text: string;
  question_order: number;
  is_default?: boolean;
}

interface PrescreenQuestionsProps {
  questions: PrescreenQuestion[];
  onChange: (questions: PrescreenQuestion[]) => void;
}

const DEFAULT_QUESTIONS = [
  "Avez-vous de l'expérience sur ce poste ?",
  "Êtes-vous disponible pour cette mission ?",
  "Avez-vous la mobilité nécessaire pour vous rendre sur le lieu de la mission ?"
];

export default function PrescreenQuestions({ questions, onChange }: PrescreenQuestionsProps) {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (questions.length === 0) {
      const defaultQuestions = DEFAULT_QUESTIONS.map((text, index) => ({
        question_text: text,
        question_order: index,
        is_default: true
      }));
      onChange(defaultQuestions);
    }
  }, []);

  const addQuestion = () => {
    const newQuestion: PrescreenQuestion = {
      question_text: '',
      question_order: questions.length
    };
    onChange([...questions, newQuestion]);
    setCollapsed(false);
  };

  const updateQuestion = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].question_text = text;
    onChange(updated);
  };

  const removeQuestion = (index: number) => {
    const updated = questions
      .filter((_, i) => i !== index)
      .map((q, i) => ({ ...q, question_order: i }));
    onChange(updated);
  };

  return (
    <div className="p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl border bg-white">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between mb-2"
      >
        <div className="text-[11px] sm:text-xs md:text-sm font-medium">
          Questions de pré-sélection {questions.length > 0 && `(${questions.length})`}
        </div>
        <div className="text-[9px] sm:text-[10px] text-gray-500">
          {collapsed ? 'Afficher' : 'Masquer'}
        </div>
      </button>

      {!collapsed && (
        <div className="space-y-2">
          <p className="text-[9px] sm:text-[10px] text-gray-600 mb-2">
            Questions par défaut - modifiez-les ou ajoutez-en d'autres
          </p>

          {questions.map((q, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={q.question_text}
                  onChange={(e) => updateQuestion(index, e.target.value)}
                  placeholder={`Question ${index + 1}`}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-[11px] sm:text-xs"
                />
              </div>
              <button
                onClick={() => removeQuestion(index)}
                className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                title="Supprimer"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ))}

          <button
            onClick={addQuestion}
            className="w-full px-3 py-2 rounded-lg border border-dashed text-[10px] sm:text-xs text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter une question personnalisée
          </button>
        </div>
      )}
    </div>
  );
}
