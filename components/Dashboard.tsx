
import React from 'react';
import type { UserStats } from '../types';
import { AnalyticsChart } from './AnalyticsChart';
import { Flame, Target, CheckCircle, Trophy, Zap, Calendar } from './icons';

interface DashboardProps {
  stats: UserStats;
  dailyProgress: { count: number; goal: number };
  streak: number;
  resetDailyProgress: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, dailyProgress, streak, resetDailyProgress }) => {
  const totalQuestions = Object.values(stats).reduce((acc, subject) => acc + subject.correct + subject.incorrect, 0);
  const totalCorrect = Object.values(stats).reduce((acc, subject) => acc + subject.correct, 0);
  const overallAccuracy = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : 0;
  
  const progressPercentage = Math.min((dailyProgress.count / dailyProgress.goal) * 100, 100);

  const predictedScore = () => {
    const mathAccuracy = stats.Math.correct + stats.Math.incorrect > 0 ? (stats.Math.correct / (stats.Math.correct + stats.Math.incorrect)) : 0;
    const readingWritingAccuracy = (stats.Reading.correct + stats.Writing.correct + stats.Reading.incorrect + stats.Writing.incorrect) > 0 ? ((stats.Reading.correct + stats.Writing.correct) / (stats.Reading.correct + stats.Writing.correct + stats.Reading.incorrect + stats.Writing.incorrect)) : 0;

    const mathScore = 200 + Math.round(mathAccuracy * 600);
    const readingWritingScore = 200 + Math.round(readingWritingAccuracy * 600);
    
    return {
        total: Math.min(1600, mathScore + readingWritingScore),
        math: Math.min(800, mathScore),
        readingWriting: Math.min(800, readingWritingScore)
    }
  };
  
  const score = predictedScore();

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800">Welcome back!</h1>
        <p className="text-slate-500 mt-1">Let's conquer the SAT today. Keep up the great work!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold text-slate-700">Predicted Score</h3>
              <Trophy className="h-6 w-6 text-yellow-500" />
            </div>
            <p className="text-4xl font-extrabold text-slate-800 mt-2">{score.total}</p>
          </div>
          <div className="text-sm text-slate-500 mt-2">
            <p>Math: {score.math}</p>
            <p>Reading & Writing: {score.readingWriting}</p>
          </div>
        </div>
        <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-semibold text-slate-700">Overall Accuracy</h3>
            <Target className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-4xl font-extrabold text-slate-800 mt-2">{overallAccuracy}%</p>
          <p className="text-sm text-slate-500 mt-2">{totalCorrect} / {totalQuestions} correct</p>
        </div>
        <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-semibold text-slate-700">Study Streak</h3>
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <p className="text-4xl font-extrabold text-slate-800 mt-2">{streak} <span className="text-2xl font-semibold">days</span></p>
          <p className="text-sm text-slate-500 mt-2">Keep the fire burning!</p>
        </div>
        <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-slate-700">Daily Goal</h3>
                <CheckCircle className="h-6 w-6 text-blue-500"/>
            </div>
            <div className="mt-2">
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <p className="text-sm text-slate-500 mt-2 text-right">{dailyProgress.count} / {dailyProgress.goal} questions</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Performance Breakdown</h3>
            <div className="h-80">
                <AnalyticsChart stats={stats} />
            </div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-xl font-bold text-slate-800">Quick Actions</h3>
            <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                <Zap className="h-5 w-5 mr-2" />
                Start 5-Minute Quiz
            </button>
            <button className="w-full flex items-center justify-center px-4 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors">
                <Calendar className="h-5 w-5 mr-2" />
                Schedule Study Session
            </button>
            <button 
              onClick={resetDailyProgress}
              className="w-full text-sm text-center text-slate-500 hover:text-slate-700 transition-colors"
            >
              Reset Daily Progress
            </button>
        </div>
      </div>
    </div>
  );
};
