import { supabase } from "@/lib/supabaseClient";
import { Guild, Invite } from "./types";

/*  GET INVITE  */

export async function getGuildInvite(
  guild: Guild | null
): Promise<Invite | null> {
  if (!guild) return null;

  const { data, error } = await supabase
    .from("guild_invites")
    .select("*")
    .eq("guild_id", guild.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // No invite found
    }
    throw error;
  }

  return data;
}

/*  CREATE INVITE  */

export async function createInvite(
  guild: Guild | null
): Promise<Invite | null> {
  if (!guild) return null;

  const existed = await getGuildInvite(guild);
  if (existed) {
    alert("You already have an invite to this guild.");
    return null;
  }

  const { data, error } = await supabase
    .from("guild_invites")
    .insert([{ guild_id: guild.id }])
    .select()
    .single();

  if (error) {
    console.error("Error creating invite:", error);
    return null;
  }

  return data;
}

/* JOIN GUILD */

export async function joinGuild(inviteId: string): Promise<number> {
  // Lấy user hiện tại
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not logged in");
  }

  // Lấy guild_id từ invite
  const { data: guild_id, error } = await supabase.rpc("get_guild_id", {
    p_invite_code: inviteId,
  });

  if (error || !guild_id) {
    throw new Error("Invalid invite code");
  }

  // Join guild
  const { error: joinError } = await supabase
    .from("guild_members")
    .insert({
      guild_id,
      user_id: user.id,
      join_method: inviteId,
    });

  if (joinError) {
    throw joinError;
  }

  return guild_id;
}