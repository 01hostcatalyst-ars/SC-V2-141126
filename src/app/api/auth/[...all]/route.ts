import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handlers = toNextJsHandler(auth);

// Node.js routes work on Vercel and on the future Coolify deployment.
export const { GET, POST } = handlers;
