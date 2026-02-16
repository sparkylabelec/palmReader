
import React from 'react';
import { AnalysisResult, ReadingType, AnalysisSection } from '../types';

interface ResultViewProps {
  analysis: AnalysisResult;
  image: string;
  type: ReadingType;
  onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ analysis, image, type, onReset }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 fade-in pb-12">
      <div className="relative group overflow-hidden rounded-3xl border-2 border-pink-500/30 mystic-glow">
        <img src={image} alt="Captured" className="w-full h-72 object-cover object-center grayscale hover:grayscale-0 transition-all duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-pink-950 via-pink-950/20 to-transparent"></div>
        <div className="absolute bottom-4 left-6 right-6">
          <h2 className="text-2xl font-bold text-white mb-1">
            {type === 'PALM' ? '✨ 손금 분석 결과' : '👤 관상 분석 결과'}
          </h2>
          <p className="text-pink-200 text-sm italic leading-relaxed">{analysis.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(analysis.sections).map(([key, data]) => {
          const section = data as AnalysisSection;
          return (
            <div key={key} className="bg-pink-900/20 backdrop-blur-md border border-pink-500/20 p-5 rounded-2xl hover:bg-pink-900/30 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <span className="text-pink-400 font-bold">
                  {section.title}
                </span>
                <span className="text-xs bg-pink-500/20 text-pink-200 px-2 py-1 rounded-full border border-pink-500/20">
                  강도: {section.score}%
                </span>
              </div>
              <p className="text-pink-100/80 text-sm leading-relaxed">{section.description}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-pink-900/40 to-pink-800/20 border border-pink-500/30 p-6 rounded-2xl">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
           ✨ 당신의 주요 기질
        </h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {analysis.traits.map((trait, idx) => (
            <span key={idx} className="bg-pink-500/20 border border-pink-400/30 text-pink-100 px-3 py-1 rounded-full text-sm">
              #{trait}
            </span>
          ))}
        </div>
        <p className="text-pink-200 italic text-sm border-l-4 border-pink-500 pl-4 py-1">
          "{analysis.advice}"
        </p>
      </div>

      <button
        onClick={onReset}
        className="w-full py-4 bg-pink-100 text-pink-900 font-bold rounded-2xl hover:bg-white transition-colors shadow-lg shadow-pink-500/20 active:scale-[0.98]"
      >
        다른 운세 보기
      </button>
    </div>
  );
};

export default ResultView;
