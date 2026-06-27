/**
 * Northbridge Motors — Staff Portal
 * NextAuth route handler
 *
 * Handles all /admin/api/auth/* routes (sign-in, sign-out, session, etc.)
 */

import { handlers } from "../../../../lib/auth";

export const { GET, POST } = handlers;
