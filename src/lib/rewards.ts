"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { BADGES, XP_RULES, levelFromXp } from "@/lib/data";
import type { Badge, RewardType } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export interface CheckInState {
  ok: boolean;
  message: string;
  already: boolean;
  xpGranted: number;
  streak: number;
  badges: { key: string; name: string; icon: string }[];
}

export interface RewardsState {
  profile: {
    xp: number;
    coins: number;
    level: number;
    current_streak_days: number;
    longest_streak_days: number;
    last_active_day: string | null;
  } | null;
  earned: { badge_key: string; earned_at: string }[];
  transactions: { id: string; amount: number; reason: string; created_at: string }[];
  badges: Badge[];
}

function dayString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function yesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayString(d);
}

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getRewardsState(): Promise<RewardsState> {
  const empty = {
    profile: null,
    earned: [],
    transactions: [],
    badges: BADGES,
  };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return empty;

    const [profileRes, earnedRes, txRes, badgesRes] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "xp, coins, level, current_streak_days, longest_streak_days, last_active_day"
        )
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("user_badges")
        .select("badge_key, earned_at")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false }),
      supabase
        .from("xp_transactions")
        .select("id, amount, reason, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("badges")
        .select("id, key, name, description, icon, xp_required, criteria"),
    ]);

    return {
      profile: profileRes.data ?? null,
      earned: earnedRes.data ?? [],
      transactions: txRes.data ?? [],
      badges: badgesRes.data && badgesRes.data.length > 0 ? badgesRes.data : BADGES,
    };
  } catch {
    return empty;
  }
}

export async function dailyCheckIn(
  _prevState: CheckInState,
  _formData: FormData
): Promise<CheckInState> {
  void _prevState;
  void _formData;
  const empty = {
    ok: false,
    message: "",
    already: false,
    xpGranted: 0,
    streak: 0,
    badges: [],
  };
  try {
    const userId = await currentUserId();
    if (!userId) {
      return { ...empty, message: "You must be logged in to check in." };
    }
    const supabase = await createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "xp, coins, level, current_streak_days, longest_streak_days, last_active_day"
      )
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      return { ...empty, message: "Profile not found. Try again." };
    }

    const today = dayString(new Date());
    if (profile.last_active_day === today) {
      return {
        ok: true,
        message: "You already checked in today. Come back tomorrow!",
        already: true,
        xpGranted: 0,
        streak: profile.current_streak_days,
        badges: [],
      };
    }

    const newStreak =
      profile.last_active_day === yesterdayString()
        ? profile.current_streak_days + 1
        : 1;
    const newXp = profile.xp + XP_RULES.daily_check_in;
    const newLevel = levelFromXp(newXp);

    const [{ error: profileError }, { error: txError }] = await Promise.all([
      supabase
        .from("profiles")
        .update({
          xp: newXp,
          level: newLevel,
          current_streak_days: newStreak,
          longest_streak_days: Math.max(
            profile.longest_streak_days,
            newStreak
          ),
          last_active_day: today,
        })
        .eq("id", userId),
      supabase.from("xp_transactions").insert({
        user_id: userId,
        amount: XP_RULES.daily_check_in,
        reason: "Daily check-in",
      }),
    ]);

    if (profileError || txError) {
      return { ...empty, message: "Could not record your check-in. Try again." };
    }

    const { data: earnedRows } = await supabase
      .from("user_badges")
      .select("badge_key")
      .eq("user_id", userId);
    const earnedSet = new Set((earnedRows ?? []).map((row) => row.badge_key));

    const toInsert: { user_id: string; badge_key: string; earned_at: string }[] = [];
    const grantedBadges: { key: string; name: string; icon: string }[] = [];

    for (const badge of BADGES) {
      let eligible = false;
      if (badge.xp_required != null) {
        eligible = newXp >= badge.xp_required;
      } else if (badge.key === "streak_3") {
        eligible = newStreak >= 3;
      } else if (badge.key === "streak_7") {
        eligible = newStreak >= 7;
      }
      if (eligible && !earnedSet.has(badge.key)) {
        toInsert.push({
          user_id: userId,
          badge_key: badge.key,
          earned_at: new Date().toISOString(),
        });
        grantedBadges.push({ key: badge.key, name: badge.name, icon: badge.icon });
      }
    }

    if (toInsert.length > 0) {
      await supabase.from("user_badges").insert(toInsert);
    }

    revalidatePath("/rewards");
    revalidatePath("/dashboard");

    return {
      ok: true,
      message: `+${XP_RULES.daily_check_in} XP earned. Your streak is now ${newStreak} day${
        newStreak === 1 ? "" : "s"
      }.`,
      already: false,
      xpGranted: XP_RULES.daily_check_in,
      streak: newStreak,
      badges: grantedBadges,
    };
  } catch {
    return { ...empty, message: "Something went wrong. Please try again." };
  }
}

export async function grantReward(
  type: RewardType,
  amount: number,
  reason: string
): Promise<{ ok: boolean; type?: RewardType; amount?: number; reason?: string }> {
  try {
    const userId = await currentUserId();
    if (!userId) return { ok: false };
    const supabase = await createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("xp, coins, level")
      .eq("id", userId)
      .maybeSingle();
    if (!profile) return { ok: false };

    const isXp = type === "xp";
    const nextXp = isXp ? profile.xp + amount : profile.xp;
    const nextCoins = isXp ? profile.coins : profile.coins + amount;

    const { error } = await supabase
      .from("profiles")
      .update({ xp: nextXp, coins: nextCoins, level: levelFromXp(nextXp) })
      .eq("id", userId);
    if (error) return { ok: false };

    const { error: txError } = await supabase
      .from("xp_transactions")
      .insert({ user_id: userId, amount, reason });
    if (txError) return { ok: false };

    revalidatePath("/rewards");
    revalidatePath("/dashboard");

    return { ok: true, type, amount, reason };
  } catch {
    return { ok: false };
  }
}

export async function logout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}
  redirect("/");
}
