/* eslint-disable @next/next/no-img-element */
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Attachment({ url }: { url: string }) {
  const [isImage, setIsImage] = useState<boolean | null>(null);
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch(url, { method: "HEAD" });
        const type = res.headers.get("content-type");

        setFileName(url.split("%20")[1] || "");

        if (mounted) setIsImage(type?.startsWith("image/") ?? false);
      } catch {
        if (mounted) setIsImage(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [url]);

  if (isImage === null) {
    return <span className="text-gray-400">Loading…</span>;
  }

  return isImage ? (
    <Image
      src={url}
      alt="Attachment"
      className="rounded object-contain"
      width={2000}
      height={2000}
      style={{ width: "100%", height: "auto" }}
      sizes="(max-width: 768px) 100vw, 400px"
    />
  ) : (
    <a
      href={url}
      rel="noopener noreferrer"
      className="text-blue-500 underline"
      target="_blank"
    >
      {fileName || url.split("/").pop()}
    </a>
  );
}
