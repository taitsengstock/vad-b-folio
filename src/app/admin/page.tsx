"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const router = useRouter();

  const handleClear = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/sessions/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setStatus("success");
      setTimeout(() => router.push("/"), 1500);
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <form onSubmit={handleClear} className="flex flex-col items-center gap-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">admin</h1>
        <p className="text-white/40 text-sm text-center max-w-xs">
          Clear all sessions to reset the canvas for a new class.
        </p>
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-transparent border border-white/20 rounded-full px-6 py-3 text-white placeholder-white/30 text-center outline-none focus:border-white/60 transition-colors w-64"
        />
        <button
          type="submit"
          disabled={!password || status === "loading"}
          className="text-red-400 hover:text-red-300 disabled:text-white/20 text-sm transition-colors cursor-pointer"
        >
          {status === "loading" ? "clearing…" : status === "success" ? "cleared ✓" : "clear all sessions →"}
        </button>
        {status === "error" && (
          <p className="text-red-500 text-xs">wrong password</p>
        )}
      </form>
    </div>
  );
}
