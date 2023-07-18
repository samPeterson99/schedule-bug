import Image from "next/image";
import { Inter } from "next/font/google";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (session && session.user) {
    const userId: string = session?.user?.id;

    router.push(`/admin/${userId}`);
  }
  return (
    <main className="sm:w-5/6 md:w-1/2 h-full mx-auto flex flex-col items-center">
      <h1 className="mt-20 text-4xl">Welcome to Schedule Bug</h1>
      <p>A somewhat easy-to-use scheduling client.</p>
      <div className="flex flex-row gap-10">
        <div className="flex flex-col w-1/2">
          {" "}
          <h2 className="self-start text-xl mt-4 px-2">How does it work?</h2>
          <p className="self-start mt-4 px-2">
            When you sign in, you will have the option to create a schedule.
            Once you click generate schedule, a sign-up page is generated based
            on your settings.
          </p>
          <p className="self-start mt-4 px-2">
            This sign-up can be sent to anyone, even if they don&apos;t have an
            count, and all of the information they have submitted will be
            available to you on your main screen.{" "}
          </p>
        </div>
        <div className="flex flex-col w-1/2">
          {" "}
          <h3 className="self-start text-xl mt-4 px-4">
            Why did you really make it?
          </h3>
          <p className="self-start mt-4 px-4">
            For me, Schedule Bug was an exercise in creating more complex
            layouts, forms, and data structures, as well as chance to use
            PostGreSQL (Supabase)
          </p>
        </div>
      </div>

      <p className="self-center mt-4 text-lg">
        {" "}
        <a
          className="underline underline-offset-4 cursor-pointer"
          onClick={() => signIn()}>
          Sign in
        </a>{" "}
        to give it a try.
      </p>
      <a
        href="https://www.schedulebug.xyz/signup/115937405155529809584"
        className="self-center underline mt-4 cursor-pointer text-md">
        Or, view my sample sign-up form without signing up.
      </a>
    </main>
  );
}
