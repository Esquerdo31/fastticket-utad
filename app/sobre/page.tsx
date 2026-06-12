import React from "react";
import { getActiveSession } from "@/app/actions/auth";
import SobreContent from "./SobreContent";

export const metadata = {
    title: "Sobre Nós - UTAD FastTicket",
    description: "Conheça o projeto UTAD FastTicket, a plataforma oficial de bilheteira digital para a comunidade académica da UTAD."
};

export default async function SobrePage() {
    const userSession = await getActiveSession();
    return <SobreContent initialSession={userSession} />;
}
