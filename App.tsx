import React, { useState, useEffect } from 'react';
import { UserProfile, AppState } from './types';
import { storage } from './services/storage';
import { supabase } from './services/supabase';
import { REASONS } from './constants';
import { OmSymbol } from './components/OmSymbol';
import { Button } from './components/ui/Button';
import { Dashboard } from './pages/Dashboard';
import { Check, ChevronRight, Lock, Loader2 } from 'lucide-react';

const App = () => {
  const [user, setUser] = useState<UserProfile>(storage.getUser());
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  
  // Onboarding specific state
  const [onboardingAge, setOnboardingAge] = useState<string>('');
  const [onboardingReason, setOnboardingReason] = useState<string>('');

  // Auth specific state
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      // 1. Check local storage
      let currentUser = storage.getUser();
      currentUser = storage.checkDailyReset(currentUser);
      
      // 2. Check Supabase Session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // If logged in, try to fetch fresh data from cloud
        const cloudProfile = await storage.loadProfileFromSupabase(session.user.id);
        if (cloudProfile) {
          currentUser = storage.updateUser(cloudProfile);
        } else {
          // Sync local to cloud if cloud is empty but session exists (rare case)
          currentUser = storage.updateUser({ ...currentUser, id: session.user.id, isAuthenticated: true });
          storage.syncProfileToSupabase(currentUser);
        }
      }

      setUser(currentUser);

      // Determine State
      if (currentUser.isAuthenticated && currentUser.hasPaid) {
        setAppState(AppState.DASHBOARD);
      } else if (currentUser.isAuthenticated && !currentUser.hasPaid) {
        setAppState(AppState.PAYMENT);
      } else if (currentUser.reason) {
        setAppState(AppState.COMMITMENT);
      } else {
        setAppState(AppState.LANDING);
      }
    };

    initializeApp();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
         const cloudProfile = await storage.loadProfileFromSupabase(session.user.id);
         if (cloudProfile) {
            const updated = storage.updateUser(cloudProfile);
            setUser(updated);
         }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStart = () => setAppState(AppState.ONBOARDING);

  const handleOnboardingComplete = (age: number, reason: string) => {
    const updated = storage.updateUser({ age, reason });
    setUser(updated);
    // Show toast equivalent
    alert("आप ब्रह्म पथ में प्रवेश कर चुके हैं!");
    setAppState(AppState.COMMITMENT);
  };

  const handleCommitment = () => {
    setAppState(AppState.AUTH);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;
    
    setAuthError(null);
    setAuthLoading(true);

    try {
      let result;
      if (authMode === 'signup') {
        result = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
      }

      if (result.error) throw result.error;

      if (result.data.user) {
        const userId = result.data.user.id;
        // Merge current onboarding progress with the new authenticated user
        const updated = storage.updateUser({ 
          email: authEmail, 
          isAuthenticated: true,
          id: userId
        });
        setUser(updated);
        
        // Sync initial data to Supabase
        await storage.syncProfileToSupabase(updated);
        
        // Move to payment
        setAppState(AppState.PAYMENT);
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePayment = async () => {
    // Mock Payment success
    const updated = storage.updateUser({ 
      hasPaid: true,
      startDate: Date.now()
    });
    setUser(updated);
    
    // Sync payment status to Cloud
    await storage.syncProfileToSupabase(updated);

    setAppState(AppState.DASHBOARD);
  };
  
  const handleLogout = async () => {
      await supabase.auth.signOut();
      localStorage.removeItem('brahma_path_user');
      const resetUser = storage.getUser(); // Will get initial state or cleared state
      setUser(resetUser);
      setAppState(AppState.LANDING);
      setAuthEmail('');
      setAuthPassword('');
  };

  const handleUserUpdate = (newProfile: UserProfile) => {
    setUser(newProfile);
    // Whenever Dashboard updates the user (e.g. video upload), sync to cloud
    storage.syncProfileToSupabase(newProfile);
  };

  // --- RENDER FUNCTIONS ---

  if (appState === AppState.LANDING) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#414A37] via-[#5e5845] to-[#FFD580] relative flex flex-col items-center justify-between overflow-hidden">
        {/* Background Image & Heavy Overlay for Mood */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <img 
                src="https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?q=80&w=1000&auto=format&fit=crop" 
                alt="Background" 
                className="w-full h-full object-cover opacity-25 mix-blend-overlay"
            />
            {/* Gradient to ensure top is dark for text, fading to transparent to let orange show at bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#414A37] via-[#414A37]/70 to-transparent"></div>
        </div>

        {/* Top Section: Branding */}
        <div className="relative z-10 flex flex-col items-center w-full mt-16 px-6">
            <div className="animate-fade-in flex flex-col items-center">
                {/* Glowing Om Symbol */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-brahma-gold/20 blur-xl rounded-full"></div>
                    <OmSymbol className="w-16 h-16 text-brahma-gold relative z-10 drop-shadow-[0_0_15px_rgba(153,116,74,0.5)]" />
                </div>

                <h1 className="text-6xl font-serif text-brahma-bg mb-4 tracking-tight text-center drop-shadow-2xl">
                    Brahma Path
                </h1>
                
                <div className="w-12 h-1 bg-gradient-to-r from-transparent via-brahma-gold to-transparent mb-6 opacity-60"></div>

                <p className="text-lg font-serif italic text-white/80 text-center max-w-sm leading-relaxed mb-4">
                    The Sacred 108-Day Journey<br/>to Self-Mastery
                </p>
                
                <p className="text-xs text-brahma-bg/60 text-center max-w-[300px] font-light tracking-wide leading-relaxed">
                    Reclaim your energy, strength, and spiritual power through ancient wisdom.
                </p>
            </div>
        </div>

        {/* Center/Action Section */}
        <div className="relative z-10 w-full max-w-xs flex flex-col items-center gap-6 mb-12 px-6">
             <Button 
                onClick={handleStart} 
                className="w-full bg-brahma-gold/90 hover:bg-brahma-gold text-brahma-bg font-serif tracking-wider text-lg py-5 shadow-[0_0_30px_rgba(153,116,74,0.3)] border border-white/10 rounded-full transition-transform hover:scale-[1.02]"
            >
                Begin Your Journey
             </Button>

             {/* Gau Seva Minimal Badge */}
             <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                 <span className="text-xl opacity-80">🐄</span>
                 <p className="text-brahma-bg/70 text-[10px] uppercase tracking-widest font-medium">
                     Proceeds Support Gau Seva
                 </p>
             </div>
        </div>

        {/* Bottom Section: 108 Box */}
        <div className="relative z-10 w-full pb-10 flex justify-center">
             <div className="text-center">
                <span className="block text-7xl font-serif text-[#4A2C2A] font-bold tracking-tighter opacity-80 drop-shadow-sm leading-none">
                    108
                </span>
                <span className="text-[10px] uppercase tracking-[0.4em] text-[#4A2C2A] font-bold opacity-60">
                    Sacred Days
                </span>
             </div>
        </div>
    </div>
    );
  }

  if (appState === AppState.ONBOARDING) {
    return (
      <div className="min-h-screen bg-brahma-bg flex flex-col p-6 max-w-md mx-auto">
        <div className="flex-1 flex flex-col justify-center">
          <OmSymbol className="w-12 h-12 mb-6 opacity-50 mx-auto" />
          
          {!onboardingAge ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-brahma-dark text-center">Enter your age</h2>
              <input 
                type="number" 
                min="15" 
                max="60"
                className="w-full text-center text-4xl font-bold bg-transparent border-b-2 border-brahma-gold text-brahma-dark focus:outline-none p-4"
                placeholder="21"
                onChange={(e) => {
                  if (e.target.value.length >= 2) setOnboardingAge(e.target.value);
                }}
              />
              <p className="text-center text-brahma-dark/50 text-sm">Minimum age 15 years required.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-brahma-dark">What do you want to overcome?</h2>
              <div className="space-y-3">
                {REASONS.map((r) => (
                  <button 
                    key={r}
                    onClick={() => handleOnboardingComplete(parseInt(onboardingAge), r)}
                    className="w-full text-left p-4 rounded-lg bg-white/50 border border-brahma-dark/10 hover:border-brahma-gold hover:bg-white transition-all text-brahma-dark text-sm font-medium"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-center py-4">
          <div className={`h-2 w-2 rounded-full ${onboardingAge ? 'bg-brahma-gold' : 'bg-brahma-dark/20'}`} />
          <div className={`h-2 w-2 rounded-full ${onboardingAge && onboardingReason ? 'bg-brahma-gold' : 'bg-brahma-dark/20'}`} />
        </div>
      </div>
    );
  }

  if (appState === AppState.COMMITMENT) {
    return (
      <div className="min-h-screen relative bg-gradient-to-b from-[#414A37] via-[#5e5845] to-[#FFD580]">
        {/* Background Image & Heavy Overlay (Fixed so it doesn't scroll) */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <img 
                src="https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?q=80&w=1000&auto=format&fit=crop" 
                alt="Background" 
                className="w-full h-full object-cover opacity-20 mix-blend-overlay"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#414A37] via-[#414A37]/80 to-transparent"></div>
        </div>

        <div className="relative z-10 min-h-screen text-brahma-bg p-6 overflow-y-auto flex flex-col justify-center">
          <div className="max-w-md mx-auto space-y-8 py-8 w-full">
            <div className="text-center space-y-4">
               <div className="w-16 h-16 rounded-full border border-brahma-gold/30 flex items-center justify-center mx-auto bg-brahma-gold/10 backdrop-blur-sm">
                 <OmSymbol className="w-8 h-8 text-brahma-gold opacity-90" />
               </div>
               <h2 className="text-3xl font-serif font-bold text-brahma-bg drop-shadow-md">The Sacred Commitment</h2>
               <p className="text-brahma-bg/80 font-light tracking-wide">108 days that will transform your life forever</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {[
                 { title: "Physical", sub: "Clean Lungs & Body", icon: "💪" },
                 { title: "Mental", sub: "Focus & Clarity", icon: "🧠" },
                 { title: "Spiritual", sub: "Inner Purity", icon: "🕉️" },
                 { title: "Success", sub: "Discipline & Will", icon: "🚀" }
               ].map((b, i) => (
                 <div key={i} className="bg-black/20 p-4 rounded-xl border border-brahma-gold/20 backdrop-blur-md hover:bg-black/30 transition-colors">
                   <div className="text-2xl mb-2 filter drop-shadow-sm">{b.icon}</div>
                   <h3 className="font-bold text-brahma-gold">{b.title}</h3>
                   <p className="text-xs text-brahma-bg/70">{b.sub}</p>
                 </div>
               ))}
            </div>

            <div className="bg-brahma-gold/10 p-6 rounded-xl border border-brahma-gold/30 text-center backdrop-blur-md shadow-sm">
               <p className="font-serif italic text-lg mb-2 text-brahma-bg">"ब्रह्मचर्येण तपसा देवा मृत्युमुपाघ्नत"</p>
               <p className="text-xs text-brahma-bg/70">Through discipline, one conquers even death. - Atharva Veda</p>
            </div>

            <Button onClick={handleCommitment} fullWidth className="py-4 text-lg bg-brahma-gold hover:bg-[#85633e] text-brahma-bg shadow-xl border border-brahma-bg/10">
              I Am Ready • मैं तैयार हूं
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (appState === AppState.AUTH) {
    return (
      <div className="min-h-screen bg-brahma-bg p-6 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-serif font-bold text-brahma-dark">
              {authMode === 'signup' ? 'Begin Journey' : 'Welcome Back'}
            </h2>
            <p className="text-brahma-dark/60 mt-2">Secure your progress forever.</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
                {authError}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-brahma-dark">Email</label>
              <input 
                type="email" 
                required
                className="w-full p-3 bg-brahma-bgDim rounded-lg border border-brahma-dark/10 focus:border-brahma-gold focus:outline-none"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-brahma-dark">Password</label>
              <input 
                type="password" 
                required
                className="w-full p-3 bg-brahma-bgDim rounded-lg border border-brahma-dark/10 focus:border-brahma-gold focus:outline-none"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
            </div>

            <Button type="submit" fullWidth disabled={authLoading}>
              {authLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Please wait...
                </div>
              ) : (
                authMode === 'signup' ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="text-center">
            <button 
              onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
              className="text-brahma-gold text-sm hover:underline"
            >
              {authMode === 'signup' ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (appState === AppState.PAYMENT) {
    return (
      <div className="min-h-screen bg-brahma-dark text-brahma-bg p-6 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-2 text-brahma-bg/50 mb-2">
             <button onClick={() => setAppState(AppState.AUTH)} className="hover:text-brahma-bg">
               <ChevronRight className="w-5 h-5 rotate-180" />
             </button>
             <span>Confirmation</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-bold text-brahma-gold">You Are One Decision Away</h2>
            <p className="text-brahma-bg/70">From becoming the strongest version of yourself.</p>
          </div>

          <div className="bg-white/5 border border-brahma-gold/20 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-brahma-bg border-b border-brahma-bg/10 pb-2">What Awaits You</h3>
            
            <div className="space-y-3">
              {[
                "108 days of guided teachings",
                "Zero Brain Fog",
                "Energy & Vitality",
                "Peace of Mind",
                "Completion Certificate",
                "Support Gau Seva"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-brahma-gold/20 flex items-center justify-center text-brahma-gold">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm text-brahma-bg/80">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-brahma-gold/20 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brahma-gold/10 flex items-center justify-center text-xl grayscale-[0.3]">
              🐄
            </div>
            <div>
              <p className="text-brahma-gold font-medium text-sm">Gau Seva Contribution</p>
              <p className="text-brahma-bg/60 text-xs">Proceeds support cow shelters.</p>
            </div>
          </div>

          <Button onClick={handlePayment} fullWidth className="py-4 text-lg">
            Begin My Journey • ₹10
          </Button>

          <p className="text-center text-xs text-brahma-bg/30 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Secure Payment via Razorpay
          </p>
        </div>
      </div>
    );
  }

  return (
    <Dashboard 
      user={user} 
      onUpdateUser={handleUserUpdate} 
      onLogout={handleLogout}
    />
  );
};

export default App;