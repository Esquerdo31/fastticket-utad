CREATE TABLE IF NOT EXISTS "Wishlist" (
  "id" SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "utilizadorId" INTEGER NOT NULL,
  "eventoId" INTEGER NOT NULL,
  CONSTRAINT "Wishlist_utilizadorId_fkey" FOREIGN KEY ("utilizadorId") REFERENCES "Utilizador"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Wishlist_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Wishlist_utilizadorId_eventoId_key" ON "Wishlist"("utilizadorId", "eventoId");
CREATE INDEX IF NOT EXISTS "Wishlist_eventoId_idx" ON "Wishlist"("eventoId");

CREATE TABLE IF NOT EXISTS "Waitlist" (
  "id" SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "utilizadorId" INTEGER NOT NULL,
  "eventoId" INTEGER NOT NULL,
  CONSTRAINT "Waitlist_utilizadorId_fkey" FOREIGN KEY ("utilizadorId") REFERENCES "Utilizador"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Waitlist_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Waitlist_utilizadorId_eventoId_key" ON "Waitlist"("utilizadorId", "eventoId");
CREATE INDEX IF NOT EXISTS "Waitlist_eventoId_idx" ON "Waitlist"("eventoId");
