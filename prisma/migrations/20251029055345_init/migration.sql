-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_id_key" ON "user"("id");
