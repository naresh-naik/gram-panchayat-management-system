import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { citizenRouter } from "./routers/citizen";
import { householdRouter } from "./routers/household";
import { schemeRouter } from "./routers/scheme";
import { enrollmentRouter } from "./routers/enrollment";
import { financeRouter } from "./routers/finance";
import { meetingRouter } from "./routers/meeting";
import { grievanceRouter } from "./routers/grievance";
import { reportRouter } from "./routers/report";
import { activityRouter } from "./routers/activity";
import { userRouter } from "./routers/user";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  citizen: citizenRouter,
  household: householdRouter,
  scheme: schemeRouter,
  enrollment: enrollmentRouter,
  finance: financeRouter,
  meeting: meetingRouter,
  grievance: grievanceRouter,
  report: reportRouter,
  activity: activityRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
