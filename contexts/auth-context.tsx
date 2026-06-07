"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  role: Profile["role"] | null
  isAdmin: boolean
  isCommunity: boolean
  isUser: boolean
  isVolunteerVerified: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    if (!error && data) {
      setProfile(data as Profile)
    }
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  useEffect(() => {
    // Check for E2E bypass cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const e2eBypassRole = getCookie('e2e-bypass-auth');
    if (process.env.NODE_ENV === 'development' && e2eBypassRole) {
      const mockUser = {
        id: 'mock-user-id',
        aud: 'authenticated',
        role: 'authenticated',
        email: `${e2eBypassRole}@example.com`,
        user_metadata: { role: e2eBypassRole, full_name: 'Mock ' + e2eBypassRole }
      } as any;

      const mockProfile = {
        id: 'mock-user-id',
        full_name: 'Mock ' + e2eBypassRole,
        role: e2eBypassRole,
        volunteer_status: 'approved'
      } as any;

      setUser(mockUser);
      setProfile(mockProfile);
      setIsLoading(false);
      return;
    }

    // Get initial session — set user dan profile secara atomik agar tidak ada
    // window di mana user sudah ter-set tapi role belum tersedia dari database.
    supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: Session | null } }) => {
      if (session?.user) {
        await fetchProfile(session.user.id)
        setUser(session.user)
      }
      setIsLoading(false)
    })

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          await fetchProfile(session.user.id)
          setUser(session.user)
        } else {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  // Prioritas: database profile (source of truth) → user_metadata (fallback sebelum profile ter-load)
  const role = profile?.role || user?.user_metadata?.role || "user"

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        role,
        isAdmin: role === "admin",
        isCommunity: role === "community",
        isUser: role === "user",
        isVolunteerVerified: profile?.volunteer_status === "approved",
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
