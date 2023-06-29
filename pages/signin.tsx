import { NextPageContext } from "next";
import { useSession, getProviders, signIn, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

type Providers = {
  [key: string]: Provider;
};

interface Provider {
  id: String;
  name: String;
  type: String;
  signinUrl: String;
  callbackUrl: String;
}

function Signin({ providers }: Providers) {
  const { data: session } = useSession();
  const router = useRouter();
  console.log(providers);

  return (
    <div className="h-screen flex flex-col items-center">
      <div className="mt-32 bg-white rounded-full h-80 w-80 flex justify-center flex-col items-center">
        {Object.values(providers).map((provider) => {
          return (
            <div
              className="bg-black rounded w-3/4 flex flex-col font-light h-12 pl-1.5 m-4"
              key={provider.name}>
              <button
                className="text-2xl text-center py-2"
                onClick={() => signIn(provider.id, { callbackUrl: "/" })}>
                Sign in with {provider.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  const providers = await getProviders();
  const { req } = context;
  const session = await getSession({ req });

  if (session) {
    return {
      redirect: { destination: "/dashboard" },
    };
  }

  return {
    props: {
      providers,
    },
  };
}

export default Signin;
