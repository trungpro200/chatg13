"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    // insert into profiles (only works if you disabled email confirmation)
    if (data.user) {
      await supabase.from("profiles").insert([{ id: data.user.id, email }]);
      router.push("/chat");
    }
  };

  return (
    <main className="h-screen flex bg-gray-900 text-white">
      {/* Left branding panel */}
      <div
        className="hidden md:flex flex-1 items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url("/images/authbackground.avif")` }}
      >
        <h1 className="text-4xl font-bold text-white bg-black bg-opacity-50 p-4 rounded">
          Lunari
        </h1>
      </div>

      {/* Right signup form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <form
          onSubmit={handleSignUp}
          className="bg-gray-800 p-8 rounded-lg w-full max-w-md space-y-5 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-center">Create Account</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <div>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 p-3 rounded-md font-bold transition"
          >
            Sign Up
          </button>

          <p className="text-sm text-center text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
