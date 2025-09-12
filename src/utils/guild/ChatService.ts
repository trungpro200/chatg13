import { supabase } from "@/lib/supabaseClient";

export type Message = {
  id: number | string;
  channel_id: number;
  author_id: string;
  content: string;
  created_at: string;
  pinned?: boolean;
  profiles?: { email: string | null };
};

class ChatService {
  // Gửi tin nhắn
  async sendMessage(channelId: number, content: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Not logged in");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        channel_id: channelId,
        content,
        author_id: session.user.id,
      })
      .select("*, profiles(email)")
      .single();

    if (error) {
      console.error("sendMessage error:", error);
      throw new Error(error.message);
    }
    return data as Message;
  }

  // hiện tin nhắn cũ
  async fetchMessages(channelId: number): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("*, profiles(email)")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("fetchMessages error:", error);
      throw new Error(error.message);
    }
    console.log("fetchMessages success:", data);
    return data as Message[];
  }

  // Pinned
  async togglePinned(messageId: number, pinned: boolean) {
    const { data, error } = await supabase
      .from("messages")
      .update({ pinned })
      .eq("id", messageId)
      .select("*, profiles(email)")
      .single();

    if (error) {
      console.error("togglePinned error:", error);
      throw new Error(error.message);
    }
    return data as Message;
  }

  // Subscribe realtime
  async subscribeMessages(
    channelId: number,
    callback: (payload: Message) => void
  ) {
    const maxAttempts = 3;
    const baseDelay = 200; // ms

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const channel = supabase.channel(`messages:${channelId}`).on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => callback(payload.new as Message)
      );

      try {
        const status = await channel.subscribe();
        console.log(`subscribe attempt ${attempt} status:`, status);

        // wait short time for internal state to become SUBSCRIBED
        const waitForSubscribed = async (timeout = 3000) => {
          const start = Date.now();
          // @ts-ignore - checking internal state provided by realtime-js
          while (Date.now() - start < timeout) {
            // @ts-ignore
            if ((channel as any).state === "SUBSCRIBED") return true;
            await new Promise((r) => setTimeout(r, 50));
          }
          return false;
        };

        const confirmed = await waitForSubscribed(3000);
        if (confirmed) {
          console.log("subscribe confirmed");
          return channel;
        }

        console.warn(`subscribe not confirmed on attempt ${attempt}`);
      } catch (err) {
        console.error(`subscribe attempt ${attempt} failed:`, err);
      }

      // cleanup failed channel and retry
      try {
        await supabase.removeChannel(channel);
      } catch (e) {
        console.warn("failed to remove channel after failed subscribe", e);
      }

      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, baseDelay * attempt));
      }
    }

    throw new Error("Failed to subscribe after multiple attempts");
  }
}

export const chatService = new ChatService();
