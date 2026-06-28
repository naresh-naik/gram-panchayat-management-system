import { handle } from "hono/vercel";
import app from "../server/boot.ts";

export default handle(app);
