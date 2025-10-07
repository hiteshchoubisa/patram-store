"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  isAuthenticated: boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Check if there's a stored customer in localStorage
      const storedCustomer = localStorage.getItem('customer');
      if (storedCustomer) {
        try {
          const customerData = JSON.parse(storedCustomer);
          setCustomer(customerData);
        } catch (e) {
          console.error('Error parsing stored customer:', e);
          localStorage.removeItem('customer');
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Check if user exists in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      console.log('User query result:', { userData, userError });
      
      if (userError || !userData) {
        console.log('User not found or error:', userError);
        return { success: false, error: 'User not found' };
      }
      
      // Simple password comparison (you might want to use proper hashing)
      console.log('Checking password for user:', userData.email);
      console.log('Stored password_hash:', userData.password_hash);
      console.log('Provided password:', password);
      console.log('Password lengths - stored:', userData.password_hash?.length, 'provided:', password?.length);
      console.log('Passwords match (exact):', userData.password_hash === password);
      console.log('Passwords match (trimmed):', userData.password_hash?.trim() === password?.trim());
      
      // Try both exact match and trimmed match
      const exactMatch = userData.password_hash === password;
      const trimmedMatch = userData.password_hash?.trim() === password?.trim();
      
      if (!exactMatch && !trimmedMatch) {
        return { success: false, error: 'Invalid password' };
      }
      
      // Set the customer data and store in localStorage
      setCustomer(userData);
      localStorage.setItem('customer', JSON.stringify(userData));
      return { success: true };
      
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    try {
      setLoading(true);
      
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();
      
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }
      
      // Create new user record
      console.log('Creating user record...');
      const { data: newCustomer, error: createError } = await supabase
        .from('users')
        .insert({
          email: email,
          name: name,
          phone: phone || null,
          role: 'user',
          password_hash: password // Store the actual password
        })
        .select()
        .single();
      
      if (newCustomer && !createError) {
        setCustomer(newCustomer);
        localStorage.setItem('customer', JSON.stringify(newCustomer));
        return { success: true };
      } else {
        console.error('User creation error:', createError);
        return { 
          success: false, 
          error: `Failed to create user profile: ${createError?.message || 'Unknown error'}` 
        };
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clear customer data and localStorage
      setCustomer(null);
      localStorage.removeItem('customer');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    customer,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!customer
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
