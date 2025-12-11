"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Save, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function UserProfile() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState({
    username: "",
    email: "example@gmail.com",
    bio: "",
    joined: "",
    avatar: "",
  });

  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newBio, setNewBio] = useState("");

  useEffect(() => {
    const savedAvatar = localStorage.getItem("user-avatar");
    const savedUsername = localStorage.getItem("user-username");
    const savedBio = localStorage.getItem("user-bio");
    const savedJoined = localStorage.getItem("user-joined");

    const now = new Date().toISOString();

    setUser({
      avatar: savedAvatar || "",
      username: savedUsername || "",
      bio: savedBio || "Coder thích AI và chat app.",
      joined: savedJoined || now,
      email: "example@gmail.com",
    });

    setNewUsername(savedUsername || "");
    setNewBio(savedBio || "Coder thích AI và chat app.");

    if (!savedJoined) localStorage.setItem("user-joined", now);
  }, []);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const avatarUrl = reader.result as string;
      setUser((prev) => ({ ...prev, avatar: avatarUrl }));
      localStorage.setItem("user-avatar", avatarUrl);
    };

    const uid = await supabase.auth
      .getUser()
      .then((res) => res.data.user?.id || "");

    const { error } = await supabase.storage
      .from("avatars")
      .upload(`avt-${uid}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) return;

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(`avt-${uid}`);

    const avatarUrl = urlData.publicUrl;

    await supabase.from("profiles").upsert({
      avatar_URL: avatarUrl,
      id: uid,
    });

    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setUser((prev) => ({ ...prev, username: newUsername, bio: newBio }));
    localStorage.setItem("user-username", newUsername);
    localStorage.setItem("user-bio", newBio);

    const uid = await supabase.auth
      .getUser()
      .then((res) => res.data.user?.id || "");

    await supabase.from("profiles").upsert({
      nickname: newUsername,
      id: uid,
    });

    setEditing(false);
  };

  const getColorFromUsername = (username: string) => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    const index = username?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const formatJoined = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()} ${d
      .getHours()
      .toString()
      .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-md mx-auto mt-4 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border">

      {/* 🔥 NAVBAR PROFILE */}
      <div className="flex items-center gap-3 p-4 border-b dark:border-neutral-700">
        <button
          onClick={() => router.back()}
          className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">Profile</h1>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col items-center p-6">

        {/* Avatar */}
        <div
          onClick={handleAvatarClick}
          className="w-28 h-28 rounded-full border shadow cursor-pointer flex items-center justify-center text-2xl font-bold text-white overflow-hidden"
          style={{
            backgroundColor: user.avatar
              ? "transparent"
              : getColorFromUsername(user.username),
          }}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="avatar"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            user.username?.[0]?.toUpperCase() || "U"
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          className="hidden"
        />

        {/* Username */}
        {!editing ? (
          <h1 className="text-2xl font-bold mt-4">{user.username || "User"}</h1>
        ) : (
          <Input
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="mt-4"
          />
        )}

        {/* Email */}
        <p className="text-gray-500 mt-1">{user.email}</p>

        {/* Bio */}
        <div className="w-full mt-4">
          <p className="text-sm font-semibold">Bio</p>
          {!editing ? (
            <p className="text-gray-400">{user.bio}</p>
          ) : (
            <textarea
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              className="w-full p-2 rounded bg-white text-black resize-none"
            />
          )}
        </div>

        {/* Joined */}
        <p className="text-xs text-gray-500 mt-4">
          Tham gia: {formatJoined(user.joined)}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          {!editing ? (
            <Button onClick={() => setEditing(true)} className="flex gap-2">
              <Edit3 size={16} /> Chỉnh sửa
            </Button>
          ) : (
            <>
              <Button onClick={handleSave} className="flex gap-2">
                <Save size={16} /> Lưu
              </Button>
              <Button
                variant="destructive"
                onClick={() => setEditing(false)}
                className="flex gap-2"
              >
                <X size={16} /> Hủy
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
