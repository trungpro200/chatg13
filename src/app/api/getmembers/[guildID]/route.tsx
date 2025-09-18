import { NextResponse } from "next/server";
import {createClient} from "@/utils/supabase/server"

const supabase = await createClient()

export async function GET(
  req: Request,
  { params }: { params: { guildID: number } }
) {
  const { guildID } = params;

  const guildHasMember = await supabase.from('guild_members')
  .select('user_id')
  .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
  .eq("guild_id", guildID)

  if (!guildHasMember){
    return NextResponse.json("Forbidden", {status : 403})
  }
  

  return NextResponse.json({ guildID });
} 