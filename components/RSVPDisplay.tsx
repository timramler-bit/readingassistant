
import React from 'react';
import { getWordParts } from '../utils/textUtils';
import { EFLSettings } from '../types';

interface RSVPDisplayProps {
  word: string;
  fontSize: number;
  efl: EFLSettings;
}

const RSVPDisplay: React.FC<RSVPDisplayProps> = ({ word, fontSize, efl }) => {
  const { prefix, pivot, suffix } = getWordParts(word);

  const highlightPhonics = (text: string) => {
    let parts: (string | React.ReactNode)[] = [text];

    // 1. Multi-Target Phonetic Highlight
    if (efl.targetPhonetic && efl.targetPhonetic.trim().length > 0) {
      const targets = efl.targetPhonetic.split(',').map(s => s.trim()).filter(s => s.length > 0);
      if (targets.length > 0) {
        // Sort by length descending to match longest phonics first
        const pattern = targets.sort((a, b) => b.length - a.length).join('|');
        const regex = new RegExp(`(${pattern})`, 'gi');
        
        parts = parts.flatMap(p => {
          if (typeof p !== 'string') return p;
          const subParts = p.split(regex);
          return subParts.map((sp, i) => {
            if (regex.test(sp)) return (
              <span key={`target-${i}`} className="text-emerald-400 underline decoration-[4px] md:decoration-[6px] underline-offset-[8px] md:underline-offset-[12px] drop-shadow-[0_0_20px_rgba(52,211,153,0.8)] font-black">
                {sp}
              </span>
            );
            return sp;
          });
        });
      }
    }

    // 2. Vowel Cluster Highlight
    if (efl.highlightVowels) {
      const vowelTeams = /(ee|ea|oo|ai|ay|ou|oi|au|ie|oa)/gi;
      parts = parts.flatMap(p => {
        if (typeof p !== 'string') return p;
        const subParts = p.split(vowelTeams);
        return subParts.map((sp, i) => {
          if (vowelTeams.test(sp)) return <span key={`v-${i}`} className="text-zinc-100 border-b-2 md:border-b-4 border-red-500/30">{sp}</span>;
          return sp;
        });
      });
    }

    return parts;
  };

  return (
    <div 
      className="relative flex items-center justify-center w-full h-full select-none font-['Poppins'] overflow-hidden px-4"
      style={{ fontSize: `clamp(2rem, ${fontSize}px, 90vw)` }}
    >
      {/* Heavy Classroom Alignment Guides */}
      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 md:w-1 bg-white/[0.03] -translate-x-1/2" />
      <div className="absolute top-1/4 left-1/2 w-32 md:w-48 h-0.5 md:h-1 bg-white/[0.05] -translate-x-1/2" />
      <div className="absolute bottom-1/4 left-1/2 w-32 md:w-48 h-0.5 md:h-1 bg-white/[0.05] -translate-x-1/2" />

      <div className="flex font-bold tracking-tight z-10 leading-none items-center w-full justify-center">
        <div className="flex-1 text-right pr-[0.02em] opacity-80 whitespace-nowrap overflow-visible">
          {highlightPhonics(prefix)}
        </div>
        <div className="text-red-600 drop-shadow-[0_0_35px_rgba(220,38,38,0.6)] font-black px-0.5 md:px-1 scale-110 shrink-0">
          {highlightPhonics(pivot)}
        </div>
        <div className="flex-1 text-left pl-[0.02em] opacity-80 whitespace-nowrap overflow-visible">
          {highlightPhonics(suffix)}
        </div>
      </div>
    </div>
  );
};

export default RSVPDisplay;
