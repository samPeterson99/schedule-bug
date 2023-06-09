import { supabase } from "@/lib/supabaseClient";
import { NextApiRequest, NextApiResponse } from "next";

interface Appointment {
  time: string;
  name: string | null;
  phone: string | null;
  email: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const scheduleId: string = req?.query?.id?.[0] ?? "";
  const appointments = req.body;
  console.log("update");
  const { data, error } = await supabase
    .from("data")
    .update({
      appointments: appointments,
    })
    .eq("id", scheduleId)
    .select();

  res.status(200).json(data);
  if (error) {
    console.error("Error", error);
  } else {
    console.log("Success", data);
  }
}
