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
  const scheduleDates = appointmentObjects.map((day) => {
    return day.date;
  });

  const router = useRouter();
  const [displayDate, setDisplayDate] = useState(scheduleDates[0]);
  const [appointments, setAppointments] = useState(appointmentObjects);
  const [editCount, setEditCount] = useLocalStorage("editCount", 0);
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
      <main className="flex flex-col items-center bg-slate-400 w-full">
        {scheduleDates.length > 1 && (
          <button onClick={() => changeDisplayDate("down")}>&larr;</button>
        )}
        <h1>{new Date(displayDate).toLocaleDateString()}</h1>
        {scheduleDates.length > 1 && (
          <button onClick={() => changeDisplayDate("up")}> &rarr;</button>
        )}
        {scheduleDates.length === 2 && <h3>One more day available</h3>}
        {scheduleDates.length > 2 && (
          <h3>{scheduleDates.length - 1} more days available</h3>
        )}
        {displayAppointments?.timeslots.map((timeslot, index) => {
          if (timeslot.name && schedule.private) {
            return (
              <div
                className="flex w-full flex-row"
                key={index}>
                <input
                  type="time"
                  name="time"
                  value={timeslot.time}
                  readOnly
                />
                <label htmlFor="userName">Reserved</label>
              </div>
            );
          } else if (timeslot.name && !schedule.private) {
            return (
              <form
                onSubmit={onSubmit}
                className="flex flex-row w-full"
                key={index}>
                <input
                  type="time"
                  name="time"
                  value={timeslot.time}
                  readOnly
                />
                {timeslot.name === "BLOCKED" ? (
                  <label htmlFor="userName">Not Available</label>
                ) : (
                  <label htmlFor="userName">
                    Reserved:
                    <input
                      type="text"
                      name="userName"
                      value={timeslot.name}
                      readOnly
                    />{" "}
                  </label>
                )}
              </form>
            );
          } else {
            return (
              <form
                onSubmit={onSubmit}
                className="flex flex-row"
                key={index}>
                <input
                  type="time"
                  name="time"
                  value={timeslot.time}
                  readOnly
                />
                <label htmlFor="userName">Name: </label>
                <input
                  type="text"
                  name="userName"
                  readOnly={!editMode}
                  required
                />
                <label htmlFor="phone">Phone #: </label>
                <input
                  type="tel"
                  className="w-20"
                  name="phone"
                  readOnly={!editMode}
                  required={
                    schedule.requirements === Requirements.both ||
                    schedule.requirements === Requirements.phone
                  }
                />
                <label htmlFor="email">Email: </label>
                <input
                  type="email"
                  name="email"
                  readOnly={!editMode}
                  required={
                    schedule.requirements === Requirements.both ||
                    schedule.requirements === Requirements.email
                  }
                />
                <button
                  type="submit"
                  disabled={!editMode}>
                  Book It!
                </button>
              </form>
            );
          }
        })}
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
