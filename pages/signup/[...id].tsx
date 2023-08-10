import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Requirements, Appointment, filteredSchedule } from "@/types/types";

export default function SignUp({ schedule }: filteredSchedule) {
  //parse db's string version of appointments into JSON

  const appointmentObjects = schedule.appointments;

  console.log(typeof window === "undefined" ? "server side" : "client side");

  function stringToTime(string: String): String {
    let array = string.split(":");
    let hour = parseInt(array[0]);

    if (hour > 12) {
      hour -= 12;
      array[0] = hour.toString();
      return array[0] + ":" + array[1] + " PM";
    } else {
      array.push("AM");
      return array[0] + ":" + array[1] + " AM";
    }
  }

  //create an array of every date for schedule
  //switch to Object.keys(appointmentObjects)
  const scheduleDates = appointmentObjects.map((day: any) => {
    return day.date;
  });

  //maxsignup window configured by length of schedule
  //subject to change, especially if I want to create a continous mode
  const maxSignupExpiration = scheduleDates.length * (24 * 60 * 60 * 1000); //milliseconds in one day

  const router = useRouter();
  const [displayDate, setDisplayDate] = useState(scheduleDates[0]);
  const [appointments, setAppointments] = useState(appointmentObjects);
  const [formDay, setFormDay] = useState<string | null>(null);
  const [formAppointment, setFormAppointment] = useState<Appointment | null>(
    null
  );
  const [editCount, setEditCount] = useLocalStorage(
    "editCount",
    0,
    maxSignupExpiration
  );
  const [editMode, setEditMode] = useState(
    editCount === schedule.max_signups ? false : true
  );

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

  function handleButton(day: string, timeslot: Appointment) {
    setFormDay(day);
    setFormAppointment(timeslot);
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    let appointmentCopy = [...appointments];
    e.preventDefault();

    incrementEditCount();
    if (formAppointment && formDay) {
      const info = e.target as HTMLFormElement;

      for (const day of appointmentCopy) {
        if (day.date === displayDate) {
          let object = day.timeslots.find((obj, index) => {
            if (obj.time === info.time.value) {
              day!.timeslots[index] = {
                time: info.time.value,
                available: false,
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
    }
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

        <div className="overflow-x-auto w-full flex flex-row gap-4 mt-36 m-auto">
          <section className="w-1/2 table border-2">
            <div className="table-header-group">
              <div className="table-cell py-2 px-4 w-40 border-r-2  border-b-2 text-center">
                Time
              </div>
              <div className="table-cell py-2 px-4 w-40 border-b-2 text-center">
                Selection
              </div>
            </div>
            <div className="table-row-group overflow-auto">
              {displayAppointments?.timeslots.map((timeslot, index) => {
                if (!timeslot.available && schedule.private) {
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
                      <div className="table-cell py-2 px-4 w-40">Reserved</div>
                    </div>
                  );
                } else if (!timeslot.available && !schedule.private) {
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
                      <div className="table-cell py-2 px-4 w-40">Reserved</div>
                    </div>
                  );
                } else if (
                  displayDate === formDay &&
                  timeslot.time === formAppointment?.time
                ) {
                  return (
                    <form
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
                      <button
                        type="button"
                        disabled={!editMode}
                        className="table-cell py-2 w-full h-8  bg-white"
                        onClick={() =>
                          handleButton(displayDate, timeslot)
                        }></button>
                    </form>
                  );
                } else {
                  return (
                    <form
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

                      <button
                        type="button"
                        disabled={!editMode}
                        className="table-cell py-2 w-full h-8 "
                        onClick={() =>
                          handleButton(displayDate, timeslot)
                        }></button>
                    </form>
                  );
                }
              })}
            </div>
          </section>
          <section className="border-2 w-1/2">
            {!editMode ? (
              <h1>out of edits</h1>
            ) : formDay !== null && formAppointment !== null ? (
              <form
                className="flex flex-col h-full justify-between"
                onSubmit={onSubmit}>
                <div className="flex flex-col">
                  <h3 className=" text-xs border-b-2 p-2 w-full justify-self-start">
                    Book an appointment{" "}
                    <b className="bg-white p-px text-black">
                      {new Date(formDay as string).toDateString()}
                    </b>{" "}
                    at {stringToTime(formAppointment.time)}
                  </h3>

                  <label
                    htmlFor="userName"
                    className="pl-4">
                    Name:
                    <input
                      type="text"
                      name="userName"
                      className="ml-2 p-2 mt-4 bg-white text-black"
                      readOnly={!editMode}
                      required
                    />
                  </label>
                  <label
                    htmlFor="phone"
                    className="pl-4">
                    Phone Number:
                    <input
                      type="tel"
                      name="phone"
                      readOnly={!editMode}
                      className="ml-2 mt-4 p-2 bg-white text-black"
                      required={
                        schedule.requirements === Requirements.both ||
                        schedule.requirements === Requirements.phone
                      }
                    />
                  </label>
                  <label
                    htmlFor="email"
                    className="pl-4">
                    Email:
                    <input
                      type="email"
                      name="email"
                      className="ml-2 mt-4 p-2 bg-white text-black"
                      readOnly={!editMode}
                      required={
                        schedule.requirements === Requirements.both ||
                        schedule.requirements === Requirements.email
                      }
                    />
                  </label>
                </div>

                <div className="justify-self-end">
                  <p className="px-2 text-xs font-light">
                    Take note of your appointment before you book it. Depending
                    on settings, the schedule might not say your name.
                  </p>
                  <button
                    className="w-full py-2 px-4 border-2"
                    type="submit"
                    disabled={!editMode}>
                    Book It!
                  </button>
                </div>
              </form>
            ) : (
              <h5 className="w-full text-center mt-8">
                Select a Time for Sign up
              </h5>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
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

    let filteredData: { date: string; timeslots: Appointment[] }[] = [];
    if (data) {
      filteredData = data[0].appointments.map((day: string) => {
        let jsonData = JSON.parse(day as string);
        const filteredTimeslots = jsonData.timeslots.map(
          (timeslot: { time: any; available: any }) => ({
            time: timeslot.time,
            available: timeslot.available,
          })
        );
        return {
          date: jsonData.date,
          timeslots: filteredTimeslots,
        };
      });
    }

    return {
      props: {
        schedule: data ? { ...data[0], appointments: filteredData } : null,
      },
    };
  } catch (error) {
    return {
      props: { schedule: null },
    };
  }
};
