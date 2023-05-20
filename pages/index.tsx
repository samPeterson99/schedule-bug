import Image from 'next/image'
import { Inter } from 'next/font/google'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const {data: session, status } = useSession();
  const router = useRouter()

  if (session && session.user) {
    const userId: string = session?.user?.id

    router.push(`/admin/${userId}`)
  }
  return (
    <main className='w-full h-full flex flex-col items-center'>
      <h1 className='mt-5'>Welcome to Schedule Bug</h1>
      <p>An easy to use schedule client. <a className='underline underline-offset-4' onClick={() => signIn()}>Sign in</a> to get started</p>
    </main>
  )
}
