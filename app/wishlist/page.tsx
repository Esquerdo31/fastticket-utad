import { getWishlistEventos } from "../actions/engagement";
import WishlistContent from "./WishlistContent";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "A minha Lista de Favoritos - UTAD FastTicket",
    description: "Os seus eventos favoritos guardados na plataforma UTAD FastTicket."
};

export default async function WishlistPage() {
    const result = await getWishlistEventos();
    const session = await getSession();

    return (
        <WishlistContent 
            initialResult={result} 
            session={session} 
        />
    );
}
