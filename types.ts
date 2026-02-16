
export type ReadingType = 'PALM' | 'FACE';

export interface AnalysisSection {
  title: string;
  description: string;
  score: number;
}

export interface AnalysisResult {
  summary: string;
  sections: {
    [key: string]: AnalysisSection;
  };
  traits: string[];
  advice: string;
}

export type AppState = 'IDLE' | 'SELECTING' | 'CAPTURING' | 'ANALYZING' | 'RESULT';
