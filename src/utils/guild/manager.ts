import { supabase } from "@/lib/supabaseClient";

/* ================= CHECK OWNER ================= */

async function checkOwner(guild_id: number): Promise<boolean | null> {
  const { data: guild, error: guildError } = await supabase
    .from("guilds")
    .select("owner_id")
    .eq("id", guild_id)
    .maybeSingle();

  if (guildError || !guild) {
    console.error("Guild not found or error:", guildError);
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User not authenticated");
    return null;
  }

  return user.id === guild.owner_id;
}

/* ================= RENAME GUILD ================= */

async function renameGuild(
  guild_id: number,
  newName: string
) {
  const isOwner = await checkOwner(guild_id);

  if (isOwner !== true) {
    console.error("Rename denied: not owner");
    return null;
  }

  const { data, error } = await supabase
    .from("guilds")
    .update({ name: newName })
    .eq("id", guild_id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Rename error:", error.message);
    return null;
  }

  return data;
}

/* ================= LEAVE GUILD ================= */

async function leaveGuild(guild_id: number): Promise<boolean> {
  const isOwner = await checkOwner(guild_id);

  if (isOwner === null) return false; // ❗ an toàn
  if (isOwner) return false;          // ❌ owner không được rời

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { error } = await supabase
    .from("guild_members")
    .delete()
    .eq("guild_id", guild_id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Leave guild error:", error);
    return false;
  }

  return true;
}

export { checkOwner, renameGuild, leaveGuild };
