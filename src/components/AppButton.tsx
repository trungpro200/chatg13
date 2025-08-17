"use client";

import React from "react";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

function AuthButton() {
  // Auth button for directing login/logout page or chat page if logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  //useEffect for dynamic button rendering
  const checkLogged = async () => {
    const { data } = await supabase.auth.getUser();
    setIsLoggedIn(!!data.user);
  };

  useEffect(() => {
    checkLogged();
  }, []);

  if (isLoggedIn) {
    return (
      <a
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        href="/chat"
      >
        Open App
      </a>
    );
  }

  return (
    <a
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      href="/login"
    >
      Login
    </a>
  );
}

export default AuthButton;
