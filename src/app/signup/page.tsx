"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    // 1. Check if email exists in profiles
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      setError("Error checking email. Please try again.");
      setLoading(false);
      return;
    }

    if (existingUser) {
      setError("This email is already registered!");
      setLoading(false);
      return;
    }

    // 2. Create auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // 3. Insert into profiles table
    console.log(existingUser);
    console.log(signUpError);
    if (data.user && !signUpError) {
      alert("Check your email to confirm your account!");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleSignUp}
        className="bg-gray-800 p-8 rounded-lg w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded bg-white text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded bg-white text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-3 rounded bg-white text-black"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 p-3 rounded font-bold"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </main>
  );
}
