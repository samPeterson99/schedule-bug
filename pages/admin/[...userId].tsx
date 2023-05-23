import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function Admin() {
  const { data: session } = useSession();
  const router = useRouter();
  const userId: string | undefined = router?.query?.userId[0];
  if (!userId || !session) {
    router.push("/");
  }

  return (
    <main className="flex flex-col items-center">
      <div className="w-full px-8 mx-auto mt-10 space-y-2 lg:max-w-md">
        <input
          type="checkbox"
          id="accordion"
          className="peer hidden"
        />
        <label
          htmlFor="accordion"
          className="flex w-full px-2 border-l-4  items-center group">
          Settings
        </label>

        <div className="hidden peer-checked:block py-4 ">
          <form
            className="w-full max-w-lg"
            action="">
            <div className="flex flex-wrap -mx-3 mb-6">
              <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="startDate">
                  Start date of schedule
                </label>
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-auto py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  type="date"
                  name="startDate"
                />

                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="endDate">
                  End date of schedule
                </label>
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-auto py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  type="date"
                  name="endDate"
                />

                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="startTime">
                  Start time/Daily Start Time
                </label>
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-auto py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  type="time"
                  name="startTime"
                />

                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="endTime">
                  End time/ Daily end time
                </label>
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-auto py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  type="time"
                  name="endTime"
                />

                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="increments">
                  Choose time increments
                </label>
                <select
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-auto py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  name="increments"
                  id="increments">
                  <option value="15m">Fifteen minutes</option>
                  <option value="30m">Thirty minutes</option>
                  <option value="1h">One hour</option>
                </select>
                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="maxSignups">
                  How many appointments can one person sign up for at a time?
                </label>
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-auto py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  type="number"
                  defaultValue={1}
                  min={1}
                  max={10}
                />
                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="private">
                  Should your schedule be public or private? Anyone can see
                  names and appointments in public mode. In private, they will
                  just be blocked out.
                </label>
                <select
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-auto py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  name="private"
                  id="private">
                  <option
                    selected
                    value="true">
                    Private
                  </option>
                  <option value="false">Public</option>
                </select>
                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="requirements">
                  Are users required to provide a phone number or email address?
                </label>
                <select
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-auto py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  name="requirements"
                  id="requirements">
                  <option
                    selected
                    value="Both">
                    Both
                  </option>
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="Neither">Neither</option>
                </select>
                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="color">
                  What color would you like to background your sign up?
                </label>
                <input
                  className="border-0 bg-gray-200 p-0 w-1/6 rounded  focus:outline-none  focus:border-purple-500"
                  type="color"
                  value="#1100FF"
                />
                <input type="reset" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
