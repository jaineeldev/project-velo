import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth-legacy-better-auth";

export const { POST, GET } = toNextJsHandler(auth);
