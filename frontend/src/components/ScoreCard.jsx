import React from 'react';

export const ScoreCard = ({ dimension }) => {
  const getColor = (score) => {
    if (score >= 4) return 'bg-green-50 text-green-700 border-green-200';
    if (score >= 3) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (score >= 2) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const getBarColor = (score) => {
     if (score >= 4) return 'bg-green-500';
     if (score >= 3) return 'bg-blue-500';
     if (score >= 2) return 'bg-yellow-500';
     return 'bg-red-500';
  };

  return (
    <div className={`p-4 rounded-lg border ${getColor(dimension.score)} transition-all hover:shadow-md`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-sm uppercase tracking-wide opacity-90">{dimension.category}</h4>
        <span className="font-bold text-lg">{dimension.score}/5</span>
      </div>
      <div className="w-full bg-white/50 rounded-full h-1.5 mb-3">
        <div 
          className={`h-1.5 rounded-full ${getBarColor(dimension.score)}`} 
          style={{ width: `${(dimension.score / 5) * 100}%` }}
        ></div>
      </div>
      <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
        {dimension.description}
      </p>
    </div>
  );
};










