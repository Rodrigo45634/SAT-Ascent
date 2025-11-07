
import React, { useState, useEffect, useCallback } from 'react';
import type { Question, Subject } from '../types';
import { generateSatQuestion } from '../services/geminiService';
import { Loader2, Clock, Check, X, Sparkles } from './icons';

const CHALLENGE_LENGTH = 5; // Number of questions
const TIME_PER_QUESTION = 90; // Seconds

interface ChallengeModeProps {
  onQuestionAnswered: (subject: Subject, correct: boolean) => void;
}

export const ChallengeMode: React.FC<ChallengeModeProps> = ({ onQuestionAnswered }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(CHALLENGE_LENGTH * TIME_PER_QUESTION);
  const [challengeState, setChallengeState] = useState<'loading' | 'active' | 'finished'>('loading');

  const startChallenge = useCallback(async () => {
    setChallengeState('loading');
    const questionPromises: Promise<Question>[] = [];
    const subjects: Subject[] = ['Math', 'Math', 'Reading', 'Writing', 'Writing']; 
    for (let i = 0; i < CHALLENGE_LENGTH; i++) {
      questionPromises.push(generateSatQuestion(subjects[i % subjects.length], 'Medium'));
    }
    try {
      const newQuestions = await Promise.all(questionPromises);
      setQuestions(newQuestions);
      setAnswers(new Array(CHALLENGE_LENGTH).fill(null));
      setCurrentQuestionIndex(0);
      setTimeLeft(CHALLENGE_LENGTH * TIME_PER_QUESTION);
      setChallengeState('active');
    } catch (error) {
      console.error("Failed to load challenge questions:", error);
      // Handle error state
    }
  }, []);

  useEffect(() => {
    startChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (challengeState === 'active' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (challengeState === 'active' && timeLeft === 0) {
      finishChallenge();
    }
  }, [timeLeft, challengeState]);

  const handleAnswerSelect = (optionKey: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionKey;
    setAnswers(newAnswers);
  };

  const finishChallenge = () => {
    setChallengeState('finished');
    answers.forEach((answer, index) => {
      if (answer !== null) {
        onQuestionAnswered(questions[index].subject, answer === questions[index].correctAnswer);
      }
    });
  };

  if (challengeState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Preparing Your Challenge...</h2>
        <p className="text-slate-500">Get ready to test your skills under pressure!</p>
      </div>
    );
  }
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const currentQuestion = questions[currentQuestionIndex];

  if (challengeState === 'finished') {
    const correctCount = answers.filter((ans, i) => ans === questions[i].correctAnswer).length;
    return (
        <div className="max-w-3xl mx-auto text-center bg-white p-8 rounded-xl shadow-lg border border-slate-200">
            <Sparkles className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-extrabold text-slate-800">Challenge Complete!</h2>
            <p className="text-6xl font-bold my-4">{correctCount} <span className="text-4xl text-slate-500">/ {CHALLENGE_LENGTH}</span></p>
            <p className="text-lg text-slate-600 mb-8">Great job simulating test conditions. Review your answers to learn and improve.</p>
            <button onClick={startChallenge} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                Start a New Challenge
            </button>
        </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Challenge Mode</h2>
          <div className="flex items-center text-lg font-semibold bg-slate-200 text-slate-700 px-3 py-1 rounded-lg">
            <Clock className="h-5 w-5 mr-2" />
            <span>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
          </div>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / CHALLENGE_LENGTH) * 100}%` }}></div>
        </div>

        {currentQuestion && (
             <div>
                <p className="text-sm font-semibold text-blue-600 mb-2">{currentQuestion.subject} - {currentQuestion.topic}</p>
                <p className="text-lg text-slate-800 whitespace-pre-wrap mb-6">{currentQuestion.question}</p>
                <div className="space-y-3">
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                    <button
                        key={key}
                        onClick={() => handleAnswerSelect(key)}
                        className={`flex items-start text-left w-full p-4 border-2 rounded-lg transition-colors duration-200 ${
                            answers[currentQuestionIndex] === key ? 'border-blue-600 bg-blue-100 ring-2 ring-blue-400' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                        }`}
                    >
                    <span className="font-bold mr-3">{key}.</span>
                    <span className="flex-1">{value}</span>
                    </button>
                ))}
                </div>
             </div>
        )}
        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between">
            <button 
                onClick={() => setCurrentQuestionIndex(i => Math.max(0, i-1))}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 disabled:opacity-50"
            >
                Previous
            </button>
            {currentQuestionIndex < CHALLENGE_LENGTH - 1 ? (
                <button 
                    onClick={() => setCurrentQuestionIndex(i => Math.min(CHALLENGE_LENGTH - 1, i+1))}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700"
                >
                    Next
                </button>
            ) : (
                <button 
                    onClick={finishChallenge}
                    className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700"
                >
                    Finish
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
