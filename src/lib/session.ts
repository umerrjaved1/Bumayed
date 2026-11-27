import { cache } from "react";
import { auth } from "@/auth";

/**
 * The signed-in session, read once per request. The header, tab bar and
 * page all need it; React's request cache makes them share one lookup.
 */
export const getSession = cache(() => auth());
