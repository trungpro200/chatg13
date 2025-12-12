import { supabase } from "@/lib/supabaseClient";

export type Message = {
  id: number | string;
  channel_id: number;
  author_id: string;
  content: string;
  created_at: string;
  pinned?: boolean;
  profiles?: { email: string | null };
  attachments?: string[] | string;
};

class ChatService {
  // Gửi tin nhắn
  async sendMessage(
    channelId: number,
    content: string,
    uploadedFile: File | null = null
  ) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Not logged in");

    let fileName = null;
    let attachmentId = null;

    if (uploadedFile) {
      //Create a attachment id based on current timestamp shifted by 8 bits
      attachmentId = `att-${Date.now() << 8}`;
      // Process file upload
      const fileExt = uploadedFile.name.split(".").pop();
      fileName = `${attachmentId}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("attachments")
        .upload(attachmentId, uploadedFile);
      if (error) {
        console.error("File upload error:", error);
        throw new Error(error.message);
      }
      console.log("File uploaded:", data);
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        channel_id: channelId,
        content,
        author_id: session.user.id,
        attachments: attachmentId,
      })
      .select("*, profiles(email)")
      .single();

    if (error) {
      console.error("sendMessage error:", error);
      throw new Error(error.message);
    }
    //return data as Message;
    const savedMessage = data as Message;
    if (typeof savedMessage.attachments === "string" && savedMessage.attachments.length > 0) {
      savedMessage.attachments = [savedMessage.attachments];
    } else {
        // Nếu null/undefined/chuỗi rỗng, đặt là mảng rỗng
        savedMessage.attachments = [];
    }
    return savedMessage; // Trả về message đã chuẩn hóa attachments: string[]
  }

  // hiện tin nhắn cũ
  async fetchMessages(channelId: number): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("*, profiles(email)")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("fetchMessages error:", error);
      throw new Error(error.message);
    }

    //Reformat attachments from string to array
    data?.forEach((msg) => {
      if (msg.attachments && typeof msg.attachments === "string" && msg.attachments.length > 0) {
        msg.attachments = [msg.attachments];
      }
      else if (!msg.attachments) {
        msg.attachments = [];
      }
    });

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

    // 🔑 Ensure session (access token) is ready before subscribing
    let {
      data: { session },
    } = await supabase.auth.getSession();
    console.log("Initial session:", session);
    if (!session?.access_token) {
      console.log("No access token yet, waiting for auth state change...");
      await new Promise<void>((resolve) => {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
          if (newSession?.access_token) {
            console.log("Auth ready, continuing...");
            subscription.unsubscribe();
            resolve();
          }
        });
      });
      // refresh session
      ({
        data: { session },
      } = await supabase.auth.getSession());
    }

    if (session?.access_token && !supabase.realtime.accessTokenValue) {
      supabase.realtime.setAuth(session.access_token);
    }

    await supabase.realtime.connect();

    console.log("Socket state:", supabase.realtime.connectionState());
    console.log("Access token:", supabase.realtime.accessTokenValue);

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
          while (Date.now() - start < timeout) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((channel as any).state === "joined") return true;
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
