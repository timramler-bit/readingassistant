
import React, { useRef, useState, useEffect } from 'react';

interface CameraScannerProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => setError('Camera access denied or unavailable.'));
    
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    onCapture(canvas.toDataURL('image/jpeg', 0.8));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6">
      <div className="relative w-full max-w-2xl aspect-[3/4] bg-zinc-900 rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl">
        {error ? (
          <div className="flex items-center justify-center h-full text-zinc-500 font-bold">{error}</div>
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
          <div className="w-full h-full border-2 border-white/20 rounded-2xl" />
        </div>
      </div>
      
      <div className="mt-10 flex gap-8 items-center">
        <button onClick={onClose} className="p-6 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <button onClick={takePhoto} className="w-24 h-24 bg-white rounded-full border-[8px] border-zinc-800 shadow-xl active:scale-95 transition-all" />
        <div className="w-10" /> {/* Spacer */}
      </div>
      <p className="mt-6 text-zinc-500 font-black uppercase tracking-[0.4em] text-xs">Align reading passage</p>
    </div>
  );
};

export default CameraScanner;
