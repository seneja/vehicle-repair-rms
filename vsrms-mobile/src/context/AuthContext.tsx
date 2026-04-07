import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

// The auth context shape
interface AuthContextType {
  signIn: (email: string, password: string, persona?: string) => Promise<void>;
  signOut: () => Promise<void>;
  user: any | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// This hook can be used to access the user info.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app startup
    const checkUser = async () => {
      try {
        const token = await SecureStore.getItemAsync('asgardeo_access_token');
        const userData = await SecureStore.getItemAsync('asgardeo_user_info');
        
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Failed to restore session', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  const signIn = async (email: string, password: string, persona?: string) => {
    setIsLoading(true);
    try {
      const orgName = process.env.EXPO_PUBLIC_ASGARDEO_ORG_NAME;
      const clientId = process.env.EXPO_PUBLIC_ASGARDEO_CLIENT_ID;
      
      if (!orgName || !clientId) {
        throw new Error('Asgardeo configuration (org name & client id) is missing in .env');
      }

      const tokenEndpoint = `https://api.asgardeo.io/t/${orgName}/oauth2/token`;

      // 1. Get Token using Resource Owner Password Credentials (ROPC)
      // NOTE: This requires Password Grant to be enabled in Asgardeo for the app!
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('username', email);
      params.append('password', password);
      // If persona is passed and needed for custom scopes, etc.
      params.append('scope', 'openid profile email');
      params.append('client_id', clientId);

      const tokenRes = await axios.post(tokenEndpoint, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, id_token } = tokenRes.data;

      // Ensure tokens are received
      if (!access_token) {
         throw new Error('Authentication failed: No access token returned');
      }

      // 2. We can decode the JWT manually or fetch user info using the access_token
      // (Optional) For now, we will store a dummy user object since decoding JWT requires
      // a specific library (jwt-decode) which we might not have installed on mobile.
      const userInfoEndpoint = `https://api.asgardeo.io/t/${orgName}/oauth2/userinfo`;
      let userInfo = { email, persona };
      
      try {
        const userRes = await axios.get(userInfoEndpoint, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        userInfo = { ...userInfo, ...userRes.data };
      } catch (err) {
        console.warn('Could not fetch user info from Asgardeo, using default.', err);
      }

      // Store tokens and user info securely
      await SecureStore.setItemAsync('asgardeo_access_token', access_token);
      if (id_token) await SecureStore.setItemAsync('asgardeo_id_token', id_token);
      await SecureStore.setItemAsync('asgardeo_user_info', JSON.stringify(userInfo));

      // Sync user profile with the backend
      try {
        const backendBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        await axios.post(`${backendBaseUrl}/auth/sync-profile`, {}, {
          headers: { Authorization: `Bearer ${access_token}` }
        });
      } catch (syncErr) {
        console.warn('Could not sync user profile with backend.', syncErr);
      }

      setUser(userInfo);
    } catch (error: any) {
      console.error('Sign In Error:', error?.response?.data || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync('asgardeo_access_token');
      await SecureStore.deleteItemAsync('asgardeo_id_token');
      await SecureStore.deleteItemAsync('asgardeo_user_info');
      setUser(null);
    } catch (error) {
      console.error('Sign out error', error);
    }
  };

  return (
    <AuthContext.Provider value={{ signIn, signOut, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
