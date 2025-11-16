'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { useDrChickStore } from '@/lib/drChickStore';
import { Volume2, VolumeX, Pause, Loader2 } from 'lucide-react';

// Lazy load 3D canvas to avoid SSR issues
const DrChick3DCanvas = dynamic(() => import('./DrChick3DCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl">
      <div className="animate-pulse text-8xl">🐥</div>
    </div>
  ),
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  id: string;
}

export default function MedicalChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hey there! 👋 I\'m Dr. Chick, your VitalView AI health buddy. Ask me about symptoms, health tips, or wellness advice - I\'m here to help!\n\n💡 Just a heads up: I give general info, not medical diagnosis. For emergencies, call 911!',
      timestamp: new Date(),
      id: 'welcome-message'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [muteAnimations, setMuteAnimations] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Zustand store for 3D animation state
  const { animationState, setAnimationState, setMood, resetToIdle } = useDrChickStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Greeting on first open
  useEffect(() => {
    if (isOpen && !hasGreeted && !muteAnimations) {
      setAnimationState('wave');
      setMood("Hi! I'm Dr. Chick. I'll help you understand your health!", true);
      setTimeout(() => {
        setMood('', false);
        resetToIdle();
        setHasGreeted(true);
      }, 3000);
    }
  }, [isOpen, hasGreeted, muteAnimations, setAnimationState, setMood, resetToIdle]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      id: `user-${Date.now()}`
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Trigger listen animation on new message
    if (!muteAnimations) {
      setAnimationState('listen');
      setMood('Listening...', true);
      setTimeout(() => {
        setAnimationState('responding');
        setMood('Analyzing...', true);
      }, 800);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
        id: `assistant-${Date.now()}`
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Analyze response and set chick state
      if (!muteAnimations) {
        analyzeResponseForMetrics(data.response);
        setMood('Here\'s what I found!', true);
        setTimeout(() => setMood('', false), 2000);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date(),
        id: `error-${Date.now()}`
      };
      setMessages(prev => [...prev, errorMessage]);
      if (!muteAnimations) {
        setAnimationState('idle');
        setMood('Oops! Something went wrong', true);
        setTimeout(() => setMood('', false), 2000);
      }
    } finally {
      setIsLoading(false);
      if (!muteAnimations) {
        setTimeout(() => resetToIdle(), 3000);
      }
    }
  };

  // Analyze AI response for health keywords
  const analyzeResponseForMetrics = (response: string) => {
    const lowerResponse = response.toLowerCase();
    
    // Check for health concerns (keep idle for now, mood bubble shows the info)
    if (lowerResponse.includes('emergency') || lowerResponse.includes('urgent') || lowerResponse.includes('serious')) {
      // Alert state handled by mood
    } else if (lowerResponse.includes('concern') || lowerResponse.includes('warning')) {
      // Concern handled by mood
    }
    // Return to idle after response
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Track last TTS request time for rate limiting
  const lastTTSRequestRef = useRef<number>(0);

  // ElevenLabs Text-to-Speech Functions
  const speakText = async (text: string, messageId: string) => {
    if (!ttsEnabled) {
      console.log('TTS disabled by user');
      return;
    }
    
    console.log('🎤 Starting TTS for message:', messageId);

    // Stop any ongoing speech
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Rate limiting: wait at least 1 second between requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastTTSRequestRef.current;
    if (timeSinceLastRequest < 1000) {
      const waitTime = 1000 - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms before TTS request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    lastTTSRequestRef.current = Date.now();

    setAudioLoading(true);
    setSpeakingMessageId(messageId);

    try {
      // Remove ALL emojis and special characters for TTS
      let cleanText = text
        // Remove all emoji ranges (comprehensive)
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Symbols & Pictographs
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport & Map
        .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
        .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Miscellaneous Symbols
        .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
        .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols
        .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Extended Symbols
        .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
        // Clean up markdown and special chars
        .replace(/[*_~`#]/g, '')
        .replace(/\n+/g, '. ')
        .replace(/\s+/g, ' ')
        .trim();

      // Limit text length for ElevenLabs free tier (keep it short for reliability)
      const MAX_CHARS = 200;  // Shorter limit for better success rate
      if (cleanText.length > MAX_CHARS) {
        // Truncate at last sentence before limit
        const truncated = cleanText.substring(0, MAX_CHARS);
        const lastPeriod = truncated.lastIndexOf('.');
        cleanText = lastPeriod > 0 ? truncated.substring(0, lastPeriod + 1) : truncated + '...';
        console.log(`📝 Text truncated from ${text.length} to ${cleanText.length} chars for reliable TTS`);
      }

      // Call ElevenLabs API with retry logic
      let response: Response | undefined;
      let retryCount = 0;
      const MAX_RETRIES = 2;

      while (retryCount <= MAX_RETRIES) {
        response = await fetch('/api/elevenlabs-tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: cleanText }),
        });

        if (response.ok) break; // Success!

        retryCount++;
        if (retryCount <= MAX_RETRIES) {
          console.log(`🔄 Retry ${retryCount}/${MAX_RETRIES} for TTS...`);
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
        }
      }

      if (!response || !response.ok) {
        // ElevenLabs API failed after retries - handle gracefully
        const errorData = response ? await response.json().catch(() => ({ error: 'Unknown error' })) : { error: 'No response' };
        console.warn('🔇 Voice unavailable after retries:', {
          status: response?.status || 'no response',
          error: errorData,
          textPreview: cleanText.substring(0, 50)
        });
        
        setSpeakingMessageId(null);
        setAudioLoading(false);
        
        // Show user-friendly error message
        if (!muteAnimations) {
          resetToIdle();
          const statusCode = response?.status || 0;
          if (statusCode === 401 || statusCode === 500) {
            setMood('ElevenLabs API key needed in .env.local', true);
            setTimeout(() => setMood('', false), 4000);
          } else {
            setMood('Voice temporarily unavailable', true);
            setTimeout(() => setMood('', false), 3000);
          }
        }
        return; // Exit gracefully without throwing
      }

      // Get audio blob and validate
      const audioBlob = await response.blob();
      console.log('📦 Audio blob received:', {
        size: audioBlob.size,
        type: audioBlob.type
      });

      // Validate blob
      if (audioBlob.size === 0) {
        throw new Error('Received empty audio blob from API');
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('🔗 Audio URL created:', audioUrl);

      // Create and configure audio element
      const audio = new Audio();
      audioRef.current = audio;

      // Set up event listeners BEFORE setting src
      audio.onloadeddata = () => {
        console.log('✅ Audio loaded successfully, duration:', audio.duration);
      };

      audio.oncanplaythrough = () => {
        console.log('✅ Audio can play through');
      };

      audio.onplay = () => {
        console.log('▶️ Audio started playing');
        setAudioLoading(false);
        if (!muteAnimations) {
          setAnimationState('responding');
          setMood('Speaking...', true);
        }
      };

      audio.onended = () => {
        console.log('⏹️ Audio finished playing');
        setSpeakingMessageId(null);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        if (!muteAnimations) {
          resetToIdle();
          setMood('', false);
        }
      };

      audio.onerror = (e) => {
        console.error('❌ Audio playback error:', e, audio.error);
        setSpeakingMessageId(null);
        setAudioLoading(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        if (!muteAnimations) {
          resetToIdle();
          setMood('Audio playback failed', true);
          setTimeout(() => setMood('', false), 2000);
        }
      };

      // Set source and load
      audio.src = audioUrl;
      audio.load();

      // Gentle voice settings
      audio.playbackRate = 0.95;
      audio.preservesPitch = true;

      // Wait a moment for audio to load, then play
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🎬 Attempting to play audio...');
      await audio.play();
      console.log('✅ Audio.play() succeeded');
    } catch (error) {
      console.error('TTS error:', error);
      setSpeakingMessageId(null);
      setAudioLoading(false);
      if (!muteAnimations) {
        resetToIdle();
        setMood('Voice unavailable', true);
        setTimeout(() => setMood('', false), 2000);
      }
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeakingMessageId(null);
    setAudioLoading(false);
    if (!muteAnimations) {
      resetToIdle();
      setMood('', false);
    }
  };

  // Note: Auto-speak disabled to comply with browser autoplay policies
  // Users can click the speaker icon to play audio manually
  // This prevents "NotAllowedError: play() failed" issues

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* Floating Chat Button - Polished with pulse animation */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            whileHover={{ scale: 1.08, y: -4 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="fixed bottom-6 right-6 w-20 h-20 bg-gradient-to-br from-[#0B7BD6] via-[#3BA5D9] to-[#66D1C9] rounded-full shadow-2xl flex items-center justify-center z-50 cursor-pointer hover:shadow-[0_20px_50px_rgba(11,123,214,0.4)] transition-shadow ring-4 ring-white/50"
          >
            {/* Pulse rings */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0B7BD6] to-[#66D1C9] opacity-30"
              animate={{
                scale: [1, 1.3, 1.3, 1],
                opacity: [0.3, 0, 0, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            <span className="text-4xl drop-shadow-lg relative z-10">🐥</span>
            {/* Helper tooltip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.3 }}
              className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
            >
              <p className="text-sm font-medium text-gray-800">Chat with Dr. Chick! 💬</p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window - Enhanced Design */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 w-[720px] h-[720px] bg-white rounded-3xl shadow-[0_25px_80px_rgba(11,123,214,0.25)] z-50 flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header - Polished */}
            <div className="bg-gradient-to-r from-[#0B7BD6] via-[#3BA5D9] to-[#66D1C9] p-5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-3xl shadow-md ring-2 ring-white/30"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🐥
                </motion.div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight">Dr. Chick AI</h3>
                  <p className="text-white/90 text-xs font-medium">Your VitalView Health Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setTtsEnabled(!ttsEnabled);
                    if (!ttsEnabled) {
                      stopSpeaking();
                    }
                  }}
                  className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                  title={ttsEnabled ? 'Disable voice' : 'Enable voice'}
                >
                  {ttsEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex bg-gradient-to-br from-[#EEF8FF] to-white overflow-hidden">
              {/* 3D Dr. Chick - Left Panel */}
              <div className="w-[320px] border-r-2 border-gray-100 p-4 flex flex-col gap-3">
                {/* 3D Canvas Container */}
                <div className="flex-1 rounded-2xl overflow-hidden shadow-lg">
                  <DrChick3DCanvas
                    animationState={animationState}
                    showMoodBubble={useDrChickStore.getState().showMoodBubble}
                    moodText={useDrChickStore.getState().moodText}
                  />
                </div>
                
                {/* Dr. Chick Status Card - Enhanced */}
                <motion.div 
                  className="bg-gradient-to-br from-white to-[#F0F9FF] rounded-xl p-4 border border-[#0B7BD6]/20 shadow-sm"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <p className="text-xs text-center text-gray-700 font-medium">
                    <span className="font-bold text-[#0B7BD6]">Dr. Chick</span> is here!
                  </p>
                  <motion.p 
                    key={animationState}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] text-center text-gray-500 mt-2 font-medium"
                  >
                    {animationState === 'idle' && '💤 Ready to help'}
                    {animationState === 'wave' && '👋 Hello there!'}
                    {animationState === 'listen' && '👂 Listening carefully'}
                    {animationState === 'responding' && '🧠 Analyzing...'}
                  </motion.p>
                </motion.div>
              </div>

              {/* Messages - Right Side */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
    <div className="flex items-start gap-2 max-w-[90%]">
                      <div
                        className={`flex-1 rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-[#0B7BD6] to-[#66D1C9] text-white'
                            : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.role === 'user' ? 'text-white/70' : 'text-gray-400'
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {message.role === 'assistant' && ttsEnabled && (
                        <button
                          onClick={() => {
                            if (speakingMessageId === message.id) {
                              stopSpeaking();
                            } else {
                              speakText(message.content, message.id);
                            }
                          }}
                          disabled={audioLoading && speakingMessageId === message.id}
                          className={`mt-1 p-2 rounded-full transition-all ${
                            speakingMessageId === message.id && !audioLoading
                              ? 'bg-[#0B7BD6] text-white animate-pulse'
                              : audioLoading && speakingMessageId === message.id
                              ? 'bg-gray-200 text-gray-400'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                          title={
                            audioLoading && speakingMessageId === message.id
                              ? 'Generating voice...'
                              : speakingMessageId === message.id
                              ? 'Stop speaking'
                              : 'Read aloud with AI voice'
                          }
                        >
                          {audioLoading && speakingMessageId === message.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : speakingMessageId === message.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-[#0B7BD6] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#0B7BD6] rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-[#0B7BD6] rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your symptoms..."
                  className="flex-1 px-4 py-3 rounded-full border-2 border-gray-200 focus:border-[#0B7BD6] focus:outline-none text-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-[#0B7BD6] to-[#66D1C9] hover:opacity-90 rounded-full w-12 h-12 flex items-center justify-center text-xl disabled:opacity-50"
                >
                  ➤
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                AI responses are for informational purposes only
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
