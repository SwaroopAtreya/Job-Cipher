import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface AuthUser {
  uid: any;
  name: string;
  photoURL: any;
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    avatar_url?: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check active session
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const transformedUser = user ? {
          name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          photoURL: user.user_metadata?.avatar_url || null,
          id: user.id,
          email: user.email || '',
          user_metadata: user.user_metadata
        } : null;
        setUser(transformedUser);
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setLoading(false);
      }
    };

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const transformedUser = session?.user ? {
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
          photoURL: session.user.user_metadata?.avatar_url || null,
          id: session.user.id,
          email: session.user.email || '',
          user_metadata: session.user.user_metadata
        } : null;
        setUser(transformedUser);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          navigate('/dashboard');
        }
        if (event === 'SIGNED_OUT') {
          navigate('/auth');
        }
      }
    );

    checkUser();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      return false;
    } finally {
      setLoading(false);
    }
    return true;
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      toast({
        title: "Success!",
        description: "Please check your email to verify your account.",
      });
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL returned');
      window.location.href = data.url;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign in with Google",
      });
      return false;
    } finally {
      setLoading(false);
    }
    return true;
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any local user data
      setUser(null);
      
      // Show success message
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
        variant: "default",
      });
      
      // Navigate to auth page
      navigate('/auth');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message || "Failed to sign out. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user
  };
}