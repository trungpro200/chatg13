import { supabase } from "@/lib/supabaseClient";

async function checkOwner(guild_id: number) {
  const { data, error } = await supabase
    .from("guilds")
    .select("owner_id")
    .eq("id", guild_id)
    .single();
  if (error) {
    console.error("Error fetching guild owner:", error);
    return null;
  }
  return (await supabase.auth.getUser()).data.user?.id === data?.owner_id;
}

async function renameGuild(guild_id: number, newName: string) {
  const isOwner = await checkOwner(guild_id);
  if (!isOwner) {
    console.error("User is not the owner of the guild");
    return false;
  }

  const { error } = await supabase
    .from("guilds")
    .update({ name: newName })
    .eq("id", guild_id);
  if (error) {
    console.error("Error renaming guild:", error);
    return false;
  }
  return true;
}

async function leaveGuild(guild_id: number) {
  const isOwner = await checkOwner(guild_id);
  if (isOwner) {
    console.error("User is the owner of the guild");
    return false;
  }

  const { error } = await supabase.from("guilds").delete().eq("id", guild_id);
  if (error) {
    console.error("Error leaving guild:", error);
    return false;
  }
  return true;
}

export { checkOwner, renameGuild, leaveGuild };