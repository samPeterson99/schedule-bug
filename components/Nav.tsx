import Link from "next/link";
import { BugAntIcon } from "@heroicons/react/24/solid";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Nav() {
  const { data: session } = useSession();

  return (
    <header className="max-w-full container">
      <div className="flex justify-between p-2 items-center">
        <h4 className="font-bold flex-none">Schedule Bug</h4>
        <BugAntIcon className="h-8" />
        {session && session.user ? (
          <button
            className="flex-none p-2 rounded-2xl bg-black hover:bg-white hover:text-black"
            onClick={() => signOut()}>
            Sign out
          </button>
        ) : (
          <button
            className="flex-none border-2 p-2 rounded-2xl bg-black hover:bg-white hover:text-black"
            onClick={() => signIn()}>
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
