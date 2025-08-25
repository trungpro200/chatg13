import { supabase } from "@/lib/supabaseClient";

async function checkOwner(guild_id: number) {
  const { data: guild, error: guildError } = await supabase
    .from("guilds")
    .select("owner_id")
    .eq("id", guild_id)
    .maybeSingle();
  if (guildError) {
    console.error("Error fetching guild owner:", guildError);
    return null;
  }

  if (!guild) {
    console.error("Guild not found:", guild_id);
    return null;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error fetching current user:", userError);
    return null;
  }
  const user = userData?.user;

  console.log("checkOwner => guild_id:", guild_id, "owner_id:", guild?.owner_id, "current_user:", user?.id);

  return user.id === guild.owner_id;
}

async function renameGuild(guild_id: number, newName: string) {
  const isOwner = await checkOwner(guild_id);

  if (isOwner === null) {
    console.error("Could not verify ownership");
    return null;
  }

  if (!isOwner) {
    console.error("User is not the owner of the guild");
    return null;
  }

  const { data, error } = await supabase
    .from("guilds")
    .update({ name: newName })
    .eq("id", guild_id)
    .select()
    .maybeSingle();
  if (error) {
    console.error("Error renaming guild:", error.message);
    return null;
  }
  return data;
}

async function leaveGuild(guild_id: number) {
  const isOwner = await checkOwner(guild_id);
  if (isOwner) {
    console.error("User is the owner of the guild");
    return false;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return false;

  const { error } = await supabase.from("guild_members").delete().eq("guild_id", guild_id).eq("user_id", session.user.id);
  if (error) {
    console.error("Error leaving guild:", error);
    return false;
  }
  return true;
}

export { checkOwner, renameGuild, leaveGuild };