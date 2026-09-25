"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { StudyGroup, StudyGroupMessage } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export interface GroupWithMeta {
  group: StudyGroup;
  member_count: number;
  is_member: boolean;
  is_owner: boolean;
}

export interface CommunityFormState {
  ok: boolean;
  message: string;
}

export interface ChatState {
  ok: boolean;
  error: string | null;
  message: StudyGroupMessage | null;
}

type GroupCountRow = {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  members: { count: number }[];
};

type ProfileJoin =
  | { full_name: string | null }
  | { full_name: string | null }[]
  | null;

type MemberRow = {
  user_id: string;
  profiles: ProfileJoin;
};

type MessageRow = {
  id: string;
  group_id: string;
  user_id: string;
  user_name: string | null;
  content: string;
  created_at: string;
  profiles: ProfileJoin;
};

function fullNameOf(profiles: ProfileJoin): string | null {
  if (Array.isArray(profiles)) {
    return profiles[0]?.full_name ?? null;
  }
  return profiles?.full_name ?? null;
}

export interface GroupMember {
  user_id: string;
  full_name: string | null;
}

async function currentUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function getGroups(): Promise<GroupWithMeta[]> {
  try {
    const userId = await currentUserId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("study_groups")
      .select(
        "id, name, description, owner_id, created_at, members:study_group_members(count)"
      )
      .order("created_at", { ascending: false });
    if (error || !data) return [];

    const rows = data as GroupCountRow[];

    const memberSet = new Set<string>();
    if (userId) {
      const { data: memberRows } = await supabase
        .from("study_group_members")
        .select("group_id")
        .eq("user_id", userId);
      for (const row of memberRows ?? []) {
        memberSet.add((row as { group_id: string }).group_id);
      }
    }

    return rows.map((row) => ({
      group: {
        id: row.id,
        name: row.name,
        description: row.description,
        owner_id: row.owner_id,
        created_at: row.created_at,
      },
      member_count: row.members?.[0]?.count ?? 0,
      is_member: memberSet.has(row.id),
      is_owner: userId ? row.owner_id === userId : false,
    }));
  } catch {
    return [];
  }
}

export async function createGroup(
  _prevState: CommunityFormState,
  formData: FormData
): Promise<CommunityFormState> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const description =
    (formData.get("description") as string | null)?.trim() ?? "";

  if (!name) {
    return { ok: false, message: "Group name is required." };
  }
  if (name.length > 60) {
    return {
      ok: false,
      message: "Group name must be 60 characters or fewer.",
    };
  }
  if (description.length > 200) {
    return {
      ok: false,
      message: "Description must be 200 characters or fewer.",
    };
  }

  try {
    const userId = await currentUserId();
    if (!userId) {
      return { ok: false, message: "You must be logged in to create a group." };
    }
    const supabase = await createClient();

    const { data: group, error } = await supabase
      .from("study_groups")
      .insert({ name, description: description || null, owner_id: userId })
      .select("id")
      .single();
    if (error || !group) {
      return { ok: false, message: "Could not create the group. Try again." };
    }

    const { error: memberError } = await supabase
      .from("study_group_members")
      .insert({ group_id: group.id as string, user_id: userId });
    if (memberError) {
      return { ok: false, message: "Group created but joining failed." };
    }

    revalidatePath("/community");
    return { ok: true, message: "Group created." };
  } catch {
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

export async function joinGroup(groupId: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) {
    redirect("/login");
  }
  const supabase = await createClient();
  await supabase
    .from("study_group_members")
    .insert({ group_id: groupId, user_id: userId as string });
  revalidatePath("/community");
}

export async function leaveGroup(groupId: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) {
    redirect("/login");
  }
  const supabase = await createClient();
  const { data: group } = await supabase
    .from("study_groups")
    .select("owner_id")
    .eq("id", groupId)
    .maybeSingle();
  if (group && (group as { owner_id: string }).owner_id === userId) {
    return;
  }
  await supabase
    .from("study_group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId as string);
  revalidatePath("/community");
}

export async function getGroup(groupId: string): Promise<StudyGroup | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("study_groups")
      .select("id, name, description, owner_id, created_at")
      .eq("id", groupId)
      .maybeSingle();
    if (error || !data) return null;
    return data as StudyGroup;
  } catch {
    return null;
  }
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("study_group_members")
      .select("user_id, profiles:profiles(full_name)")
      .eq("group_id", groupId)
      .order("joined_at", { ascending: true });
    return (data as unknown as MemberRow[] | null ?? []).map((row) => ({
      user_id: row.user_id,
      full_name: fullNameOf(row.profiles),
    }));
  } catch {
    return [];
  }
}

export async function isGroupMember(groupId: string): Promise<boolean> {
  try {
    const userId = await currentUserId();
    if (!userId) return false;
    const supabase = await createClient();
    const { data } = await supabase
      .from("study_group_members")
      .select("group_id")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}

export async function getGroupMessages(
  groupId: string
): Promise<StudyGroupMessage[]> {
  const userId = await currentUserId();
  if (!userId) {
    throw new Error("You must be logged in to view group messages.");
  }
  const member = await isGroupMember(groupId);
  if (!member) {
    throw new Error("You must be a member of this group to view its messages.");
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_group_messages")
    .select(
      "id, group_id, user_id, user_name, content, created_at, profiles:profiles(full_name)"
    )
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data as unknown as MessageRow[] ?? []).map((row) => ({
    id: row.id,
    group_id: row.group_id,
    user_id: row.user_id,
    user_name: row.user_name ?? fullNameOf(row.profiles) ?? null,
    content: row.content,
    created_at: row.created_at,
  }));
}

export async function sendGroupMessage(
  groupId: string,
  _prevState: ChatState,
  formData: FormData
): Promise<ChatState> {
  void _prevState;
  const content = (formData.get("content") as string | null)?.trim() ?? "";

  if (!content) {
    return { ok: false, error: "Message cannot be empty.", message: null };
  }
  if (content.length > 1000) {
    return {
      ok: false,
      error: "Message must be 1000 characters or fewer.",
      message: null,
    };
  }

  try {
    const userId = await currentUserId();
    if (!userId) {
      return { ok: false, error: "You must be logged in.", message: null };
    }
    const supabase = await createClient();

    const member = await isGroupMember(groupId);
    if (!member) {
      return {
        ok: false,
        error: "You must be a member of this group to send messages.",
        message: null,
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();

    const { data: message, error } = await supabase
      .from("study_group_messages")
      .insert({
        group_id: groupId,
        user_id: userId,
        user_name: (profile as { full_name: string | null } | null)?.full_name ?? null,
        content,
      })
      .select("id, group_id, user_id, user_name, content, created_at")
      .single();
    if (error || !message) {
      return { ok: false, error: "Could not send the message. Try again.", message: null };
    }

    revalidatePath("/community");
    revalidatePath(`/community/${groupId}`);
    return { ok: true, error: null, message: message as StudyGroupMessage };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again.", message: null };
  }
}
