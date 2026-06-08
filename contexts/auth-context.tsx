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
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (error) {
      console.error("[AuthProvider] Gagal memuat profile:", error)
      return null
    }

    return (data as Profile | null) ?? null
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }

    const nextProfile = await loadProfile(user.id)
    setProfile(nextProfile)
  }, [user, loadProfile])

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
      setIsAuthReady(true);
      setIsProfileLoading(false);
      return;
    }

    // Get initial session — set user dan profile secara atomik agar tidak ada
    // window di mana user sudah ter-set tapi role belum tersedia dari database.
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
        setProfile(null)
      }
    }).catch(() => {
      setUser(null)
      setProfile(null)
    }).finally(() => {
      setIsAuthReady(true)
    })

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (!isAuthReady) return

    if (!user?.id) {
      setProfile(null)
      setIsProfileLoading(false)
      return
    }

    let cancelled = false
    setIsProfileLoading(true)

    loadProfile(user.id)
      .then((nextProfile) => {
        if (!cancelled) setProfile(nextProfile)
      })
      .catch((error) => {
        console.error("[AuthProvider] Error saat memuat profile:", error)
        if (!cancelled) setProfile(null)
      })
      .finally(() => {
        if (!cancelled) setIsProfileLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isAuthReady, user?.id, loadProfile])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  // Role hanya berasal dari profile database agar konsisten dengan server guard.
  const isLoading = !isAuthReady || isProfileLoading
  const role = user ? (profile?.role ?? null) : null

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
