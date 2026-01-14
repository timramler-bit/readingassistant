
import React, { useEffect, useState } from 'react';
import { getWordInsight, speakWord } from '../utils/aiUtils.ts';

interface WordInsightModalProps {
  word: string;
  passage: string;
  language: 'English' | 'Japanese';
  onClose: () => void;
}

const WordInsightModal: React.FC<WordInsightModalProps> = ({ word, passage, language, onClose }) => {
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWordInsight(word, passage, language).then(res => {
      setInsight(res);
      setLoading(false);
    });
  }, [word, passage, language]);

  const labels = {
    loading: language === 'Japanese' ? '解析中...' : 'Analyzing...',
    meaning: language === 'Japanese' ? '文脈での意味' : 'Contextual Meaning',
    note: language === 'Japanese' ? '講師のメモ' : 'Teacher Note',
    close: language === 'Japanese' ? '閉じる' : 'Close'
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
      <div className="bg-zinc-900 w-full max-w-xl rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
        
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-6">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">{labels.loading}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">{word}</h2>
                <button onClick={() => speakWord(word)} className="p-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                </button>
              </div>
              <span className="text-cyan-400 font-mono text-sm">{insight.pronunciation}</span>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{labels.meaning}</h3>
              <p className="text-xl md:text-2xl text-zinc-100 leading-relaxed font-bold">{insight.meaning}</p>
            </div>

            {insight.grammarNote && (
              <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">{labels.note}</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">{insight.grammarNote}</p>
              </div>
            )}

            <button onClick={onClose} className="w-full py-5 bg-white text-black font-black rounded-2xl text-lg hover:bg-cyan-400 transition-colors">
              {labels.close}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordInsightModal;
