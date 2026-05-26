import { redirect } from "next/navigation";
import { getActiveSession } from "../actions/auth";

export default async function RegisterRedirect() {
  const session = await getActiveSession();
  if (session && session.userId) {
    redirect("/dashboard");
  }
  redirect("/login");
}
