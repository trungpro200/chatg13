"use client";

import { supabase } from "@/lib/supabaseClient";
import { FaGoogle, FaGithub, FaFacebook } from "react-icons/fa";

export default function SocialAuthButtons() {
  const handleOAuthSignIn = async (
    provider: "google" | "github" | "facebook"
  ) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert("Error signing in: " + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Google */}
      <button
        onClick={() => handleOAuthSignIn("google")}
        className="w-24 h-12 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-100"
      >
        <FaGoogle className="text-xl text-gray-700" />
      </button>

      {/* GitHub */}
      <button
        onClick={() => handleOAuthSignIn("github")}
        className="w-24 h-12 flex items-center justify-center rounded-md border border-gray-600 bg-gray-800 hover:bg-gray-700"
      >
        <FaGithub className="text-xl text-white" />
      </button>

      {/* Facebook */}
      <button
        onClick={() => handleOAuthSignIn("facebook")}
        className="w-24 h-12 flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700"
      >
        <FaFacebook className="text-xl text-white" />
      </button>
    </div>
  );
}
