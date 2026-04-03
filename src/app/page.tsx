"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    setLoading(true);
    const res = await fetch(`/api/color?username=${encodeURIComponent(trimmed)}`);
    const { color } = await res.json();
    sessionStorage.setItem("username", trimmed);
    sessionStorage.setItem("color", color);
    router.push("/canvas");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
        <h1 className="text-white text-3xl font-bold tracking-tight">collective canvas</h1>
        <p className="text-white/40 text-sm text-center max-w-xs">
          move your mouse or drag on mobile to draw.<br />
          your trace joins everyone who came before.
        </p>
        <input
          autoFocus
          type="text"
          placeholder="enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-transparent border border-white/20 rounded-full px-6 py-3 text-white placeholder-white/30 text-center outline-none focus:border-white/60 transition-colors w-64"
        />
        <button
          type="submit"
          disabled={!username.trim() || loading}
          className="text-white/60 hover:text-white disabled:text-white/20 text-sm transition-colors cursor-pointer"
        >
          {loading ? "…" : "begin →"}
        </button>
      </form>
    </div>
  );
}
