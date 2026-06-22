import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { findUserById } from "./queries/users";
import { verifySessionToken } from "./local-session";

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    throw Errors.forbidden("Invalid authentication token.");
  }

  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }

  const user = await findUserById(claim.userId);
  if (!user) {
    throw Errors.forbidden("User not found. Please sign in again.");
  }

  return user;
}
