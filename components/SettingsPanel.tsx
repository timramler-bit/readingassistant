
import React, { useRef } from 'react';
import { EFLSettings, RampingSettings } from '../types';

interface SettingsPanelProps {
  text: string;
  wpm: number;
  fontSize: number;
  efl: EFLSettings;
  loops: number;
  ramping: RampingSettings;
  isExerciseMode?: boolean;
  onTextChange: (text: string) => void;
  onWpmChange: (wpm: number) => void;
  onFontSizeChange: (size: number) => void;
  onEflChange: (efl: Partial<EFLSettings>) => void;
  onLoopsChange: (loops: number) => void;
  onRampingChange: (ramping: Partial<RampingSettings>) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  text, wpm, fontSize, efl, loops, ramping, isExerciseMode,
  onTextChange, onWpmChange, onFontSizeChange, onEflChange,
  onLoopsChange, onRampingChange, onClose
}) => {
  return (
    <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-md flex flex-col p-4 md:p-8 overflow-y-auto font-['Poppins'] animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto w-full space-y-12 py-10">
        <header className="flex justify-between items-center border-b border-white/10 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-2xl">T</span>
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight italic">Control Center</h2>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-black">Tim the Teacher Settings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Passage & Text Column */}
          <div className="space-y-10">
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Active Passage</h3>
              <textarea
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                className="w-full h-64 bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 text-lg font-medium focus:border-cyan-500 outline-none transition-all resize-none leading-relaxed"
                placeholder="Paste text here..."
              />
            </section>

            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Phonics Focus</h3>
              <div className="bg-emerald-950/10 p-8 rounded-3xl border border-emerald-900/20 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Target Sounds</label>
                  <input 
                    type="text"
                    value={efl.targetPhonetic}
                    onChange={(e) => onEflChange({ targetPhonetic: e.target.value })}
                    placeholder="th, sh, ch, ee..."
                    className="w-full bg-black/60 border border-emerald-900/40 rounded-xl p-4 font-bold text-emerald-400 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-4 pt-2">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <input type="checkbox" checked={efl.highlightVowels} onChange={(e) => onEflChange({ highlightVowels: e.target.checked })} className="w-5 h-5 accent-emerald-500 rounded" />
                    <span className="font-bold text-zinc-300 group-hover:text-white transition-colors text-sm">Vowel Team Highlighting</span>
                  </label>
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <input type="checkbox" checked={efl.pauseOnPunctuation} onChange={(e) => onEflChange({ pauseOnPunctuation: e.target.checked })} className="w-5 h-5 accent-emerald-500 rounded" />
                    <span className="font-bold text-zinc-300 group-hover:text-white transition-colors text-sm">Punctuation Pause</span>
                  </label>
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <input type="checkbox" checked={efl.slowLongWords} onChange={(e) => onEflChange({ slowLongWords: e.target.checked })} className="w-5 h-5 accent-emerald-500 rounded" />
                    <span className="font-bold text-zinc-300 group-hover:text-white transition-colors text-sm">Slow on Complex Words</span>
                  </label>
                </div>
              </div>
            </section>
          </div>

          {/* Speed Column */}
          <div className="space-y-10">
            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Speed Training</h3>
              <div className="bg-orange-950/10 p-8 rounded-3xl border border-orange-900/20 space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-400">Ramping Mode</span>
                    <input type="checkbox" checked={ramping.enabled} onChange={(e) => onRampingChange({ enabled: e.target.checked })} className="w-5 h-5 accent-orange-500 rounded" />
                  </div>
                  {ramping.enabled ? (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-orange-400 uppercase tracking-widest">Start <span>{ramping.startWpm} WPM</span></div>
                        <input type="range" min="100" max="800" value={ramping.startWpm} onChange={(e) => onRampingChange({ startWpm: parseInt(e.target.value) })} className="w-full accent-orange-600 h-1.5" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-orange-400 uppercase tracking-widest">Target <span>{ramping.endWpm} WPM</span></div>
                        <input type="range" min="100" max="1500" value={ramping.endWpm} onChange={(e) => onRampingChange({ endWpm: parseInt(e.target.value) })} className="w-full accent-orange-600 h-1.5" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black text-orange-400 uppercase tracking-widest">Constant Speed <span>{wpm} WPM</span></div>
                      <input type="range" min="100" max="1200" step="10" value={wpm} onChange={(e) => onWpmChange(parseInt(e.target.value))} className="w-full accent-orange-600 h-1.5" />
                    </div>
                  )}
                </div>
                <div className="space-y-4 pt-6 border-t border-orange-900/20">
                  <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">Font Size <span>{fontSize}px</span></div>
                  <input type="range" min="50" max="400" value={fontSize} onChange={(e) => onFontSizeChange(parseInt(e.target.value))} className="w-full accent-white h-1.5" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">Repeat Loops <span>{loops}x</span></div>
                  <input type="range" min="1" max="10" value={loops} onChange={(e) => onLoopsChange(parseInt(e.target.value))} className="w-full accent-white h-1.5" />
                </div>
              </div>
            </section>
            
            <section className="bg-zinc-900/40 p-8 rounded-3xl border border-white/5 space-y-4">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] leading-relaxed">
                  Focus on the red letters in the center. The app will automatically pause for punctuation to help your comprehension.
                </p>
            </section>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-8 bg-white text-black font-black rounded-3xl text-3xl hover:bg-cyan-500 transition-all transform active:scale-95 shadow-2xl uppercase tracking-tighter"
        >
          {isExerciseMode ? 'Start Training' : 'Confirm Settings'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
