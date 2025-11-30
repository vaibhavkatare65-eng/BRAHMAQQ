import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, DayContent, JournalEntry } from '../types';
import { getDayContent, JOURNAL_PROMPTS, MILESTONES } from '../constants';
import { storage } from '../services/storage';
import { OmSymbol } from '../components/OmSymbol';
import { MalaTracker } from '../components/MalaTracker';
import { Button } from '../components/ui/Button';
import { 
  Home, 
  Activity, 
  BookOpen, 
  Award, 
  PenTool, 
  CheckCircle, 
  Lock, 
  Upload, 
  Shield, 
  Crown, 
  Trophy,
  LogOut,
  Music,
  PlayCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
  onLogout: () => void;
}

const MUSIC_TRACKS = [
  {
    id: 1,
    title: "Anti Urge Frequency",
    subtitle: "Healing Flute & Nature",
    url: "https://cdn.pixabay.com/audio/2019/05/22/audio_456905d8f6.mp3", // Updated working track
    icon: <Music className="w-6 h-6" />
  },
  {
    id: 3,
    title: "Divine Focus",
    subtitle: "Deep Ambient Silence",
    url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
    icon: <OmSymbol className="w-6 h-6" />
  }
];

const SATTVIC_CHALLENGES = [
  "Walk barefoot on grass for 5 minutes to ground your energy.",
  "Eat your next meal in complete silence (Maun Vrat).",
  "Take 10 deep conscious breaths right now.",
  "Drink a glass of water while sitting down (not standing).",
  "Give a genuine compliment to a stranger or family member.",
  "Sit in Vajrasana (Thunderbolt Pose) for 3 minutes.",
  "Look at the sky/nature for 2 minutes without your phone.",
  "Listen to a 432Hz frequency track while closing your eyes.",
  "Declutter one small corner of your room.",
  "Write down 3 things you are grateful for immediately.",
  "Hold a plank for as long as you can to ignite Agni (fire).",
  "Feed a bird, stray animal, or water a plant.",
  "Avoid sugar for the next 4 hours.",
  "Chant 'Om' 7 times with deep resonance.",
  "Wash your face with cold water to reset your senses."
];

