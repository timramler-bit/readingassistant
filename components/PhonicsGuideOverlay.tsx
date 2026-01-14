
import React, { useState, useEffect } from 'react';

interface PhonicsTip {
  sound: string;
  tip: string;
  example: string;
}

const PHONICS_TIPS: Record<string, PhonicsTip> = {
  'th': { sound: 'th', tip: 'Tongue between teeth. Blow air softly.', example: 'Think, This' },
  'sh': { sound: 'sh', tip: 'Quiet sound! Push your lips out.', example: 'Ship, Shell' },
  'ch': { sound: 'ch', tip: 'Train sound! Quick and sharp.', example: 'Chair, Chop' },
  'ph': { sound: 'ph', tip: 'Upper teeth on bottom lip. Like /f/.', example: 'Phone, Photo' },
  'ee': { sound: 'ee', tip: 'Long smile sound. Show your teeth!', example: 'Bee, Tree' },
  'oo': { sound: 'oo', tip: 'Tight circle lips. Like /u/.', example: 'Moon, Food' },
  'ay': { sound: 'ay', tip: 'Open wide, then slide to a smile.', example: 'Play, Day' },
  'igh': { sound: 'igh', tip: 'Open mouth wide. Like "I".', example: 'Light, High' },
  'ou': { sound: 'ou', tip: 'Big circle to small circle. Ow!', example: 'Out, Cloud' },
  'oi': { sound: 'oi', tip: 'Round lips to a smile. Oy!', example: 'Coin, Boy' },
};

interface PhonicsGuideOverlayProps {
  targetPhonetic: string;
  isVisible: boolean;
  onDismiss: () => void;
}

const PhonicsGuideOverlay: React.FC<PhonicsGuideOverlayProps> = ({ targetPhonetic, isVisible, onDismiss }) => {
  const [activeTip, setActiveTip] = useState<PhonicsTip | null>(null);

  useEffect(() => {
    const targets = targetPhonetic.toLowerCase().split(',').map(s => s.trim());
    // Find the first target that has a defined tip
    const found = targets.map(t => PHONICS_TIPS[t]).find(tip => !!tip);
    setActiveTip(found || null);
  }, [targetPhonetic]);

  if (!activeTip || !isVisible) return null;

  return (
    <div className="fixed bottom-36 left-4 md:left-10 z-40 max-w-[280px] md:max-w-xs animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="bg-zinc-900/90 backdrop-blur-xl border-2 border-cyan-500/30 rounded-[2rem] p-6 shadow-2xl relative group overflow-hidden">
        {/* Decorative Background Accent */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />
        
        <button 
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1 text-zinc-600 hover:text-white transition-colors"
          title="Dismiss Guide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center text-black font-black text-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              {activeTip.sound}
            </div>
            <div>
              <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-1">Articulation Guide</h4>
              <p className="text-white text-xs font-bold leading-tight">{activeTip.tip}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
            <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Example Words</span>
            <div className="flex gap-2">
              {activeTip.example.split(',').map((ex, i) => (
                <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-zinc-300 border border-white/10 italic">
                  "{ex.trim()}"
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhonicsGuideOverlay;
