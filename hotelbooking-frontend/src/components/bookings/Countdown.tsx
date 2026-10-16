"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

// Dibulatkan ke detik supaya nilainya stabil di antara dua pembacaan.
function getNow() {
  return Math.floor(Date.now() / 1000) * 1000;
}

function getServerNow() {
  return 0;
}

export function Countdown({ expiresAt }: { expiresAt: string }) {
  const router = useRouter();
  const now = useSyncExternalStore(subscribe, getNow, getServerNow);

  const target = new Date(expiresAt).getTime();
  const ready = now !== 0;
  const secondsLeft = ready ? Math.max(0, Math.floor((target - now) / 1000)) : null;
  const expired = secondsLeft === 0;

  useEffect(() => {
    if (expired) router.refresh();
  }, [expired, router]);

  if (secondsLeft === null) {
    return <span className="tabular-nums">--:--</span>;
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <span className="tabular-nums" aria-live="off">
      {minutes}:{seconds}
    </span>
  );
}