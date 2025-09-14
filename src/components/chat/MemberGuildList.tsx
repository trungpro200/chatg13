import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Guild } from "@/utils/guild/types";

type Props = {
  selectedGuild: Guild | null;
};

type MemberProfile = {
  id: string;
  email: string;
};

export default function MemberGuildList({ selectedGuild }: Props) {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [owner, setOwner] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const fetchMembers = async () => {
      if (!selectedGuild) {
        setMembers([]);
        setOwner(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Lấy Guild để biết owner_id
      const { data: guildData, error: gError} = await supabase
        .from("guilds")
        .select("owner_id")
        .eq("id", selectedGuild.id)
        .maybeSingle();

      if (gError || !guildData) {
        console.error("Error fetching guild owner:", gError);
        setOwner(null);
      }

      const ownerId = guildData?.owner_id || null;

      // Lấy tất cả member ids
      const { data: gmData, error: gmError } = await supabase
        .from("guild_members")
        .select("user_id")
        .eq("guild_id", selectedGuild.id);

      if (gmError || !gmData) {
        console.error("Error fetching guild members:", gmError);
        setMembers([]);
        setOwner(null)
        setLoading(false);
        return;
      }

      // Lấy email từ bảng profiles
      const ids = gmData.map((gm) => gm.user_id);
      if (ownerId && !ids.includes(ownerId)) {
        ids.push(ownerId); // đảm bảo owner có trong danh sách
      }

      if (ids.length === 0) {
        setMembers([]);
        setOwner(null)
        setLoading(false);
        return;
      }

      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", ids);

      if (pError || !profiles) {
        console.error("Error fetching profiles:", pError);
        setMembers([]);
        setOwner(null)
        setLoading(false);
        return;
      }

      // Tách owner ra khỏi members
      let foundOwner: MemberProfile | null = null;
      let restMembers: MemberProfile[] = profiles;

      if (ownerId) {
        foundOwner = profiles.find((p) => p.id === ownerId) || null;
        restMembers = profiles.filter((p) => p.id !== ownerId);
      }

      setOwner(foundOwner);
      setMembers(restMembers);
      setLoading(false);
    };

    fetchMembers();
  }, [selectedGuild]);

  return (
    <aside className="h-full w-full bg-gray-900 text-white p-4 overflow-y-auto">
      <h3 className="text-lg font-bold mb-4">Members</h3>

      {loading ? (
        <p className="text-gray-400 text-sm italic">Loading...</p>
      ) : (
        <>
          {owner && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-yellow-400 mb-2">
                Owner
              </h4>
              <div className="flex items-center gap-2 p-2 rounded bg-gray-800">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-600">
                  {owner.email[0]?.toUpperCase() || "U"}
                </div>
                <span>{owner.email}</span>
              </div>
            </div>
          )}
      
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Members</h4>
        {members.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No members</p>
        ) : (
          <ul className="space-y-2">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-700"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-600">
                  {m.email[0]?.toUpperCase() || "U"}
                </div>
                <span>{m.email}</span>
              </li>
            ))}
          </ul>
        )}
        </>
      )}
    </aside>
  );
}
