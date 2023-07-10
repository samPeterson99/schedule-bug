import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { NextPageContext } from "next";
import useLocalStorage from "@/hooks/useLocalStorage";

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
  //parse db's string version of appointments into JSON
  const appointmentObjects: { date: string; timeslots: Appointment[] }[] =
    schedule.appointments.map((day) => {
      return JSON.parse(day as string);
    });

  //create an array of every date for schedule
  //switch to Object.keys(appointmentObjects)
  const scheduleDates = appointmentObjects.map((day) => {
    return day.date;
  });

  //maxsignup window configured by length of schedule
  //subject to change, especially if I want to create a continous mode
  const maxSignupExpiration = scheduleDates.length * (24 * 60 * 60 * 1000); //milliseconds in one day

  const router = useRouter();
  const [displayDate, setDisplayDate] = useState(scheduleDates[0]);
  const [appointments, setAppointments] = useState(appointmentObjects);
  const [editCount, setEditCount] = useLocalStorage(
    "editCount",
    0,
    maxSignupExpiration
  );
  const [editMode, setEditMode] = useState(
    editCount === schedule.max_signups ? false : true
  );

  console.log("editCount", editCount);
  console.log("editMode", editMode);

  const scheduleId = router?.query?.id?.[0] ?? "";

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

    incrementEditCount();

    const info = e.target as HTMLFormElement;
    console.log(info.userName.value);
    console.log("appointment copy", appointmentCopy);

    for (const day of appointmentCopy) {
      if (day.date === displayDate) {
        let object = day.timeslots.find((obj, index) => {
          if (obj.time === info.time.value) {
            day!.timeslots[index] = {
              time: info.time.value,
              name: info.userName.value,
              phone: info.phone.value,
              email: info.email.value,
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

  const incrementEditCount = () => {
    const newEditCount = editCount + 1;
    setEditCount(newEditCount);
  };

  let displayAppointments:
    | { date: string; timeslots: Appointment[] }
    | undefined = appointments.find((obj) => obj.date === displayDate);
  //this page shaped up more like I want to the non-admin view to see. I can migrate after I get further

  useEffect(() => {
    if (editCount >= schedule.max_signups) {
      setEditMode(false);
    }
  }, [editCount, schedule.max_signups]);

  return (
    <>
      <main className="flex flex-col w-full">
        <section className="fixed w-full flex mt-14 flex-col">
          <div className="flex flex-row mx-auto">
            {scheduleDates.length > 1 && (
              <button
                className="w-8"
                onClick={() => changeDisplayDate("down")}>
                &larr;
              </button>
            )}
            <h1 className="px-2">
              {new Date(displayDate).toLocaleDateString()}
            </h1>
            {scheduleDates.length > 1 && (
              <button
                className="w-8"
                onClick={() => changeDisplayDate("up")}>
                &rarr;
              </button>
            )}
          </div>
          <div className="m-auto p-2">
            {scheduleDates.length === 2 && <h3>One more day available</h3>}
            {scheduleDates.length > 2 && (
              <h3>{scheduleDates.length - 1} more days available</h3>
            )}
          </div>
        </section>

        <div className="overflow-x-auto mt-36 m-auto">
          {schedule.private ? (
            <h3 className="mb-2 w-full mx-32 font-light">
              [This is a private form. After you make your appointment, you will
              not be able to see which one it is.]
            </h3>
          ) : (
            <h3 className="mb-2 w-full mx-32 font-light">
              [This is a public form. Any information in your appointment will
              be available to anyone with this link.]
            </h3>
          )}
          <section className="min-w-max table border-2">
            <div className="table-header-group">
              <div className="table-cell py-2 px-4 w-40 border-r-2  border-b-2 text-center">
                Time
              </div>
              <div className="table-cell py-2 px-4 w-40 border-r-2  border-b-2 text-center">
                Name
              </div>
              <div className="table-cell py-2 px-4 w-40 border-r-2  border-b-2 text-center">
                Phone
              </div>
              <div className="table-cell py-2 px-4 w-40 border-r-2  border-b-2 text-center">
                Email
              </div>
              <div className="table-cell py-2 px-4 w-24  border-b-2"></div>
            </div>
            <div className="table-row-group overflow-auto">
              {displayAppointments?.timeslots.map((timeslot, index) => {
                if (timeslot.name && schedule.private) {
                  return (
                    <div
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
                      <div className="table-cell py-2 px-4 w-40 border-r-2 text-center">
                        Reserved
                      </div>
                      <div className="table-cell py-2 px-4 w-40 border-r-2 text-center">
                        -
                      </div>
                      <div className="table-cell py-2 px-4 w-40 border-r-2 text-center">
                        -
                      </div>
                      <div className="table-cell py-2 px-4 w-40 border-r-2 text-center">
                        -
                      </div>
                    </div>
                  );
                } else if (timeslot.name && !schedule.private) {
                  return (
                    <div
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
                        {timeslot.name === "BLOCKED" ? (
                          <div>Not Available</div>
                        ) : (
                          <div>Reserved: {timeslot.name}</div>
                        )}
                      </div>
                      <div className="table-cell py-2 px-4 w-40 border-r-2 text-center">
                        -
                      </div>
                      <div className="table-cell py-2 px-4 w-40 border-r-2 text-center">
                        -
                      </div>
                      <div className="table-cell py-2 px-4 w-40 text-center">
                        -
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <form
                      className="table-row"
                      onSubmit={onSubmit}
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
                          readOnly={!editMode}
                          required
                        />
                      </div>
                      <div className="table-cell py-2 px-4 w-40 border-r-2">
                        <input
                          type="tel"
                          name="phone"
                          readOnly={!editMode}
                          required={
                            schedule.requirements === Requirements.both ||
                            schedule.requirements === Requirements.phone
                          }
                        />
                      </div>
                      <div className="table-cell py-2 px-4 w-40 border-r-2">
                        <input
                          type="email"
                          name="email"
                          readOnly={!editMode}
                          required={
                            schedule.requirements === Requirements.both ||
                            schedule.requirements === Requirements.email
                          }
                        />
                      </div>
                      <div>
                        <button
                          className="table-cell py-2 px-4 w-40"
                          type="submit"
                          disabled={!editMode}>
                          Book It!
                        </button>
                      </div>
                    </form>
                  );
                }
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  if (!context.query.id) {
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
      .eq("id", `${context.query.id[0]}`);

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
