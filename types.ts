
export interface WordPart {
  prefix: string;
  pivot: string;
  suffix: string;
}

export interface GrammarPoint {
  structure: string;
  explanation: string;
  examples: string[];
}

export interface VocabularyItem {
  word: string;
  partOfSpeech: string;
  contextualMeaning: string;
  pronunciationTip: string;
}

export interface PassageAnalysis {
  grammarPoints: GrammarPoint[];
  vocabulary: VocabularyItem[];
  summary: string;
}

export interface EFLSettings {
  highlightVowels: boolean;
  pauseOnPunctuation: boolean;
  slowLongWords: boolean;
  targetPhonetic: string;
}

export interface BGMTrack {
  id: string;
  name: string;
  url: string;
  isCustom: boolean;
}

export interface RampingSettings {
  enabled: boolean;
  startWpm: number;
  endWpm: number;
}

export interface ReaderSettings {
  wpm: number;
  fontSize: number;
  text: string;
  isPlaying: boolean;
  currentIndex: number;
  efl: EFLSettings;
  loops: number;
  currentLoop: number;
  ramping: RampingSettings;
}
