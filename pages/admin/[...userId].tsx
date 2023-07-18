import { useRouter } from "next/router";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import SettingsComponent from "../../components/Settings";
import { NextPageContext } from "next";
import AdminSchedule from "@/components/AdminSchedule";
import { Requirements, Appointment, Schedule } from "@/types/types";

export default function Admin({ schedule }: Schedule) {
  return (
    <>
      <SettingsComponent schedule={schedule} />
      {schedule && schedule.appointments.length ? (
        <AdminSchedule schedule={schedule} />
      ) : (
        <div className="flex flex-col items-center">
          <p className="mt-16">
            Click &#34;Settings&#34; to begin creating your schedule
          </p>
        </div>
      )}
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

    return {
      props: { schedule: data && data[0] ? data[0] : null },
    };
  } catch (error) {
    console.error(error);
  }
}
