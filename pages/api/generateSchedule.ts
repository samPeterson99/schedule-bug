import { authOptions } from "./auth/[...nextauth]";
import { supabase } from "../../lib/supabaseClient";
import { getServerSession } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";
import { Requirements, Appointment } from "@/types/types";

interface rawSchedule {
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  increments: string;
  max_signups: number;
  private: boolean;
  requirements: Requirements;
  appointments: { day: string; timeslots: Appointment[] }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  let appointments = generateAppointments(req.body);

  if (req.body.appointments.length === 0) {
    const { data, error } = await supabase
      .from("data")
      .insert({
        id: session?.user.id,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        increments: req.body.increments,
        max_signups: req.body.max_signups,
        private: req.body.private,
        requirements: req.body.requirements,
        appointments: appointments,
      })
      .select();

    res.status(200).json(data);
  } else {
    const { data, error } = await supabase
      .from("data")
      .update({
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        increments: req.body.increments,
        max_signups: req.body.max_signups,
        private: req.body.private,
        requirements: req.body.requirements,
        appointments: appointments,
      })
      .eq("id", session?.user.id)
      .select();

    res.status(200).json(data);
  }
}

function generateAppointments(
  schedule: rawSchedule
): { date: Date; timeslots: Appointment[] }[] {
  let appointments: { date: Date; timeslots: Appointment[] }[] = [];
  /*for each day between and including start date and end date
    create time string that increment and do not include */
  const startDateArray = schedule.start_date.split("-");
  const endDateArray = schedule.end_date.split("-");
  let startDate = new Date(
    parseInt(startDateArray[0]),
    parseInt(startDateArray[1]) - 1,
    parseInt(startDateArray[2])
  );
  const endDate = new Date(
    parseInt(endDateArray[0]),
    parseInt(endDateArray[1]) - 1,
    parseInt(endDateArray[2])
  );

  let dailyTimeslots = generateTimeslots(
    schedule.start_time,
    schedule.end_time,
    schedule.increments
  );
  //form requires end date to be on or after start date

  appointments.push({
    date: new Date(startDate),
    timeslots: dailyTimeslots.slice(),
  });

  //if start date and end date are not equal, loop through the rest
  while (!equalDate(startDate, endDate)) {
    startDate.setDate(startDate.getDate() + 1);
    let keyDate = new Date(startDate);
    appointments.push({
      date: keyDate,
      timeslots: dailyTimeslots.slice(),
    });
  }

  return appointments;
}

function generateTimeslots(startTime: string, endTime: string, i: string) {
  let timeslots = [];
  let parts = startTime.split(":");
  let hours = parseInt(parts[0]);
  let minutes = parseInt(parts[1]);

  let currentTime = new Date();
  currentTime.setHours(hours);
  currentTime.setMinutes(minutes);

  let endParts = endTime.split(":");
  let endHours = parseInt(endParts[0]);
  let endMinutes = parseInt(endParts[1]);

  let endTimeObject = new Date();
  endTimeObject.setHours(endHours);
  endTimeObject.setMinutes(endMinutes);

  let interval: number;
  if (i === "15m") {
    interval = 15;
  } else if (i === "30m") {
    interval = 30;
  } else {
    interval = 60;
  }

  while (currentTime < endTimeObject) {
    // Add the current time to the intervals array
    timeslots.push({
      time: formatTime(currentTime.getHours(), currentTime.getMinutes()),
      available: true,
      name: null,
      phone: null,
      email: null,
    });

    // Increment time by the interval
    currentTime.setMinutes(currentTime.getMinutes() + interval);
  }

  return timeslots;
}

function formatTime(hours: number, minutes: number) {
  var formattedHours = String(hours).padStart(2, "0");
  var formattedMinutes = String(minutes).padStart(2, "0");
  return formattedHours + ":" + formattedMinutes;
}

function equalDate(date1: Date, date2: Date): boolean {
  return date1.getTime() === date2.getTime();
}
