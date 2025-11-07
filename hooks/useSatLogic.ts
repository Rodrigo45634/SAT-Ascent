
import { useState, useEffect, useCallback } from 'react';
import type { UserStats, Subject } from '../types';

const getInitialStats = (): UserStats => {
  try {
    const savedStats = localStorage.getItem('satAscentStats');
    if (savedStats) {
      return JSON.parse(savedStats);
    }
  } catch (error) {
    console.error("Could not parse stats from localStorage", error);
  }
  return {
    Math: { correct: 0, incorrect: 0 },
    Reading: { correct: 0, incorrect: 0 },
    Writing: { correct: 0, incorrect: 0 },
  };
};

const getInitialDailyProgress = () => {
  try {
    const savedProgress = localStorage.getItem('satAscentDailyProgress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        const today = new Date().toLocaleDateString();
        // Reset if it's a new day
        if (progress.date !== today) {
            return { count: 0, goal: 10, date: today };
        }
        return progress;
    }
  } catch (error) {
    console.error("Could not parse daily progress from localStorage", error);
  }
  return { count: 0, goal: 10, date: new Date().toLocaleDateString() };
}

const getInitialStreak = () => {
    try {
        const savedStreak = localStorage.getItem('satAscentStreak');
        if (savedStreak) {
            const { streak, date } = JSON.parse(savedStreak);
            const today = new Date();
            const lastDate = new Date(date);
            const diffTime = today.getTime() - lastDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 1) {
                return 0; // Streak broken
            }
            return streak;
        }
    } catch (error) {
        console.error("Could not parse streak from localStorage", error);
    }
    return 0;
}

export const useSatLogic = () => {
  const [stats, setStats] = useState<UserStats>(getInitialStats);
  const [dailyProgress, setDailyProgress] = useState(getInitialDailyProgress);
  const [streak, setStreak] = useState(getInitialStreak);

  useEffect(() => {
    localStorage.setItem('satAscentStats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('satAscentDailyProgress', JSON.stringify(dailyProgress));
  }, [dailyProgress]);

  const updateStreak = useCallback(() => {
    const today = new Date();
    const todayStr = today.toLocaleDateString();
    
    const savedStreakData = localStorage.getItem('satAscentStreak');
    let lastDateStr = null;
    if (savedStreakData) {
        lastDateStr = JSON.parse(savedStreakData).date;
    }

    if (lastDateStr !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        
        if (lastDateStr === yesterday.toLocaleDateString()) {
            setStreak(prev => prev + 1);
        } else {
            setStreak(1);
        }
        localStorage.setItem('satAscentStreak', JSON.stringify({ streak: streak + 1, date: todayStr }));
    } else {
       // already completed goal for today, update streak value if it's not set.
       const currentSavedStreak = savedStreakData ? JSON.parse(savedStreakData).streak : 0;
       if (streak !== currentSavedStreak) {
         localStorage.setItem('satAscentStreak', JSON.stringify({ streak: streak, date: todayStr }));
       }
    }
  }, [streak]);

  const updateStats = (subject: Subject, isCorrect: boolean) => {
    setStats((prevStats) => {
      const newStats = { ...prevStats };
      if (isCorrect) {
        newStats[subject].correct += 1;
      } else {
        newStats[subject].incorrect += 1;
      }
      return newStats;
    });

    setDailyProgress(prev => {
        const newProgress = {...prev, count: prev.count + 1};
        if (newProgress.count >= newProgress.goal) {
            updateStreak();
        }
        return newProgress;
    });
  };
  
  const resetDailyProgress = () => {
    const today = new Date().toLocaleDateString();
    setDailyProgress({ count: 0, goal: 10, date: today });
  };

  return { stats, dailyProgress, streak, updateStats, resetDailyProgress };
};
