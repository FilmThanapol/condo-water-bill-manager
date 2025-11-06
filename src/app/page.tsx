"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [session, isPending, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-lg">Redirecting...</div>
    </div>
  );
}