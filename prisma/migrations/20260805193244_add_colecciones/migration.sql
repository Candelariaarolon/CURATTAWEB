-- CreateTable
CREATE TABLE "Coleccion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coleccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColeccionItem" (
    "id" TEXT NOT NULL,
    "coleccionId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "precio" INTEGER NOT NULL,
    "imagen" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ColeccionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ColeccionItem_coleccionId_productoId_key" ON "ColeccionItem"("coleccionId", "productoId");

-- AddForeignKey
ALTER TABLE "Coleccion" ADD CONSTRAINT "Coleccion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColeccionItem" ADD CONSTRAINT "ColeccionItem_coleccionId_fkey" FOREIGN KEY ("coleccionId") REFERENCES "Coleccion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
