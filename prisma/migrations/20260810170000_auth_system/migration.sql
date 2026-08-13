-- Rename column instead of drop+add: preserves existing password hashes
-- for the 3 users that already exist in this table.
ALTER TABLE "User" RENAME COLUMN "password" TO "passwordHash";

-- New auth-flow columns.
ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "verificationToken" TEXT;
ALTER TABLE "User" ADD COLUMN "verificationTokenExpiry" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN "resetTokenExpiry" TIMESTAMP(3);

-- Grandfather in accounts created before email verification existed, so
-- existing users aren't locked out of login by this migration.
UPDATE "User" SET "emailVerified" = true;

CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- 1:1 Pinterest account <-> Curatta user constraint.
ALTER TABLE "PinterestToken" ADD COLUMN "pinterestUserId" TEXT;
CREATE UNIQUE INDEX "PinterestToken_pinterestUserId_key" ON "PinterestToken"("pinterestUserId");
