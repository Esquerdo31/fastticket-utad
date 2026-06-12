import { redirect } from "next/navigation";
import { getActiveSession } from "../actions/auth";

export const metadata = {
  title: "Registar - UTAD FastTicket",
  description: "Criar uma nova conta de estudante ou organizador na plataforma UTAD FastTicket."
};

export default async function RegisterRedirect() {
  const session = await getActiveSession();
  if (session && session.userId) {
    redirect("/dashboard");
  }
  redirect("/login");
}
