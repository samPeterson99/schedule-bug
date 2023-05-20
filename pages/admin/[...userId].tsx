import { useRouter } from "next/router"
import { useSession } from "next-auth/react";

export default function Admin() {
    const { data: session } = useSession()
    const router = useRouter();
    const userId: string|undefined = router?.query?.userId[0];
    if (!userId || !session) {
        router.push('/')
    }

    return (
        <main className="flex flex-col items-center">
            <div className="w-full px-8 mx-auto mt-10 space-y-2 lg:max-w-md">
                <input type="checkbox" id="accordion" className="peer hidden" />
                <label htmlFor="accordion" className="flex w-full px-2 border-l-4  items-center group">
                   Settings
                </label>
            
            <div className="hidden peer-checked:block py-4 ">
                <ol>
                    <li>schedule or list</li>
                    <li>date start/stop</li>
                    <li>time start/stop</li>
                    <li>time slots: 15, 30, 1hr</li>
                    <li>hide information from users</li>
                    <li>require email</li>
                    <li>require phone#</li>
                    <li>color?</li>
                    <li>clear schedule</li>
                </ol>
            </div>
            </div>
        </main>
    )
}