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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    let appointmentCopy = [...appointments];
    e.preventDefault();

    const info = e.target as HTMLFormElement;
    console.log(info.userName.value);
    console.log("appointment copy", appointmentCopy);

    if (typeof displayAppointments !== "undefined") {
      let object = displayAppointments.timeslots.find((obj, index) => {
        if (obj.time === info.time.value) {
          displayAppointments!.timeslots[index] = {
            time: info.time.value,
            name: info.userName.value,
            phone: info.phone.value,
            email: info.email.value,
          };
          return true;
        }
      });
    } else {
      console.log("error");
    }

    console.log("display appointments", displayAppointments);

    //now put display appointments into the date spot on the copy of appointments and set state
  };

  let displayAppointments:
    | { date: string; timeslots: Appointment[] }
    | undefined = appointments.find((obj) => obj.date === displayDate);
  //this page shaped up more like I want to the non-admin view to see. I can migrate after I get further

  return (
    <>
      <SettingsComponent schedule={schedule} />
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
                value={timeslot.name ?? ""}
                readOnly
              />
              <label htmlFor="phone">Phone #: </label>
              <input
                type="tel"
                className="w-20"
                name="phone"
                value={timeslot.phone ?? ""}
                readOnly
              />
              <label htmlFor="email">Email: </label>
              <input
                type="email"
                name="email"
                value={timeslot.email ?? ""}
                readOnly
              />
              {timeslot.name ? (
                <button type="button">Un-reserve</button>
              ) : (
                <button type="submit">Block off time</button>
              )}
            </form>
          );
        })}
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
