import { getWishlistEventos } from "../actions/engagement";
import WishlistContent from "./WishlistContent";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

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
