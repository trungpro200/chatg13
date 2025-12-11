"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";

export default function UserProfile() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
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

  // Load từ localStorage khi mở component
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

    // Lưu joined lần đầu nếu chưa có
    if (!savedJoined) {
      localStorage.setItem("user-joined", now);
    }
  }, []);

  // Lưu avatar vào localStorage
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const avatarUrl = reader.result as string;
      setUser((prev) => ({ ...prev, avatar: avatarUrl }));
      localStorage.setItem("user-avatar", avatarUrl);
    };
    reader.readAsDataURL(file);
  };

  // Lưu username và bio
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

  // Lấy màu nền từ chữ cái đầu username
  const getColorFromUsername = (username: string) => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    const index = username?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  // Format joined date hiển thị
  const formatJoined = (isoString: string) => {
    const d = new Date(isoString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <div className="bg-white dark:bg-neutral-900 shadow-md rounded-xl p-6 w-full max-w-md border">
      <div className="flex flex-col items-center">
        {/* Avatar*/}
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
              className="w-full p-2 rounded bg-neutral-800"
            />
          )}
        </div>

        {/* Joined date */}
        <p className="text-xs text-gray-500 mt-4">
          Tham gia: {formatJoined(user.joined)}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          {!editing ? (
            <Button onClick={() => setEditing(true)}>Chỉnh sửa</Button>
          ) : (
            <>
              <Button onClick={handleSave}>Lưu</Button>
              <Button variant="destructive" onClick={() => setEditing(false)}>
                Hủy
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
