"use client";

import React from "react";
// import { supabase } from "@/lib/supabaseClient";
import { useSupabase } from "@/components/SupabaseProvider";
import { useEffect, useState } from "react";

function AuthButton() {
  // Auth button for directing login/logout page or chat page if logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = useSupabase();

  //useEffect for dynamic button rendering
  useEffect(() => {
    let isMounted = true;
    const checkLogged = async () => {
      const { data } = await supabase.auth.getUser();
      if (isMounted) {
        setIsLoggedIn(!!data?.user);
      }
    };
    checkLogged();
    return () => {
      isMounted = false;
    };
  }, [supabase]);

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
