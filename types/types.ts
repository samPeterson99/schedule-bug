enum Requirements {
  both,
  phone,
  email,
  neither,
}

interface Appointment {
  time: string;
  available: boolean;
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
    appointments: { date: string; timeslots: Appointment[] }[] | string[];
  };
}

interface filteredSchedule {
  schedule: {
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    increments: string;
    max_signups: number;
    private: boolean;
    requirements: Requirements;
    appointments: { date: string; timeslots: Appointment[] }[];
  };
}

export { Requirements };
export type { Appointment, Schedule, filteredSchedule };
