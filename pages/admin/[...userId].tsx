import { useRouter } from "next/router";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import SettingsComponent from "../../components/Settings";
import { NextPageContext } from "next";

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

export default function Admin({ schedule }: Schedule) {
  const appointmentObjects: { date: string; timeslots: Appointment[] }[] =
    schedule.appointments.map((day) => {
      return JSON.parse(day as string);
    });
  const scheduleDates = appointmentObjects.map((day) => {
    return day.date;
  });

  const [displayDate, setDisplayDate] = useState(scheduleDates[0]);
  const [appointments, setAppointments] = useState(appointmentObjects);
  const router = useRouter();

  const scheduleId = router?.query?.userId?.[0] ?? "";
  console.log(scheduleId);

  function changeDisplayDate(direction: string) {
    let index = scheduleDates.indexOf(displayDate);
    let lastIndex = scheduleDates.length - 1;
    if (direction === "up") {
      if (index === lastIndex) {
        index = 0;
      } else {
        index++;
      }
      setDisplayDate(scheduleDates[index]);
    } else {
      //direction "down"
      if (index === 0) {
        index = lastIndex;
      } else {
        index--;
      }
      setDisplayDate(scheduleDates[index]);
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    let appointmentCopy = [...appointments];
    e.preventDefault();

    const info = e.target as HTMLFormElement;
    const fill = info.userName.value === "" ? "BLOCKED" : "";
    console.log(fill);
    console.log("appointment copy", appointmentCopy);

    for (const day of appointmentCopy) {
      if (day.date === displayDate) {
        let object = day.timeslots.find((obj, index) => {
          if (obj.time === info.time.value) {
            day!.timeslots[index] = {
              time: info.time.value,
              name: fill,
              phone: fill,
              email: fill,
            };
            return true;
          }
        });
      }
    }

    setAppointments(appointmentCopy);

    console.log("appointments", appointments);

    const apptJSON = JSON.stringify(appointments);
    const endpoint = `/api/bookAppointments/${scheduleId}`;
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: apptJSON,
    };
    const response = await fetch(endpoint, options);

    const result = await response.json();
    console.log(result);
  };

  let displayAppointments:
    | { date: string; timeslots: Appointment[] }
    | undefined = appointments.find((obj) => obj.date === displayDate);
  //this page shaped up more like I want to the non-admin view to see. I can migrate after I get further

  return (
    <>
      <SettingsComponent schedule={schedule} />
      <main className="flex flex-col bg-slate-100 w-full">
        <section className="flex flex-row m-auto">
          {scheduleDates.length > 1 && (
            <button onClick={() => changeDisplayDate("down")}>&larr;</button>
          )}
          <h1>{new Date(displayDate).toLocaleDateString()}</h1>
          {scheduleDates.length > 1 && (
            <button onClick={() => changeDisplayDate("up")}> &rarr;</button>
          )}
        </section>
        <section className="m-autopx-2">
          {scheduleDates.length === 2 && <h3>One more day available</h3>}
          {scheduleDates.length > 2 && (
            <h3>{scheduleDates.length - 1} more days available</h3>
          )}
        </section>
        <div className="overflow-x-auto m-auto">
          <section className="min-w-max table">
            <div className="table-header-group">
              <div className="table-cell py-2 px-4 w-40 border-r-2  border-t-2  border-b-2 text-center">
                Time
              </div>
              <div className="table-cell py-2 px-4 w-40 border-r-2  border-t-2  border-b-2 text-center">
                Name
              </div>
              <div className="table-cell py-2 px-4 w-40 border-r-2  border-t-2  border-b-2 text-center">
                Phone
              </div>
              <div className="table-cell py-2 px-4 w-40 border-r-2  border-t-2  border-b-2 text-center">
                Email
              </div>
              <div className="table-cell py-2 px-4 w-24  border-t-2  border-b-2"></div>
            </div>

            <section className="table-row-group">
              {displayAppointments?.timeslots.map((timeslot, index) => {
                return (
                  <form
                    onSubmit={onSubmit}
                    className="table-row"
                    key={index}>
                    <div className="table-cell py-2 px-4 w-40 border-r-2">
                      <input
                        type="time"
                        name="time"
                        value={timeslot.time}
                        readOnly
                      />
                    </div>
                    <div className="table-cell py-2 px-4 w-40 border-r-2">
                      <input
                        type="text"
                        name="userName"
                        value={timeslot.name ?? ""}
                        readOnly
                      />
                    </div>
                    <div className="table-cell py-2 px-4 w-40 border-r-2">
                      <input
                        type="tel"
                        className="w-20"
                        name="phone"
                        value={timeslot.phone ?? ""}
                        readOnly
                      />
                    </div>
                    <div className="table-cell py-2 px-4 w-40 border-r-2">
                      <input
                        type="email"
                        name="email"
                        value={timeslot.email ?? ""}
                        readOnly
                      />
                    </div>
                    <div className="table-cell py-2 px-4 w-24">
                      {timeslot.name ? (
                        <button
                          type="submit"
                          name="unreserve">
                          Un-reserve
                        </button>
                      ) : (
                        <button
                          type="submit"
                          name="block">
                          Block off time
                        </button>
                      )}
                    </div>
                  </form>
                );
              })}
            </section>
          </section>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
      props: {},
    };
  }
  try {
    const { data, error } = await supabase
      .from("data")
      .select()
      .eq("id", `${session?.user.id}`);

    if (error) {
      console.error("Error", error);
    } else {
      console.log("Success", data);
    }

    return {
      props: { schedule: data ? data[0] : null },
    };
  } catch (error) {
    console.error(error);
  }
}
