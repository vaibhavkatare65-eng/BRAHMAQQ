import { UserProfile, JournalEntry } from '../types';
import { supabase } from './supabase';

const STORAGE_KEY = 'brahma_path_user';
const JOURNAL_KEY = 'brahma_path_journal';

const INITIAL_STATE: UserProfile = {
  isAuthenticated: false,
  hasPaid: false,
  startDate: null,
  lastCompletedDay: 0,
  lastCompletionTime: null,
  videoSubmittedToday: false,
  addictions: [],
};

export const storage = {
  getUser: (): UserProfile => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_STATE;
    } catch {
      return INITIAL_STATE;
    }
  },

  updateUser: (updates: Partial<UserProfile>): UserProfile => {
    const current = storage.getUser();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  saveJournal: (entry: JournalEntry) => {
    const existingStr = localStorage.getItem(JOURNAL_KEY);
    const existing: JournalEntry[] = existingStr ? JSON.parse(existingStr) : [];
    
    // Filter out if entry for this day already exists to overwrite
    const filtered = existing.filter(e => e.day !== entry.day);
    filtered.push(entry);
    
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(filtered));
  },

  getJournal: (): JournalEntry[] => {
    const str = localStorage.getItem(JOURNAL_KEY);
    return str ? JSON.parse(str) : [];
  },

  checkDailyReset: (user: UserProfile): UserProfile => {
    if (!user.lastCompletionTime) return user;

    const now = Date.now();
    
    // Check if 24 hours have passed
    const hoursSince = (now - user.lastCompletionTime) / (1000 * 60 * 60);
    
    if (hoursSince >= 24) {
      // It has been 24 hours, reset daily flags if needed
      if (user.videoSubmittedToday) {
         return storage.updateUser({ videoSubmittedToday: false });
      }
    }
    return user;
  },

  // --- SUPABASE SYNC METHODS ---

  syncProfileToSupabase: async (user: UserProfile) => {
    if (!user.id) return;

    try {
      // Map frontend camelCase to database snake_case if your table uses snake_case
      // Assuming a 'profiles' table exists
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          age: user.age,
          addictions: user.addictions,
          reason: user.reason,
          has_paid: user.hasPaid,
          start_date: user.startDate ? new Date(user.startDate).toISOString() : null,
          last_completed_day: user.lastCompletedDay,
          last_completion_time: user.lastCompletionTime ? new Date(user.lastCompletionTime).toISOString() : null,
          video_submitted_today: user.videoSubmittedToday,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        // Gracefully handle missing table - do not spam console with errors
        if (error.message?.includes('Could not find the table') || error.code === '42P01') {
             console.warn("Supabase Sync Warning: 'profiles' table missing in database. Data saved locally only.");
             return;
        }
        console.error('Error syncing to Supabase:', error.message || JSON.stringify(error));
      } else {
        console.log('Successfully synced profile to Supabase');
      }
    } catch (e) {
      console.error('Sync failed:', e);
    }
  },

  loadProfileFromSupabase: async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Ignore "Row not found" errors (PGRST116) as it just means new user
        if (error.code === 'PGRST116') {
            return null;
        }
        // Gracefully handle missing table
        if (error.message?.includes('Could not find the table') || error.code === '42P01') {
             console.warn("Supabase Load Warning: 'profiles' table missing. Using local data.");
             return null;
        }
        console.error('Error loading from Supabase:', error.message || JSON.stringify(error));
        return null;
      }

      if (!data) return null;

      // Merge with local state structure
      const localUser = storage.getUser();
      return {
        ...localUser,
        id: userId,
        age: data.age,
        addictions: data.addictions || [],
        reason: data.reason,
        isAuthenticated: true,
        hasPaid: data.has_paid || false,
        startDate: data.start_date ? new Date(data.start_date).getTime() : null,
        lastCompletedDay: data.last_completed_day || 0,
        lastCompletionTime: data.last_completion_time ? new Date(data.last_completion_time).getTime() : null,
        videoSubmittedToday: data.video_submitted_today || false,
      };
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  }
};