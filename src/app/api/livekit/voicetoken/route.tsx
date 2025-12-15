"use server";

import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

async function checkChannelAccess(
  room: string,
  identity: string,
  supabase: SupabaseClient
) {
  // Placeholder for access control logic
  // You can implement your own logic to check if the user has access to the room
  console.log("Checking access for user", identity, "to room", room);

  const server_id = await supabase
    .from("channels")
    .select("guild_id")
    .eq("id", room)
    .single()
    .then((res) => res.data?.guild_id);
  const is_member = await supabase
    .from("guild_members")
    .select("guild_id, user_id")
    .eq("guild_id", server_id)
    .eq("user_id", identity)
    .single();

  console.log(server_id);
  console.log("Membership check result:", is_member);
  return is_member.data != null;
}

export async function POST(req: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const identity = user.id;
    const body = await req.json();
    // Extract parameters
    const { room } = body;
    const name = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", identity)
      .single()
      .then((res) => res.data?.nickname);
    //Room : string, identity: string, name?: string
    //Room is the channel id
    //Identity is the user id

    if (!room || !identity) {
      return NextResponse.json(
        { error: "Missing room or identity" },
        { status: 400 }
      );
    }

    if (!(await checkChannelAccess(room, identity, supabase))) {
      return NextResponse.json(
        { error: "Access denied to the room" },
        { status: 403 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY!;
    const apiSecret = process.env.LIVEKIT_API_SECRET!;

    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      name: name ?? identity,
      ttl: 60, // 1 minutes (low time for testing purposes)
    });

    token.addGrant({
      roomJoin: true,
      room: room as string,
      canPublish: true,
      canSubscribe: true,
    });
    
    const jwt = await token.toJwt();

    return NextResponse.json(
      {
        token: jwt,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("LiveKit token error:", err);
    return NextResponse.json(
      { error: "Failed to create token" },
      { status: 500 }
    );
  }
}
