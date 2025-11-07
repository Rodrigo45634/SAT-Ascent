
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { UserStats } from '../types';

interface AnalyticsChartProps {
  stats: UserStats;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ stats }) => {
  const data = Object.entries(stats).map(([subject, subjectStats]) => ({
    name: subject,
    Correct: subjectStats.correct,
    Incorrect: subjectStats.incorrect,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 14 }} />
        <YAxis tick={{ fill: '#475569', fontSize: 14 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
          }}
        />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
        <Bar dataKey="Correct" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Incorrect" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
