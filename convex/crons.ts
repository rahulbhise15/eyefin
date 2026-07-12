import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// 8:00 AM IST = 02:30 UTC — a calm morning brief for everyone on Telegram.
crons.daily(
  "daily brief",
  { hourUTC: 2, minuteUTC: 30 },
  internal.brief.sendDailyBriefs
);

export default crons;
