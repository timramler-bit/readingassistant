
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import RSVPDisplay from './components/RSVPDisplay';
import SettingsPanel from './components/SettingsPanel';
import CameraScanner from './components/CameraScanner';
import WordInsightModal from './components/WordInsightModal';
import { splitIntoWords } from './utils/textUtils';
import { scanPassage, analyzePassage } from './utils/aiUtils';
import { EFLSettings, RampingSettings, PassageAnalysis } from './types';

const DEFAULT_TEXT = `Welcome to the Reading Assistant! You can study any passage here. Try clicking on words like "Assistant" or "Professional" to see their meaning. You can also scan physical documents or speed read using the training mode. Happy learning!`;

const App: React.FC = () => {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [targetLanguage, setTargetLanguage] = useState<'English' | 'Japanese'>('Japanese');
  const [isExerciseMode, setIsExerciseMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PassageAnalysis | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Speed Reader & UI State
  const [wpm, setWpm] = useState(250);
  const [fontSize, setFontSize] = useState(180);
  const [loops, setLoops] = useState(1);
  const [currentLoop, setCurrentLoop] = useState(0);
  const [ramping, setRamping] = useState<RampingSettings>({ enabled: false, startWpm: 150, endWpm: 450 });
  const [efl, setEfl] = useState<EFLSettings>({ highlightVowels: true, pauseOnPunctuation: true, slowLongWords: false, targetPhonetic: 'th, sh, ch' });

  const words = useMemo(() => splitIntoWords(text), [text]);
  const timerRef = useRef<number | null>(null);

  const t = {
    scan: targetLanguage === 'Japanese' ? 'スキャン' : 'Scan',
    upload: targetLanguage === 'Japanese' ? '画像選択' : 'Upload',
    practice: targetLanguage === 'Japanese' ? 'スピード読解練習' : 'Practice Speed Reading',
    summary: targetLanguage === 'Japanese' ? '要約' : 'Summary',
    grammar: targetLanguage === 'Japanese' ? '文法解説' : 'Grammar Insights',
    vocab: targetLanguage === 'Japanese' ? '重要単語' : 'Key Vocabulary',
    analyzing: targetLanguage === 'Japanese' ? 'AI解析中...' : 'AI Analyzing...',
    training: targetLanguage === 'Japanese' ? 'トレーニング中' : 'Training Mode'
  };

  const getEffectiveWpm = useCallback(() => {
    if (!ramping.enabled) return wpm;
    const totalWords = words.length * loops;
    const currentAbsoluteIndex = (currentLoop * words.length + currentIndex);
    const progress = currentAbsoluteIndex / Math.max(1, totalWords - 1);
    return ramping.startWpm + (ramping.endWpm - ramping.startWpm) * progress;
  }, [ramping, words.length, loops, currentLoop, currentIndex, wpm]);

  const playNextWord = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= words.length - 1) {
        if (currentLoop < loops - 1) { 
          setCurrentLoop(l => l + 1); 
          return 0; 
        } else { 
          setIsPlaying(false); 
          return prev; 
        }
      }
      return prev + 1;
    });
  }, [words.length, currentLoop, loops]);

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    
    if (isPlaying && currentIndex < words.length) {
      const currentWord = words[currentIndex] || '';
      const baseInterval = 60000 / getEffectiveWpm();
      let intervalMultiplier = 1;

      if (efl.pauseOnPunctuation) {
        if (/[.!?]$/.test(currentWord)) intervalMultiplier = 2.5;
        else if (/[,;:]$/.test(currentWord)) intervalMultiplier = 1.6;
      }

      if (efl.slowLongWords && currentWord.length > 8) {
        intervalMultiplier *= 1.25;
      }

      timerRef.current = window.setTimeout(playNextWord, baseInterval * intervalMultiplier);
    }
    
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [isPlaying, currentIndex, words, playNextWord, getEffectiveWpm, efl.pauseOnPunctuation, efl.slowLongWords]);

  const processImage = async (base64: string) => {
    setIsAnalyzing(true);
    try {
      const extractedText = await scanPassage(base64);
      setText(extractedText);
      const res = await analyzePassage(extractedText, targetLanguage);
      setAnalysis(res);
      setCurrentIndex(0);
      setIsPlaying(false);
    } catch (err) { console.error(err); }
    setIsAnalyzing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (text !== DEFAULT_TEXT) {
      setIsAnalyzing(true);
      analyzePassage(text, targetLanguage).then(res => {
        setAnalysis(res);
        setIsAnalyzing(false);
      });
    }
  }, [targetLanguage, text]);

  const startExerciseFlow = () => {
    setIsExerciseMode(true);
    setIsPlaying(false);
    setShowSettings(true);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-white selection:bg-cyan-500/30 overflow-hidden relative font-['Poppins']">
      
      {/* GLOBAL HEADER */}
      <header className="p-4 md:p-6 flex justify-between items-center z-20 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-4 group">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
             <span className="text-white font-black text-xl">T</span>
          </div>
          <div className="flex flex-col hidden sm:flex">
            <h1 className="text-lg md:text-2xl font-black tracking-tighter text-white leading-none">Tim the Teacher</h1>
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mt-0.5">Reading Assistant</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-white/5 p-1 rounded-xl flex border border-white/10">
            <button 
              onClick={() => setTargetLanguage('English')}
              className={`px-2 md:px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase transition-all ${targetLanguage === 'English' ? 'bg-cyan-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setTargetLanguage('Japanese')}
              className={`px-2 md:px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase transition-all ${targetLanguage === 'Japanese' ? 'bg-cyan-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              JA
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setIsScanning(true)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-black uppercase text-[9px] md:text-[10px] flex items-center gap-1 md:gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
              <span className="hidden xs:inline">{t.scan}</span>
            </button>

            <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-black uppercase text-[9px] md:text-[10px] flex items-center gap-1 md:gap-2 text-cyan-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <span className="hidden xs:inline">{t.upload}</span>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>
          
          <button onClick={() => setShowSettings(true)} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          </button>
        </div>
      </header>

      {/* MAIN VIEW */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <section className={`flex-1 overflow-y-auto p-6 md:p-12 transition-all duration-500 ${showAnalysisPanel ? 'md:mr-[400px]' : ''}`}>
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-6">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Study Passage</h3>
              <button 
                onClick={startExerciseFlow}
                className="px-6 py-3 bg-cyan-600 text-white font-black rounded-xl hover:bg-cyan-500 transition-all shadow-lg uppercase text-[10px] tracking-widest flex items-center gap-3"
              >
                {t.practice}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </button>
            </div>

            <div className="flex flex-wrap gap-x-2 gap-y-4 leading-loose">
              {words.map((word, i) => (
                <span 
                  key={i} 
                  onClick={() => setSelectedWord(word)}
                  className="text-xl md:text-3xl font-bold text-zinc-400 hover:text-cyan-400 transition-all cursor-pointer hover:scale-105 origin-bottom"
                >
                  {word}
                </span>
              ))}
            </div>

            {analysis?.summary && (
              <div className="p-6 md:p-8 bg-white/[0.02] rounded-3xl border border-white/5 space-y-3">
                <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">{t.summary}</h4>
                <p className="text-lg text-zinc-400 leading-relaxed italic">"{analysis.summary}"</p>
              </div>
            )}
          </div>
        </section>

        {/* INSIGHTS PANEL */}
        <aside className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-zinc-950 border-l border-white/10 z-30 transition-transform duration-700 ease-in-out transform ${showAnalysisPanel ? 'translate-x-0' : 'translate-x-full'} flex flex-col pt-20`}>
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            <header className="flex justify-between items-center mb-10">
               <h2 className="text-lg font-black tracking-tight">{t.analyzing}</h2>
               <button onClick={() => setShowAnalysisPanel(false)} className="text-zinc-500 hover:text-white md:hidden"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </header>

            <div className="space-y-12">
              <section className="space-y-6">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">{t.grammar}</h3>
                <div className="space-y-4">
                  {analysis?.grammarPoints?.map((gp, i) => (
                    <div key={i} className="p-5 bg-white/[0.03] rounded-2xl border border-white/5">
                      <div className="font-bold text-white mb-2">{gp.structure}</div>
                      <p className="text-xs text-zinc-400 leading-relaxed mb-4">{gp.explanation}</p>
                      <div className="space-y-2">
                        {gp.examples.map((ex, j) => (
                          <div key={j} className="text-[10px] text-cyan-500/80 italic bg-cyan-500/5 px-2 py-1 rounded-lg">• {ex}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {!analysis && <div className="text-zinc-700 text-xs italic">Scan text for insights...</div>}
                </div>
              </section>

              <section className="space-y-6 pb-10">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">{t.vocab}</h3>
                <div className="grid grid-cols-1 gap-3">
                  {analysis?.vocabulary?.map((v, i) => (
                    <button key={i} onClick={() => setSelectedWord(v.word)} className="text-left w-full p-5 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-cyan-500/50 transition-all group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-white group-hover:text-cyan-400">{v.word}</span>
                        <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase font-bold">{v.partOfSpeech}</span>
                      </div>
                      <p className="text-xs text-zinc-500">{v.contextualMeaning}</p>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </aside>

        {!showAnalysisPanel && (
          <button onClick={() => setShowAnalysisPanel(true)} className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-white text-black rounded-xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
        )}
      </main>

      {/* EXERCISE MODE OVERLAY */}
      {isExerciseMode && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in zoom-in-95 duration-500">
          <header className="p-6 md:p-10 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t.training}</span>
              <div className="flex items-center gap-3">
                 <span className="text-3xl md:text-5xl font-black tabular-nums">{Math.round(getEffectiveWpm())}</span>
                 <span className="text-cyan-600 font-bold text-xs">WPM</span>
              </div>
            </div>
            <button 
              onClick={() => { setIsExerciseMode(false); setIsPlaying(false); }}
              className="w-12 h-12 md:w-16 md:h-16 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center relative" onClick={() => setIsPlaying(!isPlaying)}>
            <RSVPDisplay word={words[currentIndex] || ''} fontSize={fontSize} efl={efl} />
            <div className="absolute bottom-40 w-[60vw] h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-cyan-600 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]" style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }} />
            </div>
          </div>

          <footer className={`p-10 flex justify-center items-center gap-10 transition-all duration-500 ${isPlaying ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
            <button onClick={() => setCurrentIndex(0)} className="p-6 bg-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-24 h-24 md:w-32 md:h-32 bg-white text-black rounded-[2.5rem] flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all">
              {isPlaying ? <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-14 md:w-14" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="5" height="16" /><rect x="13" y="4" width="5" height="16" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-14 md:w-14 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
            </button>
            <button onClick={() => { setIsPlaying(false); setShowSettings(true); }} className="p-6 bg-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg></button>
          </footer>
        </div>
      )}

      {/* OVERLAYS & MODALS */}
      {isScanning && <CameraScanner onCapture={processImage} onClose={() => setIsScanning(false)} />}
      {isAnalyzing && (
        <div className="fixed inset-0 z-[400] bg-black flex flex-col items-center justify-center p-8">
          <div className="w-16 h-16 border-4 border-white/5 border-t-cyan-500 rounded-full animate-spin mb-6" />
          <h2 className="text-xl font-bold tracking-tight text-white">{t.analyzing}</h2>
        </div>
      )}
      {selectedWord && <WordInsightModal word={selectedWord} passage={text} language={targetLanguage} onClose={() => setSelectedWord(null)} />}
      {showSettings && (
        <SettingsPanel
          text={text} wpm={wpm} fontSize={fontSize} efl={efl}
          loops={loops} ramping={ramping}
          isExerciseMode={isExerciseMode}
          onTextChange={(val) => { setText(val); setAnalysis(null); setCurrentIndex(0); }}
          onWpmChange={setWpm} onFontSizeChange={setFontSize}
          onEflChange={(u) => setEfl(p => ({ ...p, ...u }))}
          onLoopsChange={setLoops}
          onRampingChange={(u) => setRamping(p => ({ ...p, ...u }))}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default App;
