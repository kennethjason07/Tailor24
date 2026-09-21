import { supabase } from '../supabase';

export const AuthService = {
  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      throw error;
    }

    // Fetch user profile to get role
    const profile = await this.getProfile(data.user.id, data.user);
    return {
      session: data.session,
      user: data.user,
      profile,
      role: profile?.role || 'customer',
    };
  },

  /**
   * Sign up a new user (admin or customer)
   */
  async signUp(email, password, metadata = {}) {
    const cleanEmail = email.trim().toLowerCase();
    const role = metadata.role || 'customer';

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: metadata.full_name || '',
          mobile_number: metadata.mobile_number || '',
          role,
        },
      },
    });

    if (error) {
      throw error;
    }

    // Try to ensure profile exists
    if (data.user) {
      try {
        await this.upsertProfile(data.user.id, {
          email: cleanEmail,
          full_name: metadata.full_name || '',
          mobile_number: metadata.mobile_number || '',
          role,
        });
      } catch (profileErr) {
        console.warn('Profile upsert fallback warning:', profileErr.message);
      }
    }

    return data;
  },

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('Supabase sign out error:', error.message);
    }
    return true;
  },

  /**
   * Get user profile from public.profiles table or user metadata
   */
  async getProfile(userId, fallbackUser = null) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.warn('Profiles table lookup note:', e.message);
    }

    // Fallback to user_metadata if profiles table is not yet created or queried
    const meta = fallbackUser?.user_metadata || {};
    return {
      id: userId,
      email: fallbackUser?.email || '',
      full_name: meta.full_name || 'User',
      mobile_number: meta.mobile_number || '',
      role: meta.role || (fallbackUser?.email?.includes('admin') ? 'admin' : 'customer'),
    };
  },

  /**
   * Upsert profile manually
   */
  async upsertProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Direct profile upsert failed:', err.message);
      return null;
    }
  },

  /**
   * Get active session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
};
