"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "CREATOR" | "BRAND" | "AGENCY";
  instagramHandle: string | null;
  cnicNumber: string | null;
  agencyName: string | null;
  agencyAddress: string | null;
  countryCode?: string | null;
  taxId?: string | null;
  designation: string | null;
  isVerified: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await supabase.auth.signOut();
      setUser(null);
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        console.log("=== ProtectedRoute checkAuth start ===");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Client session found:", session ? `Yes (User ID: ${session.user.id})` : "No session");
        
        if (!session) {
          console.warn("No session on client, redirecting to /");
          if (active) {
            setUser(null);
            setLoading(false);
            router.push("/");
          }
          return;
        }

        // Fetch custom user profile from Database via API
        console.log("Fetching /api/profile...");
        const res = await fetch("/api/profile");
        console.log("API profile fetch status:", res.status, res.statusText);
        
        if (res.ok) {
          const data = await res.json();
          console.log("API profile fetch success, profile data:", data.profile);
          if (active) {
            setUser(data.profile);
          }
        } else {
          // If profile fetch fails, session might be invalid or sync issue
          const errData = await res.json().catch(() => ({}));
          console.error("API profile fetch failed, error response:", errData);
          if (active) {
            setUser(null);
            router.push("/");
          }
        }
      } catch (err) {
        console.error("Auth check failed with exception:", err);
        if (active) {
          setUser(null);
          router.push("/");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Subscribe to auth state updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        if (active) {
          setUser(null);
          router.push("/");
        }
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-gradient flex items-center justify-center flex-col gap-3">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider text-black animate-pulse">
          Securing Session...
        </span>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect shortly
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a ProtectedRoute context provider");
  }
  return context;
};