export const Dashboard: React.FC<DashboardProps> = ({ user, onUpdateUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'progress' | 'journal' | 'teachings' | 'badges' | 'music'>('home');
  const [dayContent, setDayContent] = useState<DayContent>(getDayContent(user.lastCompletedDay + 1));
  const [uploading, setUploading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fun/Bonus State
  const [currentChallenge, setCurrentChallenge] = useState<string>(SATTVIC_CHALLENGES[0]);
  const [isChallengeCompleted, setIsChallengeCompleted] = useState(false);

  // Journal State
  const [journalAnswers, setJournalAnswers] = useState<{[key: string]: string}>({});
  const [journalHistory, setJournalHistory] = useState<JournalEntry[]>([]);
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);

  const currentDay = user.lastCompletedDay + 1;
  const isLocked = !user.videoSubmittedToday;

  useEffect(() => {
    // Randomize challenge on mount
    setCurrentChallenge(SATTVIC_CHALLENGES[Math.floor(Math.random() * SATTVIC_CHALLENGES.length)]);

    const updateTimer = () => {
      if (user.videoSubmittedToday && user.lastCompletionTime) {
        const now = Date.now();
        const nextUnlock = user.lastCompletionTime + (24 * 60 * 60 * 1000);
        const diff = nextUnlock - now;

        if (diff > 0) {
          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeRemaining(`${h}h ${m}m`);
        } else {
          // Unlock time reached
          setTimeRemaining(null);
          if (user.videoSubmittedToday) {
             const updated = storage.updateUser({ videoSubmittedToday: false });
             onUpdateUser(updated);
          }
        }
      } else {
        setTimeRemaining(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, onUpdateUser]);

  // Load journal history when tab is active
  useEffect(() => {
    if (activeTab === 'journal') {
      const history = storage.getJournal();
      setJournalHistory(history.sort((a, b) => b.date - a.date));
    }
  }, [activeTab]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      // Simulate upload delay
      setTimeout(() => {
        setUploading(false);
        const updated = storage.updateUser({
          videoSubmittedToday: true,
          lastCompletedDay: user.lastCompletedDay + 1,
          lastCompletionTime: Date.now()
        });
        onUpdateUser(updated);
        alert("Sacred offering accepted. Your day is now complete.");
      }, 2000);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleJournalSubmit = () => {
    const entry: JournalEntry = {
      day: currentDay,
      date: Date.now(),
      answers: Object.entries(journalAnswers).map(([k, v]) => ({ prompt: k, answer: v as string }))
    };
    storage.saveJournal(entry);
    setJournalAnswers({});
    const history = storage.getJournal();
    setJournalHistory(history.sort((a, b) => b.date - a.date));
    alert("Journal saved successfully.");
  };

  const refreshChallenge = () => {
    setIsChallengeCompleted(false);
    let newChallenge = currentChallenge;
    while (newChallenge === currentChallenge) {
      newChallenge = SATTVIC_CHALLENGES[Math.floor(Math.random() * SATTVIC_CHALLENGES.length)];
    }
    setCurrentChallenge(newChallenge);
  };

  const renderHome = () => (
    <div className="space-y-6">
      <div className="bg-brahma-dark/5 p-6 rounded-2xl border border-brahma-dark/10">
        <h2 className="text-2xl font-serif text-brahma-dark font-bold mb-2">Day {currentDay}</h2>
        <p className="text-brahma-gold font-medium uppercase tracking-wide">
          {108 - currentDay} days remaining
        </p>
      </div>

      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-brahma-gold/20">
        <h3 className="text-lg font-bold text-brahma-dark mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-brahma-gold" />
          Daily Accountability
        </h3>
        
        {user.videoSubmittedToday ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-brahma-gold rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle className="w-8 h-8 text-brahma-bg" />
            </div>
            <h4 className="text-xl font-bold text-brahma-dark mb-2">Sacred Offering Accepted</h4>
            
            <div className="bg-brahma-gold/10 p-5 rounded-xl border border-brahma-gold/20 my-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <OmSymbol className="w-16 h-16" />
                </div>
                <p className="text-xs uppercase tracking-widest text-brahma-gold font-bold mb-3">Remember Why You Started</p>
                <p className="text-brahma-dark font-serif italic text-lg leading-relaxed">
                    "{user.reason || "To reclaim my inner power and mastery over the self."}"
                </p>
                <p className="text-xs text-brahma-dark/60 mt-3 font-medium">
                    You are stronger than your urges. Keep going.
                </p>
            </div>

            <p className="text-brahma-dark/70 mb-4 text-sm">
              Next unlock in: <span className="font-mono font-bold text-brahma-gold ml-1">{timeRemaining}</span>
            </p>
          </div>
        ) : (
          <>
            <div className="bg-brahma-gold/10 p-4 rounded-lg mb-4">
              <p className="text-brahma-dark font-serif italic text-center">"{dayContent.quote}"</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                 <span className="bg-brahma-dark text-brahma-bg w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                 <p className="text-sm">Record a 5-10 sec video stating today's vow.</p>
              </div>
              <div className="flex items-start gap-3">
                 <span className="bg-brahma-dark text-brahma-bg w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                 <p className="text-sm">Speak the quote above with conviction.</p>
              </div>
              <div className="flex items-start gap-3">
                 <span className="bg-brahma-dark text-brahma-bg w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                 <p className="text-sm">Upload to mark your day as complete.</p>
              </div>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="video/*" 
              capture="environment"
              onChange={handleFileChange}
            />

            <Button 
              onClick={handleUploadClick} 
              disabled={uploading}
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              {uploading ? 'Uploading...' : (
                <>
                  <Upload className="w-4 h-4" />
                  Record / Upload Video
                </>
              )}
            </Button>
            <p className="text-xs text-center text-brahma-dark/50 mt-3">
              Your video is completely private and stored locally.
            </p>
          </>
        )}
      </div>

      {/* Prana Boost Section (Fun Task) */}
      <div className="bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-brahma-gold/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles className="w-24 h-24 text-brahma-gold rotate-12" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold text-brahma-dark flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brahma-gold fill-brahma-gold" />
                Prana Boost
             </h3>
             <button 
                onClick={refreshChallenge}
                className="text-brahma-dark/50 hover:text-brahma-gold transition-colors p-1 rounded-full hover:bg-brahma-gold/10"
                title="New Task"
             >
               <RefreshCw className="w-4 h-4" />
             </button>
          </div>

          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-brahma-dark/50 mb-1">Today's Sattvic Side-Quest</p>
            <p className={`text-md font-serif text-brahma-dark leading-relaxed ${isChallengeCompleted ? 'line-through opacity-50' : ''}`}>
              {currentChallenge}
            </p>
          </div>

          <button 
             onClick={() => setIsChallengeCompleted(!isChallengeCompleted)}
             className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
               isChallengeCompleted 
               ? 'bg-green-100 text-green-800 border border-green-200' 
               : 'bg-brahma-gold/10 text-brahma-dark hover:bg-brahma-gold/20 border border-transparent'
             }`}
          >
             {isChallengeCompleted ? (
               <>
                 <CheckCircle className="w-5 h-5" />
                 Quest Completed
               </>
             ) : (
               <span className="font-medium text-sm">Mark as Done</span>
             )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-8 pb-20">
      <MalaTracker completedDays={user.lastCompletedDay} />
      
      <div className="space-y-4">
        <h3 className="font-serif text-xl text-brahma-dark border-b border-brahma-dark/10 pb-2">Milestone Path</h3>
        {MILESTONES.map((m) => {
          const isUnlocked = user.lastCompletedDay >= m.day;
          const Icon = m.icon === 'shield' ? Shield : m.icon === 'crown' ? Award : m.icon === 'award' ? Award : Trophy;
          
          return (
            <div key={m.day} className={`flex items-center gap-4 p-4 rounded-xl border ${isUnlocked ? 'bg-brahma-gold/10 border-brahma-gold' : 'bg-brahma-dark/5 border-transparent opacity-60'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-brahma-gold text-brahma-bg' : 'bg-brahma-dark/20 text-brahma-dark'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-brahma-dark">{m.title}</h4>
                <p className="text-sm text-brahma-dark/70">{m.description}</p>
              </div>
              <div className="ml-auto font-mono text-xs font-bold bg-brahma-bg px-2 py-1 rounded text-brahma-dark">
                Day {m.day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderJournal = () => (
    <div className="space-y-6 pb-20">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-brahma-dark">Daily Reflection</h2>
        <p className="text-sm text-brahma-dark/60 mt-1">Look inward to find strength.</p>
      </div>

      {!user.videoSubmittedToday ? (
        <div className="flex flex-col items-center justify-center p-10 bg-brahma-dark/5 rounded-2xl border border-brahma-dark/10">
          <Lock className="w-12 h-12 text-brahma-dark/40 mb-4" />
          <p className="text-center text-brahma-dark/60">
            Complete your daily accountability video to unlock the journal.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="space-y-6 bg-white/40 p-6 rounded-2xl border border-brahma-dark/5">
            {JOURNAL_PROMPTS.slice(0, 3).map((prompt, idx) => (
              <div key={idx} className="space-y-2">
                <label className="block text-sm font-medium text-brahma-dark">{prompt}</label>
                <textarea 
                  className="w-full bg-white/70 border border-brahma-gold/30 rounded-lg p-3 text-brahma-dark focus:ring-2 focus:ring-brahma-gold focus:outline-none min-h-[100px]"
                  placeholder="Write your thoughts here..."
                  value={journalAnswers[prompt] || ''}
                  onChange={(e) => setJournalAnswers(prev => ({...prev, [prompt]: e.target.value}))}
                />
              </div>
            ))}
            <Button onClick={handleJournalSubmit} fullWidth>Save Entry</Button>
          </div>

          <div className="space-y-4 pt-6 border-t border-brahma-dark/10">
            <h3 className="font-bold text-brahma-dark flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brahma-gold" />
              Past Reflections
            </h3>
            {journalHistory.length === 0 ? (
               <p className="text-center text-brahma-dark/40 italic py-4">No journal entries yet.</p>
            ) : (
              <div className="space-y-3">
                {journalHistory.map((entry) => (
                  <div key={entry.date} className="bg-white/30 rounded-xl overflow-hidden border border-brahma-dark/5">
                    <button 
                      onClick={() => setExpandedEntry(expandedEntry === entry.date ? null : entry.date)}
                      className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-brahma-dark/10 text-brahma-dark text-xs font-bold px-3 py-1 rounded-full">
                          Day {entry.day}
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-brahma-dark/50">
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                    {expandedEntry === entry.date && (
                      <div className="p-4 bg-white/20 border-t border-brahma-dark/5 space-y-4">
                        {entry.answers.map((qa, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-xs font-bold text-brahma-dark/70">{qa.prompt}</p>
                            <p className="text-sm text-brahma-dark leading-relaxed whitespace-pre-wrap">{qa.answer}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderTeachings = () => (
    <div className="space-y-6 pb-20">
       {!user.videoSubmittedToday ? (
        <div className="flex flex-col items-center justify-center p-10 bg-brahma-dark/5 rounded-2xl border border-brahma-dark/10">
          <Lock className="w-12 h-12 text-brahma-dark/40 mb-4" />
          <p className="text-center text-brahma-dark/60">
            Complete your daily accountability video to unlock sacred wisdom.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-brahma-dark text-brahma-bg p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
              <OmSymbol className="w-32 h-32" />
            </div>
            <h3 className="text-sm uppercase tracking-widest text-brahma-bg/50 mb-2">Shri Krishna's Teaching</h3>
            <p className="font-serif text-lg text-brahma-bg italic mb-4">"{dayContent.gitaVerse}"</p>
            <p className="text-brahma-bg/80 text-sm leading-relaxed">{dayContent.gitaTranslation}</p>
          </div>
          
          <div className="bg-brahma-gold/10 p-4 rounded-xl border border-brahma-gold/30">
             <p className="text-sm font-medium text-brahma-dark text-center">
                <span className="block font-bold mb-1 text-brahma-gold">Today's Practice</span>
                {dayContent.task}
             </p>
          </div>
        </>
      )}
    </div>
  );

  const renderMusic = () => (
    <div className="space-y-6 pb-20">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-brahma-dark">Sacred Sound</h2>
        <p className="text-sm text-brahma-dark/60 mt-1">Curated frequencies for your journey.</p>
      </div>

      <div className="space-y-4">
        {MUSIC_TRACKS.map((track) => (
          <div key={track.id} className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-brahma-gold/20 shadow-sm flex flex-col gap-4 hover:bg-white/70 transition-colors">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brahma-dark text-brahma-bg rounded-full flex items-center justify-center shadow-md">
                   {track.icon}
                </div>
                <div className="flex-1">
                   <h3 className="font-bold text-brahma-dark">{track.title}</h3>
                   <p className="text-xs text-brahma-dark/60">{track.subtitle}</p>
                </div>
             </div>
             
             <audio 
               controls 
               className="w-full h-8 accent-brahma-gold" 
               controlsList="nodownload"
               preload="none"
             >
               <source src={track.url} type="audio/mpeg" />
               Your browser does not support the audio element.
             </audio>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-brahma-gold/5 rounded-lg border border-brahma-gold/10 mt-6">
        <p className="text-xs text-center text-brahma-dark/50 italic">
          "Music washes away from the soul the dust of everyday life."
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brahma-bg flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-brahma-bg/90 backdrop-blur-md sticky top-0 z-50 border-b border-brahma-dark/5">
        <div className="flex items-center gap-2">
          <OmSymbol className="w-8 h-8 text-brahma-dark" />
          <span className="font-serif font-bold text-brahma-dark text-lg">ब्रह्म पथ</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono bg-brahma-dark text-brahma-bg px-2 py-1 rounded">
            Day {currentDay}
          </div>
          <button onClick={onLogout} className="text-brahma-dark/60 hover:text-red-800">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'progress' && renderProgress()}
        {activeTab === 'journal' && renderJournal()}
        {activeTab === 'teachings' && renderTeachings()}
        {activeTab === 'music' && renderMusic()}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-brahma-dark text-brahma-bg pb-safe pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <div className="flex justify-between items-center max-w-md mx-auto h-16">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-brahma-gold' : 'text-brahma-bg/50'}`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('progress')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'progress' ? 'text-brahma-gold' : 'text-brahma-bg/50'}`}
          >
            <Activity className="w-6 h-6" />
            <span className="text-[10px] font-medium">Progress</span>
          </button>

          <div className="relative -top-6">
            <button 
              onClick={() => setActiveTab('music')} 
              className={`bg-brahma-gold w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-brahma-bg transition-transform active:scale-95 ${activeTab === 'music' ? 'ring-2 ring-brahma-dark ring-offset-2 ring-offset-brahma-bg' : ''}`}
            >
              <Music className="w-6 h-6 text-brahma-bg" />
            </button>
          </div>

          <button 
            onClick={() => setActiveTab('journal')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'journal' ? 'text-brahma-gold' : 'text-brahma-bg/50'}`}
          >
            <PenTool className="w-6 h-6" />
            <span className="text-[10px] font-medium">Journal</span>
          </button>

          <button 
            onClick={() => setActiveTab('teachings')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'teachings' ? 'text-brahma-gold' : 'text-brahma-bg/50'}`}
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-[10px] font-medium">Teaching</span>
          </button>
        </div>
      </nav>
    </div>
  );
};