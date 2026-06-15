"use client"

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

const LANGUAGES = [
  { code: 'en-IN', name: 'English (India)' },
  { code: 'hi-IN', name: 'Hindi (हिंदी)' },
  { code: 'mr-IN', name: 'Marathi (मराठी)' },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
  { code: 'bn-IN', name: 'Bengali (বাংলা)' },
];

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [lang, setLang] = useState('en-IN');
  const [showLangs, setShowLangs] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        
        rec.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            onTranscript(finalTranscript + ' ');
          }
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        setRecognition(rec);
      }
    }
  }, [onTranscript]);

  const toggleRecording = () => {
    if (!recognition) {
      alert("Voice input is not supported in this browser. Try Chrome.");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.lang = lang;
      recognition.start();
      setIsRecording(true);
      setShowLangs(false);
    }
  };

  return (
    <div className="relative flex items-center">
      {showLangs && (
        <div className="absolute bottom-full mb-2 left-0 bg-card border border-border shadow-lg rounded-xl p-2 w-48 z-50">
          <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 flex items-center gap-1">
            <Globe className="h-3 w-3" /> Select Language
          </div>
          <div className="space-y-1">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${lang === l.code ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-muted'}`}
                onClick={() => {
                  setLang(l.code);
                  setShowLangs(false);
                }}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center bg-secondary/50 rounded-2xl border border-border/50 shadow-sm h-[52px]">
        <button
          type="button"
          onClick={() => setShowLangs(!showLangs)}
          className="px-2 h-full flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border-r border-border/50"
          title="Change Language"
          disabled={disabled || isRecording}
        >
          {lang.split('-')[0].toUpperCase()}
        </button>
        <button
          type="button"
          onClick={toggleRecording}
          disabled={disabled}
          className={`h-full w-12 flex items-center justify-center transition-all ${isRecording ? 'text-red-500 animate-pulse bg-red-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
        >
          {isRecording ? <Mic className="h-5 w-5" /> : <MicOff className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
