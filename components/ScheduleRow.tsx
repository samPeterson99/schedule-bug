import { scheduler } from "timers/promises";

const ScheduleRow = ({
  timeslot,
}: {
  timeslot: {
    time: string;
    name: string | null;
    phone: string | null;
    email: string | null;
  };
}) => {};

export default ScheduleRow;
