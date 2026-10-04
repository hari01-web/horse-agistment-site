"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Re-renders the current route (including its layout) once, e.g. so menu
// badges update after a page has marked messages as read.
export default function RefreshOnMount() {
  const router = useRouter();
  useEffect(() => {
    router.refresh();
  }, [router]);
  return null;
}
