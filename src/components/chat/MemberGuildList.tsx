import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Guild } from "@/utils/guild/types";

type Props = {
  selectedGuild: Guild | null;
};

type MemberProfile = {
  id: string;
  email: string;
  avatar: string;
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
      console.log(process.env.NEXT_PUBLIC_BASE_URL)
      console.log((await await fetch(`/api/getmembers/${36}`)).json())

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
        .select("id, email, avatar_URL")
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
      let restMembers: MemberProfile[] = profiles.map(p => ({
        id: p.id,
        email: p.email,
        avatar: p.avatar_URL || "",
      }));

      if (ownerId) {
        foundOwner = restMembers.find((p) => p.id === ownerId) || null;
        restMembers = restMembers.filter((p) => p.id !== ownerId);
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
                {owner.avatar ? (
                  // THÊM: Hiển thị avatar nếu có URL
                  <img src={owner.avatar} alt={`${owner.email}'s avatar`} className="w-8 h-8 rounded-full object-cover"/>
                ) : (
                  // THAY THẾ: Hiển thị avatar mặc định (hoặc chữ cái)
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${owner.id}`} alt="Default Avatar" className="w-8 h-8 rounded-full object-cover"/>
                )}
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
                {m.avatar ? (
                  // THÊM: Hiển thị avatar nếu có URL
                  <img src={m.avatar} alt={`${m.email}'s avatar`} className="w-8 h-8 rounded-full object-cover"/>
                ) : (
                  // THAY THẾ: Hiển thị avatar mặc định (hoặc chữ cái)
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.id}`} alt="Default Avatar" className="w-8 h-8 rounded-full object-cover"/>
                )}
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
