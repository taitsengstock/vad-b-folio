"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usernameToColor } from "@/lib/color";

export default function Home() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    const color = usernameToColor(trimmed);
    sessionStorage.setItem("username", trimmed);
    sessionStorage.setItem("color", color);
    router.push("/canvas");
  };

  const previewColor = username.trim() ? usernameToColor(username.trim()) : "#888";

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
        <h1 className="text-white text-3xl font-bold tracking-tight">collective canvas</h1>
        <p className="text-white/40 text-sm text-center max-w-xs">
          move your mouse or drag on mobile to draw.<br />
          your trace joins everyone who came before.
        </p>
        <div className="relative">
          <input
            autoFocus
            type="text"
            placeholder="enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-transparent border border-white/20 rounded-full px-6 py-3 text-white placeholder-white/30 text-center outline-none focus:border-white/60 transition-colors w-64"
          />
          {username.trim() && (
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: previewColor }}
            />
          )}
        </div>
        <button
          type="submit"
          disabled={!username.trim()}
          className="text-white/60 hover:text-white disabled:text-white/20 text-sm transition-colors cursor-pointer"
        >
          begin →
        </button>
      </form>
    </div>
  );
}
