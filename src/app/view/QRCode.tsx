"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function QRCode() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  if (!url) return null;

  return (
    <div className="absolute bottom-6 right-6 z-10 flex flex-col items-center gap-2">
      <div className="bg-white p-3 rounded-lg">
        <QRCodeSVG value={url} size={96} />
      </div>
      <span className="text-white/30 text-xs font-mono">scan to join</span>
    </div>
  );
}
