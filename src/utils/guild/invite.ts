import { supabase } from "@/lib/supabaseClient";
import { Guild, Invite } from "./types";

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
    // Handle "no rows" error specifically
    if (error.code === "PGRST116") {
      console.warn("No invite found");
      return null;
    }
    // Re-throw or handle other errors
    throw error;
  }

  return data;
}

export async function createInvite(
  guild: Guild | null
): Promise<Invite | null> {
  //   alert("Creating invite..." + guild?.name);
  if (!guild) return null;
  if (await getGuildInvite(guild)) {
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

export async function joinGuild(inviteId: string) {
  const { data: guild_id, error } = await supabase.rpc("get_guild_id", {
    p_invite_code: inviteId,
  });

  // console.log("Guild ID from invite:", guild_id);

  if (error) {
    console.error("Error fetching guild id:", error);
    return;
  }

  // Successfully retrieved guild ID
  try {
    await supabase.from("guild_members").insert({
      guild_id: guild_id,
      join_method: inviteId,
    });
  } catch (error) {
    console.error("Error adding user to guild:", error);
  }
}
