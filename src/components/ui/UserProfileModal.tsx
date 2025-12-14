"use client";

/* eslint-disable @next/next/no-img-element */
import { X } from "lucide-react";

type Profile = {
  id: string;
  username: string;
  email: string;
  bio?: string;
  joined: string;
  avatar?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  profile: Profile | null;
};

export default function UserProfileModal({ open, onClose, profile, loading }: Props) {
  if (!open) return null;

  const getColorFromUsername = (username: string) => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    return colors[username?.charCodeAt(0) % colors.length || 0];
  };

  const formatJoined = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md bg-white text-black rounded-xl shadow-lg border relative animate-scaleIn p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded hover:bg-gray-200"
        >
          <X />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center border-b border-gray-200 pb-4">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white overflow-hidden"
            style={{
              backgroundColor: profile?.avatar
                ? "transparent"
                : getColorFromUsername(profile?.username || "U"),
            }}
          >
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              profile?.username?.[0]?.toUpperCase() || "U"
            )}
          </div>

          <h2 className="text-xl font-bold mt-4">
            {profile?.username || "User"}
          </h2>
          <p className="text-sm text-gray-600">{profile?.email || "Unknown"}</p>
        </div>

        {/* Body */}
        <div className="pt-4 space-y-4 text-center">
          {loading ? (
            <p className="text-gray-500">Loading profile...</p>
          ) : (
            <>
              <div>
                <p className="text-sm font-semibold">Bio</p>
                <p className="text-sm text-gray-700 mt-1">
                  {profile?.bio || "Chưa có bio"}
                </p>
              </div>

              <p className="text-xs text-gray-500">
                Tham gia: {profile ? formatJoined(profile.joined) : ""}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
