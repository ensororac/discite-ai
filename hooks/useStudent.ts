"use client";

import { useState, useEffect, useCallback } from "react";
import { getLevelInfo, type LevelInfo } from "@/components/XPBar";

export interface StudentState {
  studentId: string | null;
  displayName: string | null;
  xp: number;
  previousXp: number;
  badges: string[];
  level: LevelInfo;
  isLoggedIn: boolean;
  isLoading: boolean;
  loginError: string | null;
}

export interface UseStudentReturn extends StudentState {
  login: (classCode: string, pin: string, displayName?: string) => Promise<void>;
  logout: () => void;
  earnXP: (module: string, yearBand: string, activity: string, amount: number) => Promise<string[]>;
}

const STORAGE_KEY = "discite_student";

interface StoredStudent {
  studentId: string;
  displayName: string | null;
  xp: number;
  badges: string[];
}

function loadStored(): StoredStudent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredStudent;
  } catch {
    return null;
  }
}

function saveStored(data: StoredStudent) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

async function apiInit(classCode: string, pin: string, displayName?: string): Promise<{ studentId: string; xp: number; badges: string[] }> {
  try {
    const res = await fetch("https://discite-api.ensororac.workers.dev/progress/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classCode, pin, displayName }),
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json() as { studentId: string; xp: number; badges: string[] };
    return data;
  } catch {
    // Graceful fallback: generate local ID
    const studentId = `${classCode}:${pin}`;
    return { studentId, xp: 0, badges: [] };
  }
}

async function apiEarn(studentId: string, module: string, yearBand: string, activity: string, xp: number): Promise<{ totalXp: number; newBadges: string[] }> {
  try {
    const res = await fetch("https://discite-api.ensororac.workers.dev/progress/earn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, module, yearBand, activity, xp }),
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json() as { totalXp: number; newBadges: string[] };
    return data;
  } catch {
    // Fallback: return without server sync
    return { totalXp: 0, newBadges: [] };
  }
}

export function useStudent(): UseStudentReturn {
  const [state, setState] = useState<StudentState>(() => {
    const stored = loadStored();
    if (stored) {
      return {
        studentId: stored.studentId,
        displayName: stored.displayName,
        xp: stored.xp,
        previousXp: stored.xp,
        badges: stored.badges,
        level: getLevelInfo(stored.xp),
        isLoggedIn: true,
        isLoading: false,
        loginError: null,
      };
    }
    return {
      studentId: null,
      displayName: null,
      xp: 0,
      previousXp: 0,
      badges: [],
      level: getLevelInfo(0),
      isLoggedIn: false,
      isLoading: false,
      loginError: null,
    };
  });

  // Re-hydrate on mount (SSR safety)
  useEffect(() => {
    const stored = loadStored();
    if (stored && !state.isLoggedIn) {
      setState((s) => ({
        ...s,
        studentId: stored.studentId,
        displayName: stored.displayName,
        xp: stored.xp,
        previousXp: stored.xp,
        badges: stored.badges,
        level: getLevelInfo(stored.xp),
        isLoggedIn: true,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (classCode: string, pin: string, displayName?: string) => {
    setState((s) => ({ ...s, isLoading: true, loginError: null }));
    try {
      const result = await apiInit(classCode, pin, displayName);
      const stored: StoredStudent = {
        studentId: result.studentId,
        displayName: displayName ?? null,
        xp: result.xp,
        badges: result.badges,
      };
      saveStored(stored);
      setState((s) => ({
        ...s,
        studentId: result.studentId,
        displayName: displayName ?? null,
        xp: result.xp,
        previousXp: result.xp,
        badges: result.badges,
        level: getLevelInfo(result.xp),
        isLoggedIn: true,
        isLoading: false,
        loginError: null,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        loginError: err instanceof Error ? err.message : "Login failed",
      }));
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    setState({
      studentId: null,
      displayName: null,
      xp: 0,
      previousXp: 0,
      badges: [],
      level: getLevelInfo(0),
      isLoggedIn: false,
      isLoading: false,
      loginError: null,
    });
  }, []);

  const earnXP = useCallback(async (module: string, yearBand: string, activity: string, amount: number): Promise<string[]> => {
    if (!state.studentId) return [];

    // Optimistically update local state
    const newXp = state.xp + amount;
    setState((s) => ({
      ...s,
      previousXp: s.xp,
      xp: newXp,
      level: getLevelInfo(newXp),
    }));

    // Sync to backend
    const result = await apiEarn(state.studentId, module, yearBand, activity, amount);

    // Use server total if available (avoid drift)
    const finalXp = result.totalXp > 0 ? result.totalXp : newXp;
    const newBadges = result.newBadges ?? [];

    setState((s) => {
      const merged = [...new Set([...s.badges, ...newBadges])];
      const stored: StoredStudent = {
        studentId: s.studentId!,
        displayName: s.displayName,
        xp: finalXp,
        badges: merged,
      };
      saveStored(stored);
      return {
        ...s,
        xp: finalXp,
        badges: merged,
        level: getLevelInfo(finalXp),
      };
    });

    return newBadges;
  }, [state.studentId, state.xp]);

  return { ...state, login, logout, earnXP };
}
