import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Bot,
  User,
  Sparkles,
  Volume2,
  Send,
  Wrench,
  CheckCircle2,
  Radio,
  Sliders,
  AlertCircle,
  Key,
  Database,
  Layers,
  ShoppingBag,
  CreditCard,
  BookOpen,
} from 'lucide-react';
import VapiWeb from '@vapi-ai/web';
import { AIAgentConfig, TestCallMessage } from '../types/agent';

// Handle CJS/ESM interop for Vapi Web SDK
const Vapi = (VapiWeb as any).default || VapiWeb;

interface TestCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIAgentConfig;
}

export const TestCallModal: React.FC<TestCallModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [callMode, setCallMode] = useState<'vapi' | 'simulated'>('vapi');
  const [callState, setCallState] = useState<'idle' | 'connecting' | 'connected' | 'ended'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [messages, setMessages] = useState<TestCallMessage[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [vapiPublicKey, setVapiPublicKey] = useState<string>('');
  const [vapiAssistantId, setVapiAssistantId] = useState<string>('');
  const [vapiError, setVapiError] = useState<string | null>(null);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [customPublicKey, setCustomPublicKey] = useState('');
  const [callerPhone, setCallerPhone] = useState('+234 800 000 0000');
  const [callerName, setCallerName] = useState('Voice Caller');
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const vapiRef = useRef<any>(null);

  // Auto-scroll messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiSpeaking]);

  // Fetch Vapi Status & Credentials from backend on open
  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/vapi/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const key = data.publicKey || (import.meta as any).env?.VITE_VAPI_PUBLIC_KEY || '';
          setVapiPublicKey(key);
          setVapiAssistantId(data.assistantId || '');
          if (!key) {
            // Default to simulated mode if no public key is found
            setCallMode('simulated');
          }
        }
      })
      .catch((err) => {
        console.warn('Could not fetch vapi config:', err);
        setCallMode('simulated');
      });
  }, [isOpen]);

  // Timer while connected
  useEffect(() => {
    let timer: any;
    if (isOpen && callState === 'connected') {
      timer = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, callState]);

  // Convert numbers to English words for accurate speech synthesis pronunciation
  const numberToWords = (num: number): string => {
    if (num === 0) return 'zero';
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const helper = (n: number): string => {
      if (n < 20) return ones[n];
      if (n < 100) {
        const rem = n % 10;
        const t = tens[Math.floor(n / 10)];
        return rem ? `${t}-${ones[rem]}` : t;
      }
      if (n < 1000) {
        const rem = n % 100;
        return `${ones[Math.floor(n / 100)]} hundred${rem ? ' and ' + helper(rem) : ''}`;
      }
      if (n < 1000000) {
        const thousands = Math.floor(n / 1000);
        const rem = n % 1000;
        let remStr = '';
        if (rem > 0) {
          remStr = rem < 100 ? ' and ' + helper(rem) : ' ' + helper(rem);
        }
        return `${helper(thousands)} thousand${remStr}`;
      }
      if (n < 1000000000) {
        const millions = Math.floor(n / 1000000);
        const rem = n % 1000000;
        let remStr = '';
        if (rem > 0) {
          remStr = rem < 100 ? ' and ' + helper(rem) : ' ' + helper(rem);
        }
        return `${helper(millions)} million${remStr}`;
      }
      return n.toString();
    };

    return helper(Math.round(num)).trim();
  };

  const formatPriceToSpokenWords = (rawText: string): string => {
    if (!rawText) return rawText;
    let spoken = rawText;

    // Remove parenthetical numeric prices e.g. "ten thousand naira (₦10,000)" -> "ten thousand naira"
    spoken = spoken.replace(/\s*\((?:₦|N|NGN)?\s*[0-9,]+(?:\s*(?:naira|NGN))?\)/gi, '');

    // Replace ₦10,000, N10,000, NGN 10,000 with spoken words: "ten thousand naira"
    spoken = spoken.replace(/(?:₦|NGN|(?:\bN))\s*([0-9,]+(?:\.\d+)?)(?:\s*(?:naira|NGN))?/gi, (_, numStr) => {
      const cleanNum = Math.round(parseFloat(numStr.replace(/,/g, '')));
      if (!isNaN(cleanNum) && cleanNum > 0) {
        return `${numberToWords(cleanNum)} naira`;
      }
      return _;
    });

    // Replace digits followed by naira e.g. "10000 naira" -> "ten thousand naira"
    spoken = spoken.replace(/\b([0-9,]+)\s*(?:naira|NGN)\b/gi, (_, numStr) => {
      const cleanNum = Math.round(parseFloat(numStr.replace(/,/g, '')));
      if (!isNaN(cleanNum) && cleanNum > 0) {
        return `${numberToWords(cleanNum)} naira`;
      }
      return _;
    });

    // Replace shorthand "k" prices e.g. "10k" -> "ten thousand naira"
    spoken = spoken.replace(/\b(\d+(?:\.\d+)?)\s*[kK]\s*(?:naira|NGN)?\b/gi, (_, numStr) => {
      const cleanNum = Math.round(parseFloat(numStr) * 1000);
      if (!isNaN(cleanNum) && cleanNum > 0) {
        return `${numberToWords(cleanNum)} naira`;
      }
      return _;
    });

    // Replace price context numbers e.g. "price is 10,000", "costs 12,500", "total of 20,000"
    spoken = spoken.replace(
      /\b(costs?|priced?\s+at|price\s+is|price\s+of|total(?:ing|led)?\s+(?:is|of)?|total\s+amount\s+(?:is|of)?|fee\s+(?:is|of)?|amount\s+(?:is|of)?|subtotal\s+(?:is|of)?)\s*(?:₦|N|NGN)?\s*([0-9]{1,3}(?:,[0-9]{3})+|[1-9][0-9]{2,6})(?!\s*(?:mins|min|minutes|hours|hour|days|loaves|loaf|pieces|items|g|kg|am|pm|\/))\b/gi,
      (_, prefix, numStr) => {
        const cleanNum = Math.round(parseFloat(numStr.replace(/,/g, '')));
        if (!isNaN(cleanNum) && cleanNum > 0) {
          return `${prefix} ${numberToWords(cleanNum)} naira`;
        }
        return _;
      }
    );

    // Clean duplicate "naira naira" and leftover symbols
    spoken = spoken.replace(/\bnaira\s+naira\b/gi, 'naira');
    spoken = spoken.replace(/₦/g, ' naira ').replace(/🍰/g, '').replace(/📅/g, '');
    return spoken;
  };

  // Helper for simulated voice synthesis
  const speakSimulatedText = (text: string, callback?: () => void) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const spokenText = formatPriceToSpokenWords(text);
      const utterance = new SpeechSynthesisUtterance(spokenText);
      // Natural, unhurried speaking rate for warm bakery hospitality
      utterance.rate = Math.min(Math.max((config.settings.voiceSpeed || 1.0) * 0.85, 0.75), 0.92);
      utterance.pitch = config.voice.toLowerCase().includes('male') ? 0.9 : 1.1;

      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => {
        setIsAiSpeaking(false);
        callback?.();
      };
      utterance.onerror = () => {
        setIsAiSpeaking(false);
        callback?.();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setIsAiSpeaking(true);
      setTimeout(() => {
        setIsAiSpeaking(false);
        callback?.();
      }, 2000);
    }
  };

  // Start Call Function
  const handleStartCall = async (mode = callMode) => {
    setCallState('connecting');
    setDuration(0);
    setMessages([]);
    setIsAiSpeaking(false);
    setVapiError(null);

    const activeKey = customPublicKey.trim() || vapiPublicKey;

    if (mode === 'vapi' && activeKey) {
      try {
        const vapiInstance = new Vapi(activeKey);
        vapiRef.current = vapiInstance;

        // Vapi Event Listeners
        vapiInstance.on('call-start', () => {
          setCallState('connected');
          const welcomeMsg: TestCallMessage = {
            id: `msg-${Date.now()}`,
            sender: 'ai',
            text: config.greeting || "Hi, welcome to Baked by Doja! 🍰 We’ve got delicious freshly baked treats ready for you. What can I help you find or order today?",
            timestamp: 'Just now',
          };
          setMessages([welcomeMsg]);
        });

        vapiInstance.on('call-end', () => {
          setCallState('ended');
          setIsAiSpeaking(false);
        });

        vapiInstance.on('speech-start', () => {
          setIsAiSpeaking(true);
        });

        vapiInstance.on('speech-end', () => {
          setIsAiSpeaking(false);
        });

        vapiInstance.on('volume-level', (volume: number) => {
          setVolumeLevel(volume);
        });

        vapiInstance.on('message', (message: any) => {
          if (message.type === 'transcript') {
            if (message.transcriptType === 'final') {
              const newMsg: TestCallMessage = {
                id: `msg-${Date.now()}-${Math.random()}`,
                sender: message.role === 'assistant' ? 'ai' : 'user',
                text: message.transcript,
                timestamp: 'Just now',
              };
              setMessages((prev) => [...prev, newMsg]);
            }
          } else if (message.type === 'function-call') {
            const funcName = message.functionCall?.name || 'tool';
            let parsedArgs = {};
            try {
              parsedArgs = JSON.parse(message.functionCall?.arguments || '{}');
            } catch {
              parsedArgs = message.functionCall?.arguments || {};
            }

            const toolMsg: TestCallMessage = {
              id: `tool-${Date.now()}`,
              sender: 'tool',
              text: `Tool Executed: ${funcName}()`,
              timestamp: 'Just now',
              toolCall: {
                toolName: funcName,
                input: parsedArgs,
                output: { status: 'Executed successfully via Vapi backend' },
              },
            };
            setMessages((prev) => [...prev, toolMsg]);
          }
        });

        vapiInstance.on('error', (err: any) => {
          console.warn('Vapi client error:', err);
          const errMsg = err?.message || err?.errorMsg || 'Connection error with Vapi WebRTC';
          setVapiError(errMsg);
        });

        // Start call with assistant ID or inline config
        if (vapiAssistantId) {
          await vapiInstance.start(vapiAssistantId);
        } else {
          await vapiInstance.start({
            name: 'Baked by Doja Voice Specialist',
            firstMessage: config.greeting?.split('\n\n')[0] || "Hi, welcome to Baked by Doja! 🍰 We’ve got delicious freshly baked treats ready for you. What can I help you find or order today?",
            model: {
              provider: 'openai',
              model: 'gpt-4o',
              messages: [
                {
                  role: 'system',
                  content:
                    'You are the friendly AI voice sales agent for Baked by Doja banana bread bakery in Lagos, Nigeria. Speak warmly, assist with orders, and always pronounce all product prices in words followed by the currency naira, such as ten thousand naira for Classic Banana Bread and twelve thousand five hundred naira for Chocolate Chip Banana Bread.',
                },
              ],
            },
            voice: {
              provider: 'cartesia',
              voiceId: '248be419-c632-4f23-adf1-5324ed7dbf10',
            },
          });
        }
      } catch (err: any) {
        console.error('Failed to start Vapi call:', err);
        setVapiError(err.message || 'Could not connect to Vapi');
        // Fallback to simulated
        setCallMode('simulated');
        runSimulatedCall();
      }
    } else {
      // Simulated Call flow
      runSimulatedCall();
    }
  };

  const runSimulatedCall = () => {
    setTimeout(() => {
      setCallState('connected');
      const greetingText =
        config.greeting ||
        "Hi, welcome to Baked by Doja! 🍰 We’ve got delicious freshly baked treats ready for you. What can I help you find or order today?";
      const firstGreeting = greetingText.split('\n\n')[0];

      const initialMsg: TestCallMessage = {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: firstGreeting,
        timestamp: 'Just now',
      };
      setMessages([initialMsg]);
      speakSimulatedText(firstGreeting);
    }, 1200);
  };

  // Start on modal open
  useEffect(() => {
    if (isOpen) {
      handleStartCall(callMode);
    }
    return () => {
      if (vapiRef.current) {
        try {
          vapiRef.current.stop();
        } catch {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEndCall = () => {
    if (vapiRef.current) {
      try {
        vapiRef.current.stop();
      } catch {}
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
    setCallState('ended');
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (vapiRef.current) {
      try {
        vapiRef.current.setMuted(nextMute);
      } catch {}
    }
  };

  const handleSendMessage = (userText: string) => {
    if (!userText.trim() || callState !== 'connected') return;

    if (config.settings.bargeIn && isAiSpeaking) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }

    const userMsg: TestCallMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setCustomInput('');

    if (callMode === 'vapi' && vapiRef.current) {
      try {
        vapiRef.current.send({
          type: 'add-message',
          message: {
            role: 'user',
            content: userText,
          },
        });
      } catch (err) {
        console.warn('Vapi send error, falling back to simulated handler:', err);
        processAgentResponse(userText.toLowerCase());
      }
    } else {
      setTimeout(() => {
        processAgentResponse(userText.toLowerCase());
      }, config.settings.responseDelay || 350);
    }
  };

  const processAgentResponse = async (text: string) => {
    setIsAiSpeaking(true);
    setIsProcessingResponse(true);

    try {
      const res = await fetch('/api/admin/ai-agent/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
          callerPhone,
          callerName,
        }),
      });

      const data = await res.json();
      setIsProcessingResponse(false);

      if (data.success && data.reply) {
        // Render any tool execution cards
        if (Array.isArray(data.toolsExecuted) && data.toolsExecuted.length > 0) {
          for (const tool of data.toolsExecuted) {
            const toolMsg: TestCallMessage = {
              id: `tool-${Date.now()}-${Math.random()}`,
              sender: 'tool',
              text: `Grounded: ${tool.toolName} [${tool.category}]`,
              timestamp: 'Just now',
              toolCall: {
                toolName: tool.toolName,
                input: tool.input,
                output: tool.output,
              },
            };
            setMessages((prev) => [...prev, toolMsg]);
          }
        }

        const aiMsg: TestCallMessage = {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          timestamp: 'Just now',
        };
        setMessages((prev) => [...prev, aiMsg]);
        speakSimulatedText(data.reply);
      } else {
        throw new Error(data.error || 'Failed to generate agent response');
      }
    } catch (err: any) {
      console.warn('Agent response error, fallback to simulated greeting:', err);
      setIsProcessingResponse(false);
      const fallbackReply =
        "Thank you for contacting Baked by Doja! We are baking fresh banana bread batches right now at 14 Admiralty Way, Lekki Phase 1. How may I assist with your order?";
      const aiMsg: TestCallMessage = {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: fallbackReply,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakSimulatedText(fallbackReply);
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const presetReplies = [
    { label: '📅 Book Appointment', text: 'I would like to schedule an appointment order for two banana breads for tomorrow morning.' },
    { label: '🍞 Production & Prices', text: 'What banana breads are baking right now and what are the prices?' },
    { label: '📦 Orders', text: 'Can you check the status of my order?' },
    { label: '💳 Payments', text: 'Did my Paystack payment or bank transfer go through?' },
    { label: '👤 Customer CRM', text: 'Can you look up my customer profile and saved delivery address?' },
    { label: '📞 Past Calls', text: 'What did I ask about during my previous call?' },
    { label: '📚 Knowledge Base', text: 'Do you deliver to Lekki Phase 1 and are your banana breads nut-free?' },
    { label: '🛍️ Buy Loaves', text: 'I would like to order 2 Classic Banana Bread loaves to Admiralty Way, Lekki' },
  ];

  const hasVapiKey = Boolean(vapiPublicKey || customPublicKey);

  return (
    <div className="fixed inset-0 z-50 bg-[#17243A]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-[#E6E7EB] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E6E7EB] flex items-center justify-between bg-[#FAF7F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F9B91A] flex items-center justify-center shadow-xs text-[#17243A]">
              <Phone className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#17243A]">
                  Test Voice Call: {config.name}
                </h3>
                {callMode === 'vapi' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
                    <Radio className="w-2.5 h-2.5 animate-pulse" />
                    Vapi WebRTC
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                    <Sparkles className="w-2.5 h-2.5" />
                    Browser Audio Simulator
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280]">
                Line: <span className="font-mono text-[#17243A] font-semibold">{config.phoneNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode switch */}
            <div className="flex items-center rounded-xl bg-white border border-[#E6E7EB] p-0.5 text-xs font-semibold">
              <button
                onClick={() => {
                  setCallMode('vapi');
                  handleStartCall('vapi');
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  callMode === 'vapi'
                    ? 'bg-[#17243A] text-white shadow-2xs'
                    : 'text-[#6B7280] hover:text-[#17243A]'
                }`}
                title="Use real Vapi WebRTC live mic audio"
              >
                Vapi WebRTC
              </button>
              <button
                onClick={() => {
                  setCallMode('simulated');
                  handleStartCall('simulated');
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  callMode === 'simulated'
                    ? 'bg-[#17243A] text-white shadow-2xs'
                    : 'text-[#6B7280] hover:text-[#17243A]'
                }`}
                title="Use local browser speech synthesis"
              >
                Simulator
              </button>
            </div>

            <button
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className="p-2 rounded-xl text-[#6B7280] hover:text-[#17243A] hover:bg-white border border-transparent hover:border-[#E6E7EB] transition-colors cursor-pointer"
              title="Vapi Key Settings"
            >
              <Key className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                handleEndCall();
                onClose();
              }}
              className="p-2 rounded-xl text-[#6B7280] hover:text-[#17243A] hover:bg-white border border-transparent hover:border-[#E6E7EB] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Vapi Key Bar */}
        {showKeyConfig && (
          <div className="px-5 py-3 bg-[#FFFBEB] border-b border-[#FDE68A] flex items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Key className="w-4 h-4 text-[#D97706] shrink-0" />
              <input
                type="text"
                value={customPublicKey}
                onChange={(e) => setCustomPublicKey(e.target.value)}
                placeholder={vapiPublicKey ? `Using key: ${vapiPublicKey.slice(0, 12)}...` : 'Enter Vapi Public Key (e.g. 5d8e...)'}
                className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-[#FDE68A] focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A]"
              />
            </div>
            <button
              onClick={() => handleStartCall(callMode)}
              className="px-3 py-1.5 bg-[#F9B91A] hover:bg-[#E5A812] text-[#17243A] font-bold rounded-lg cursor-pointer text-xs"
            >
              Reconnect
            </button>
          </div>
        )}

        {/* Vapi Error Banner if any */}
        {vapiError && (
          <div className="px-5 py-2.5 bg-[#FEF2F2] border-b border-[#FEE2E2] flex items-center justify-between text-xs text-[#DC2626]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{vapiError} (Falling back to local speech simulator)</span>
            </div>
            <button
              onClick={() => setVapiError(null)}
              className="text-[#991B1B] font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Live Bakery Memory Grounding & Caller Simulator Bar */}
        <div className="px-5 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold text-[#1E293B] text-[11px]">
              <Database className="w-3.5 h-3.5 text-[#15966B]" />
              Live Memory Grounded:
            </span>
            <div className="flex items-center gap-1 flex-wrap font-mono text-[10px]">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
                Orders
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                Production
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9333EA]" />
                Customers
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                Payments
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
                Calls
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
                Knowledge Base
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#64748B] font-medium">Caller Persona:</span>
            <select
              value={`${callerName}|${callerPhone}`}
              onChange={(e) => {
                const [n, p] = e.target.value.split('|');
                setCallerName(n);
                setCallerPhone(p);
              }}
              className="px-2 py-1 bg-white border border-[#CBD5E1] rounded-lg text-[11px] font-medium text-[#1E293B] shadow-2xs focus:outline-hidden cursor-pointer"
            >
              <option value="Voice Caller|+234 800 000 0000">Caller (+234 800 000 0000)</option>
              <option value="Guest Customer|+234 801 234 5678">Guest Customer (+234 801 234 5678)</option>
              <option value="New Inquirer|+234 812 345 6789">New Inquirer (+234 812 345 6789)</option>
            </select>
          </div>
        </div>

        {/* Main Calling Stage */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {callState === 'connecting' ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#FAF7F0] border-4 border-[#F9B91A] flex items-center justify-center animate-pulse">
                  <Phone className="w-8 h-8 text-[#17243A]" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#15966B] border-2 border-white flex items-center justify-center">
                  <Radio className="w-3 h-3 text-white animate-spin" />
                </div>
              </div>
              <div>
                <p className="font-bold text-sm text-[#17243A]">
                  Connecting to {callMode === 'vapi' ? 'Vapi Voice Agent' : 'Agent Simulator'}...
                </p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Establishing WebRTC audio stream & RAG knowledge links
                </p>
              </div>
            </div>
          ) : callState === 'ended' ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280]">
                <PhoneOff className="w-8 h-8" />
              </div>
              <div>
                <p className="font-bold text-base text-[#17243A]">Call Ended</p>
                <p className="text-xs text-[#6B7280] mt-1">Total Duration: {formatDuration(duration)}</p>
              </div>
              <button
                onClick={() => handleStartCall(callMode)}
                className="px-5 py-2.5 rounded-xl bg-[#F9B91A] hover:bg-[#E5A812] text-[#17243A] font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                Start New Call
              </button>
            </div>
          ) : (
            <>
              {/* Call Status & Live Audio Waves */}
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#F1EADA] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-[#F9B91A] text-[#17243A] flex items-center justify-center font-bold shadow-xs">
                      <Bot className="w-6 h-6" />
                    </div>
                    {isAiSpeaking && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#15966B] border-2 border-white rounded-full animate-ping" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#17243A]">{config.name}</span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#15966B]">
                        <span className="w-2 h-2 rounded-full bg-[#15966B] animate-pulse" />
                        Live
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-0.5">
                      <span>{isAiSpeaking ? 'AI Speaking...' : isMuted ? 'Microphone Muted' : 'Listening for customer...'}</span>
                      <span>•</span>
                      <span className="font-mono font-bold text-[#17243A]">{formatDuration(duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Animated Voice Waveform Visualizer */}
                <div className="flex items-center gap-1 h-7 px-3 bg-white rounded-xl border border-[#E6E7EB]">
                  {[14, 24, 18, 28, 20, 16, 26, 12].map((height, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isAiSpeaking
                          ? 'bg-[#F9B91A]'
                          : !isMuted
                          ? 'bg-[#15966B]'
                          : 'bg-[#D1D5DB]'
                      }`}
                      style={{
                        height: isAiSpeaking || (!isMuted && volumeLevel > 0.05)
                          ? `${Math.max(6, Math.min(26, height * (0.4 + Math.random() * 0.8)))}px`
                          : '4px',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Conversation Live Transcript */}
              <div className="space-y-3.5 min-h-[260px] max-h-[380px] overflow-y-auto pr-1">
                {messages.map((msg) => {
                  if (msg.sender === 'tool' && msg.toolCall) {
                    const name = msg.toolCall.toolName || '';
                    let badgeColor = 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]';
                    let domainName = 'Backend Integration';

                    if (name.toLowerCase().includes('order')) {
                      badgeColor = 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]';
                      domainName = '📦 Orders Store';
                    } else if (name.toLowerCase().includes('payment')) {
                      badgeColor = 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]';
                      domainName = '💳 Paystack Payments';
                    } else if (name.toLowerCase().includes('product') || name.toLowerCase().includes('stock')) {
                      badgeColor = 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
                      domainName = '🍞 Production & Oven';
                    } else if (name.toLowerCase().includes('customer')) {
                      badgeColor = 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]';
                      domainName = '👤 Customer CRM';
                    } else if (name.toLowerCase().includes('call')) {
                      badgeColor = 'bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD]';
                      domainName = '📞 Past Calls Memory';
                    } else if (name.toLowerCase().includes('knowledge')) {
                      badgeColor = 'bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]';
                      domainName = '📚 Knowledge Base RAG';
                    }

                    return (
                      <div
                        key={msg.id}
                        className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-xs space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between font-mono text-[11px] font-bold">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${badgeColor}`}>
                            <Wrench className="w-3 h-3" />
                            {domainName}: {name}()
                          </span>
                          <span className="text-[#15966B] flex items-center gap-1 font-semibold text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Live Data Grounded
                          </span>
                        </div>
                        <pre className="bg-[#0F172A] text-[#38BDF8] p-2.5 rounded-lg text-[10.5px] overflow-x-auto font-mono max-h-48 leading-relaxed">
                          {JSON.stringify(msg.toolCall.output || msg.toolCall.input, null, 2)}
                        </pre>
                      </div>
                    );
                  }

                  const isAi = msg.sender === 'ai';

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 text-xs ${
                        isAi ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      {isAi && (
                        <div className="w-7 h-7 rounded-full bg-[#F9B91A] text-[#17243A] flex items-center justify-center shrink-0 font-bold">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          isAi
                            ? 'bg-[#FAF7F0] border border-[#F1EADA] text-[#17243A]'
                            : 'bg-[#17243A] text-white'
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>

                      {!isAi && (
                        <div className="w-7 h-7 rounded-full bg-[#17243A] text-white flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </>
          )}
        </div>

        {/* Interactive Input & Controls Bar */}
        {callState === 'connected' && (
          <div className="p-4 bg-[#FAF7F0] border-t border-[#E6E7EB] space-y-3">
            {/* Quick response suggestions */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase self-center mr-1">
                Say:
              </span>
              {presetReplies.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(item.text)}
                  className="px-2.5 py-1 bg-white hover:bg-[#F3EFE6] border border-[#E6E7EB] rounded-lg text-[11px] font-medium text-[#17243A] transition-colors cursor-pointer shadow-2xs"
                  title={item.text}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Input & Call Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMute}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
                  isMuted
                    ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
                    : 'bg-white text-[#6B7280] border-[#E6E7EB] hover:bg-[#F3F4F6]'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage(customInput);
                  }}
                  placeholder={callMode === 'vapi' ? 'Speak into your microphone or type here...' : 'Speak or type customer response...'}
                  className="w-full pl-3 pr-9 py-2 text-xs rounded-xl bg-white border border-[#E6E7EB] text-[#17243A] placeholder-[#9CA3AF] focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A]"
                />
                <button
                  onClick={() => handleSendMessage(customInput)}
                  disabled={!customInput.trim()}
                  className="w-7 h-7 absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-[#F9B91A] text-[#17243A] disabled:opacity-40 flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.99] transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
