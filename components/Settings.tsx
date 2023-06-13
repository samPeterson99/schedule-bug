import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

enum Requirements {
  both,
  phone,
  email,
  neither,
}

interface Appointment {
  time: string;
  name: string | null;
  phone: string | null;
  email: string | null;
}

interface Schedule {
  schedule: {
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    increments: string;
    max_signups: number;
    private: boolean;
    requirements: Requirements;
    appointments: Appointment[] | string[];
  };
}

const SettingsComponent = ({ schedule }: Schedule) => {
  let todayDate = new Date();
  let todayString = todayDate.toISOString().substring(0, 10);

  const { data: session } = useSession();
  const userId: string | undefined = session?.user?.id;

  //schedule is only brought in to set these settings.
  //Settings, not schedule is use below
  const [settings, setSettings] = useState({
    start_date: schedule.start_date,
    end_date: schedule.end_date,
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    increments: schedule.increments,
    max_signups: schedule.max_signups,
    private: schedule.private,
    requirements: schedule.requirements,
    appointments: schedule.appointments,
  });
  const router = useRouter();

  // if (!session) {
  //   router.push("/");
  // }

  const changeHandler = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ): void => {
    let key = event.target.name;
    let value = event.target.value;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(settings.start_date);
    const settingsJSON = JSON.stringify(settings);
    const endpoint = "/api/generateSchedule";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: settingsJSON,
    };
    const response = await fetch(endpoint, options);

    const result = await response.json();
    console.log(result);
    router.reload();
  };

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
            className="w-full max-w-lg "
            onSubmit={onSubmit}
            action="">
            <div className="flex flex-col flex-wrap -mx-3 mb-6">
              <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="start_date">
                  Start date of schedule
                </label>
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-auto py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  type="date"
                  min={todayString}
                  value={settings.start_date}
                  onChange={changeHandler}
                  name="start_date"
                />

                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="end_date">
                  End date of schedule
                </label>
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-auto py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  type="date"
                  min={settings.start_date}
                  value={settings.end_date}
                  onChange={changeHandler}
                  name="end_date"
                />

                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="start_time">
                  Start time/Daily Start Time
                </label>
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-auto py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  type="time"
                  max={settings.end_time}
                  value={settings.start_time}
                  onChange={changeHandler}
                  name="start_time"
                />

                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="end_time">
                  End time/ Daily end time
                </label>
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-auto py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  type="time"
                  min={settings.start_time}
                  value={settings.end_time}
                  onChange={changeHandler}
                  name="end_time"
                />

                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="increments">
                  Choose time increments
                </label>
                <select
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-auto py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  name="increments"
                  id="increments"
                  value={settings.increments}
                  onChange={changeHandler}>
                  <option value="15m">Fifteen minutes</option>
                  <option value="30m">Thirty minutes</option>
                  <option value="1h">One hour</option>
                </select>
                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="max_signups">
                  How many appointments can one person sign up for at a time?
                </label>
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-auto py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  type="number"
                  value={settings.max_signups}
                  onChange={changeHandler}
                  name="max_signups"
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
                  id="private"
                  value={String(settings.private)}
                  onChange={changeHandler}>
                  <option value="true">Private</option>
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
                  id="requirements"
                  value={settings.requirements.toString()}
                  onChange={changeHandler}>
                  <option value={Requirements.both}>Both</option>
                  <option value={Requirements.phone}>Phone</option>
                  <option value={Requirements.email}>Email</option>
                  <option value={Requirements.neither}>Neither</option>
                </select>
                {/* <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="color">
                  What color would you like to background your sign up?
                </label>
                <input
                  className="border-0 bg-gray-200 p-0 w-1/6 rounded  focus:outline-none  focus:border-purple-500"
                  type="color"
                  value="#1100FF"
                /> */}

                {/* need modals for each below */}
                <div>
                  <button
                    className="px-4 mr-4 mt-4 bg-green-700 rounded formButton"
                    type="submit">
                    Generate Schedule
                  </button>
                  <input
                    className="px-4 mr-4 bg-red-700 rounded formButton"
                    type="reset"
                  />
                  <button
                    className="px-4 mr-4 mt-4 bg-blue-500 rounded formButton"
                    type="button"
                    onClick={() => router.push(`/signup/${userId}`)}>
                    View Schedule Page
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default SettingsComponent;
