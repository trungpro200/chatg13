import { supabase } from "../../lib/supabaseClient";

export type Profile = {
  id: string;
  nickname: string | null;
  avatar_URL: string;
  email: string;
};

export async function getProfileById(userId: string): Promise<Profile | null> {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname, avatar_URL, email")
    .eq("id", userId)
    .single();
  if (error) {
    console.error("getProfileById error:", error);
    return null;
  }
  return data as Profile;
}
