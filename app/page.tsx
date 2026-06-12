'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);

  const cleanUrl = (input: string) => {
    let cleaned = input.trim();
    if (cleaned.startsWith('https://https://')) {
      cleaned = cleaned.replace('https://https://', 'https://');
    }
    if (cleaned.startsWith('youtube.com') || cleaned.startsWith('www.youtube.com')) {
      cleaned = 'https://' + cleaned;
    }
    if (cleaned.startsWith('youtu.be')) {
      cleaned = 'https://' + cleaned;
    }
    return cleaned;
  };











// Update the handleDownload function to use the API properly
const handleDownload = async () => {
  let cleanInput = url.trim();
  const videoIdMatch = cleanInput.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:[&?]|$)/);
  if (videoIdMatch) {
    cleanInput = `https://youtube.com/watch?v=${videoIdMatch[1]}`;
  }
  
  if (!cleanInput || !cleanInput.includes('youtube.com/watch')) {
    setStatus('Please enter a valid YouTube URL');
    return;
  }

  setLoading(true);
  setStatus('Downloading video...');
  setProgress(0);

  const interval = setInterval(() => {
    setProgress(prev => Math.min(prev + 10, 90));
  }, 500);

  try {
    const response = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: cleanInput }),
    });

    clearInterval(interval);
    setProgress(100);

    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'video.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      setStatus('✅ Download complete!');
      setUrl('');
    } else {
      const error = await response.json();
      setStatus(`❌ Error: ${error.error}`);
    }
  } catch (error) {
    clearInterval(interval);
    setStatus('❌ Download failed');
  } finally {
    setLoading(false);
    setTimeout(() => setStatus(''), 3000);
  }
};






  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      
      {/* Main card */}
      <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20 transform transition-all duration-500 hover:scale-105">
        {/* Decorative icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg mb-4">
            <span className="text-4xl">🎬</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            YouTube Downloader
          </h1>
          <p className="text-white/70 text-sm">
            Download any video in seconds
          </p>
        </div>
        
        {/* Input section */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m3.172-3.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656L14 18.828" />
              </svg>
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleDownload()}
              placeholder="Paste YouTube URL here..."
              className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400 shadow-sm"
            />
          </div>

          {/* Progress bar */}
          {progress > 0 && progress < 100 && (
            <div className="space-y-2 animate-fadeIn">
              <div className="w-full bg-gray-200/50 rounded-full h-2 overflow-hidden backdrop-blur">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 shadow-lg"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-white/70 text-xs text-center">{progress}%</p>
            </div>
          )}
          
          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={loading}
            className="relative w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Download Video
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          {/* Status message */}
          {status && (
            <div className={`p-3 rounded-xl text-center text-sm font-medium animate-fadeIn ${
              status.includes('✅') 
                ? 'bg-green-500/20 text-green-200 border border-green-500/30 backdrop-blur' 
                : status.includes('❌')
                ? 'bg-red-500/20 text-red-200 border border-red-500/30 backdrop-blur'
                : 'bg-blue-500/20 text-blue-200 border border-blue-500/30 backdrop-blur'
            }`}>
              {status}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/20 text-center">
          <p className="text-white/50 text-xs flex items-center justify-center gap-2">
            <span>✨ Supports YouTube videos</span>
            <span>•</span>
            <span>🎥 MP4 format</span>
            <span>•</span>
            <span>⚡ High quality</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}