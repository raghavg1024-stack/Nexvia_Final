"use client";

import { useFormStatus } from "react-dom";
import { logout } from "@/lib/rewards";

function LogoutSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110 disabled:opacity-60"
    >
      {pending ? "Logging out..." : "Logout"}
    </button>
  );
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <LogoutSubmit />
    </form>
  );
}