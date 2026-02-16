
import React, { useState, useRef } from 'react';
import { analyzeImage } from './services/geminiService';
import { AppState, AnalysisResult, ReadingType } from './types';
import ScanningOverlay from './components/ScanningOverlay';
import ResultView from './components/ResultView';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('IDLE');
  const [readingType, setReadingType] = useState<ReadingType>('PALM');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startSelection = (type: ReadingType) => {
    setReadingType(type);
    setState('SELECTING');
  };

  const startCamera = async () => {
    try {
      setState('CAPTURING');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } // Use user-facing for face reading, but usually environment is better for palms. Face app often uses user.
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('카메라를 시작할 수 없습니다. 권한을 확인해주세요.');
      setState('SELECTING');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
        handleAnalysis(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCapturedImage(dataUrl);
        handleAnalysis(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalysis = async (imageData: string) => {
    try {
      setState('ANALYZING');
      setError(null);
      const result = await analyzeImage(imageData, readingType);
      setAnalysis(result);
      setState('RESULT');
    } catch (err: any) {
      setError(err.message || '분석 중 오류가 발생했습니다.');
      setState('IDLE');
      setCapturedImage(null);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setAnalysis(null);
    setError(null);
    setState('IDLE');
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center">
      <header className="mb-12 text-center fade-in">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
          신비한 <span className="text-blue-400">AI 운세</span>
        </h1>
        <p className="text-blue-200/80 text-lg">AI가 읽어주는 당신의 운명과 타고난 기질</p>
      </header>

      <main className="w-full max-w-xl">
        {state === 'IDLE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in">
            <button 
              onClick={() => startSelection('PALM')}
              className="bg-blue-900/20 border border-blue-500/30 p-8 rounded-3xl text-center mystic-glow hover:bg-blue-900/40 hover:border-blue-500/50 transition-all group"
            >
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <span className="text-4xl">✋</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">손금 보기</h3>
              <p className="text-blue-200/60 text-sm">손바닥의 선을 통해 미래를 예측합니다</p>
            </button>

            <button 
              onClick={() => startSelection('FACE')}
              className="bg-blue-900/20 border border-blue-500/30 p-8 rounded-3xl text-center mystic-glow hover:bg-blue-900/40 hover:border-blue-500/50 transition-all group"
            >
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <span className="text-4xl">👤</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">관상 보기</h3>
              <p className="text-blue-200/60 text-sm">얼굴의 특징으로 타고난 운을 분석합니다</p>
            </button>
          </div>
        )}

        {state === 'SELECTING' && (
          <div className="flex flex-col gap-4 fade-in">
            <div className="bg-blue-900/20 border border-blue-500/30 p-8 rounded-3xl text-center mystic-glow mb-4">
              <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <span className="text-5xl">{readingType === 'PALM' ? '✋' : '👤'}</span>
              </div>
              <h2 className="text-xl text-white font-medium mb-2">
                {readingType === 'PALM' ? '손바닥' : '얼굴'} 사진을 준비해주세요
              </h2>
              <p className="text-blue-200/60 text-sm mb-8">
                {readingType === 'PALM' 
                  ? '밝은 곳에서 손바닥 전체가 잘 보이게 찍어주세요.' 
                  : '정면 얼굴이 가려지지 않게 밝은 곳에서 찍어주세요.'}
              </p>
              
              <button
                onClick={startCamera}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all mb-3 active:scale-[0.98] shadow-lg shadow-blue-900/50"
              >
                카메라로 촬영하기
              </button>
              
              <label className="w-full py-4 block bg-blue-500/10 hover:bg-blue-500/20 text-white font-bold rounded-2xl cursor-pointer transition-all border border-blue-500/30">
                사진 업로드하기
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                />
              </label>

              <button
                onClick={() => setState('IDLE')}
                className="mt-6 text-blue-300/80 text-sm hover:text-white transition-colors"
              >
                뒤로 가기
              </button>
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm text-center">
                {error}
              </div>
            )}
          </div>
        )}

        {state === 'CAPTURING' && (
          <div className="relative rounded-3xl overflow-hidden mystic-glow bg-black flex flex-col fade-in aspect-[3/4] border-2 border-blue-500/20">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 pointer-events-none border-[30px] border-black/20 flex items-center justify-center">
              <div className={`w-4/5 h-4/5 border-2 border-dashed border-blue-400/50 opacity-50 ${readingType === 'PALM' ? 'rounded-full' : 'rounded-3xl'}`}></div>
            </div>
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6">
              <button 
                onClick={() => { stopCamera(); setState('SELECTING'); }}
                className="w-12 h-12 rounded-full bg-blue-900/40 backdrop-blur-md flex items-center justify-center text-white border border-blue-500/30"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <button 
                onClick={capturePhoto}
                className="w-20 h-20 rounded-full border-4 border-blue-300/50 bg-blue-500/20 backdrop-blur-sm p-1"
              >
                <div className="w-full h-full rounded-full bg-white shadow-lg active:scale-95 transition-transform"></div>
              </button>
              <div className="w-12 h-12"></div>
            </div>
          </div>
        )}

        {state === 'ANALYZING' && (
          <div className="flex flex-col items-center gap-8 fade-in">
            <div className="relative rounded-3xl overflow-hidden mystic-glow bg-black aspect-[3/4] w-full border-2 border-blue-500/30">
              {capturedImage && <img src={capturedImage} className="w-full h-full object-cover opacity-60 grayscale" />}
              <ScanningOverlay />
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-white animate-pulse">운명의 기운을 읽는 중...</h2>
              <p className="text-blue-200/70">사진 속에 담긴 당신의 우주를 분석하고 있습니다.</p>
            </div>
          </div>
        )}

        {state === 'RESULT' && analysis && capturedImage && (
          <ResultView analysis={analysis} image={capturedImage} type={readingType} onReset={reset} />
        )}
      </main>

      <footer className="mt-12 text-blue-300/40 text-xs">
        <p>© 2024 AI Oracle. 모든 권리 보유.</p>
        <p className="mt-1">재미로 보는 운세입니다. 진지한 상담은 전문가와 상의하세요.</p>
      </footer>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default App;
