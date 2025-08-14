"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      // If logged in, redirect from login/signup to /chat
      if (data.user && (pathname === "/login" || pathname === "/signup")) {
        router.replace("/chat");
      }
    };

    checkUser();
  }, [pathname, router]);

  return <>{children}</>;
}
