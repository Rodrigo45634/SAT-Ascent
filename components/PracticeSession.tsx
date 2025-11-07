import React, { useState, useEffect, useCallback } from 'react';
import type { Question, Subject, Difficulty, UserStats } from '../types';
import { generateSatQuestion, getTutorFeedback } from '../services/geminiService';
import { Loader2, Lightbulb, Check, X, ArrowRight } from './icons';

interface PracticeSessionProps {
  onQuestionAnswered: (subject: Subject, correct: boolean) => void;
  stats: UserStats;
}

const subjects: Subject[] = ['Math', 'Reading', 'Writing'];

const getAdaptiveDifficulty = (subjectStats: UserStats[Subject]): Difficulty => {
  const accuracy = (subjectStats.correct + subjectStats.incorrect) > 0 
    ? subjectStats.correct / (subjectStats.correct + subjectStats.incorrect)
    : 0.5;
  
  if (accuracy > 0.75) return 'Hard';
  if (accuracy < 0.4) return 'Easy';
  return 'Medium';
};

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center text-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-lg font-semibold text-slate-700">Generating your next question...</p>
        <p className="text-slate-500">Our AI is crafting the perfect challenge for you.</p>
    </div>
);

export const PracticeSession: React.FC<PracticeSessionProps> = ({ onQuestionAnswered, stats }) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Math');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [tutorFeedback, setTutorFeedback] = useState('');
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(false);

  const fetchQuestion = useCallback(async (subject: Subject) => {
    setLoading(true);
    setError(null);
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTutorFeedback('');
    setIsExplanationExpanded(false);

    try {
      const difficulty = getAdaptiveDifficulty(stats[subject]);
      const question = await generateSatQuestion(subject, difficulty);
      setCurrentQuestion(question);
    } catch (err) {
      setError('Failed to load question. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [stats]);

  useEffect(() => {
    fetchQuestion(selectedSubject);
  }, [selectedSubject, fetchQuestion]);

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setIsAnswered(true);
    onQuestionAnswered(currentQuestion.subject, isCorrect);
    
    setIsFeedbackLoading(true);
    try {
        const feedback = await getTutorFeedback(isCorrect ? 'correct' : 'incorrect', currentQuestion);
        setTutorFeedback(feedback);
    } catch (err) {
        setTutorFeedback(isCorrect ? "Great job!" : "Keep practicing, you'll get it!");
        console.error("Failed to get tutor feedback:", err);
    } finally {
        setIsFeedbackLoading(false);
    }
  };

  const handleNextQuestion = () => {
    fetchQuestion(selectedSubject);
  };
  
  const getOptionClasses = (optionKey: string) => {
    let classes = 'border-slate-300 hover:border-blue-500 hover:bg-blue-50';
    if (isAnswered) {
        if (optionKey === currentQuestion?.correctAnswer) {
            classes = 'bg-green-100 border-green-400 text-green-800';
        } else if (optionKey === selectedAnswer) {
            classes = 'bg-red-100 border-red-400 text-red-800';
        } else {
            classes = 'border-slate-300 opacity-60';
        }
    } else if (selectedAnswer === optionKey) {
        classes = 'border-blue-600 bg-blue-100 ring-2 ring-blue-400';
    }
    return classes;
  };
  
  const explanation = currentQuestion?.explanation || '';
  const isLongExplanation = explanation.length > 200;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-center mb-6 bg-slate-200 p-1 rounded-lg">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            className={`w-full py-2 px-4 text-sm font-semibold rounded-md transition-colors ${
              selectedSubject === subject ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:bg-slate-300'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-[500px] flex flex-col">
        {loading && <LoadingSpinner />}
        {error && <div className="text-center text-red-500">{error}</div>}
        {currentQuestion && !loading && (
          <>
            <div className="flex-grow">
                <p className="text-sm font-semibold text-blue-600 mb-2">{currentQuestion.subject} - {currentQuestion.topic}</p>
                <p className="text-lg text-slate-800 whitespace-pre-wrap mb-6">{currentQuestion.question}</p>
                <div className="space-y-3">
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                    <button
                    key={key}
                    onClick={() => !isAnswered && setSelectedAnswer(key)}
                    className={`flex items-start text-left w-full p-4 border-2 rounded-lg transition-all duration-200 ${getOptionClasses(key)}`}
                    disabled={isAnswered}
                    >
                    <span className="font-bold mr-3">{key}.</span>
                    <span className="flex-1">{value}</span>
                    {isAnswered && key === currentQuestion.correctAnswer && <Check className="h-5 w-5 text-green-600 ml-2 flex-shrink-0" />}
                    {isAnswered && key === selectedAnswer && key !== currentQuestion.correctAnswer && <X className="h-5 w-5 text-red-600 ml-2 flex-shrink-0" />}
                    </button>
                ))}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
                {isAnswered && (
                <div className="mb-4 space-y-4">
                    <div className="bg-slate-100 p-4 rounded-lg">
                        <h3 className="font-bold text-slate-800 flex items-center mb-2"><Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />Explanation</h3>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {isLongExplanation && !isExplanationExpanded
                                ? `${explanation.substring(0, 200)}...`
                                : explanation
                            }
                        </p>
                        {isLongExplanation && (
                            <button
                                onClick={() => setIsExplanationExpanded(!isExplanationExpanded)}
                                className="text-sm font-semibold text-blue-600 hover:underline mt-2 block"
                            >
                                {isExplanationExpanded ? 'Show Less' : 'Show More'}
                            </button>
                        )}
                    </div>
                    {isFeedbackLoading ? (
                        <div className="flex items-center text-sm text-slate-500">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Getting feedback...
                        </div>
                    ) : (
                        tutorFeedback && <div className="text-sm italic text-blue-700 p-3 bg-blue-50 rounded-lg">"{tutorFeedback}"</div>
                    )}
                </div>
                )}
                
                {isAnswered ? (
                    <button
                        onClick={handleNextQuestion}
                        className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-transform hover:scale-105"
                    >
                        Next Question <ArrowRight className="h-5 w-5 ml-2" />
                    </button>
                ) : (
                    <button
                        onClick={handleAnswerSubmit}
                        disabled={!selectedAnswer}
                        className="w-full px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                        Submit Answer
                    </button>
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};