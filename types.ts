
export type Subject = 'Math' | 'Reading' | 'Writing';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type View = 'dashboard' | 'practice' | 'challenge';

export interface Question {
  question: string;
  options: { [key: string]: string };
  correctAnswer: string;
  explanation: string;
  subject: Subject;
  topic: string;
}

export interface SubjectStats {
  correct: number;
  incorrect: number;
  [topic: string]: number | { correct: number; incorrect: number };
}

export interface UserStats {
  Math: SubjectStats;
  Reading: SubjectStats;
  Writing: SubjectStats;
}
