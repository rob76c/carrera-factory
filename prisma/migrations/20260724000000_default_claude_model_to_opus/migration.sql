-- Default new Claude sessions to Opus instead of Sonnet.
-- SQLite cannot change a column default in place, so Prisma rebuilds both
-- tables below; existing rows are copied across unchanged.
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AgentSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT,
    "workflow" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'opus',
    "status" TEXT NOT NULL DEFAULT 'IDLE',
    "provider" TEXT NOT NULL,
    "providerSessionId" TEXT,
    "providerProjectPath" TEXT,
    "providerProcessPid" INTEGER,
    "providerMetadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AgentSession_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AgentSession" ("createdAt", "id", "model", "name", "provider", "providerMetadata", "providerProcessPid", "providerProjectPath", "providerSessionId", "status", "updatedAt", "workflow", "workspaceId") SELECT "createdAt", "id", "model", "name", "provider", "providerMetadata", "providerProcessPid", "providerProjectPath", "providerSessionId", "status", "updatedAt", "workflow", "workspaceId" FROM "AgentSession";
DROP TABLE "AgentSession";
ALTER TABLE "new_AgentSession" RENAME TO "AgentSession";
CREATE INDEX "AgentSession_workspaceId_idx" ON "AgentSession"("workspaceId");
CREATE INDEX "AgentSession_status_idx" ON "AgentSession"("status");
CREATE INDEX "AgentSession_provider_idx" ON "AgentSession"("provider");
CREATE INDEX "AgentSession_workspaceId_provider_idx" ON "AgentSession"("workspaceId", "provider");
CREATE INDEX "AgentSession_workspaceId_status_idx" ON "AgentSession"("workspaceId", "status");
CREATE INDEX "AgentSession_workspaceId_createdAt_idx" ON "AgentSession"("workspaceId", "createdAt");
CREATE INDEX "AgentSession_workspaceId_updatedAt_idx" ON "AgentSession"("workspaceId", "updatedAt");
CREATE TABLE "new_UserSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL DEFAULT 'default',
    "preferredIde" TEXT NOT NULL DEFAULT 'cursor',
    "customIdeCommand" TEXT,
    "playSoundOnComplete" BOOLEAN NOT NULL DEFAULT true,
    "notificationSoundPath" TEXT,
    "workspaceOrder" JSONB,
    "cachedSlashCommands" JSONB,
    "ratchetEnabled" BOOLEAN NOT NULL DEFAULT false,
    "ratchetReplyToPrComments" BOOLEAN NOT NULL DEFAULT true,
    "defaultSessionProvider" TEXT NOT NULL DEFAULT 'CLAUDE',
    "defaultClaudeModel" TEXT NOT NULL DEFAULT 'opus',
    "defaultCodexModel" TEXT NOT NULL DEFAULT 'default',
    "defaultWorkspacePermissions" TEXT NOT NULL DEFAULT 'STRICT',
    "ratchetPermissions" TEXT NOT NULL DEFAULT 'YOLO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_UserSettings" ("cachedSlashCommands", "createdAt", "customIdeCommand", "defaultClaudeModel", "defaultCodexModel", "defaultSessionProvider", "defaultWorkspacePermissions", "id", "notificationSoundPath", "playSoundOnComplete", "preferredIde", "ratchetEnabled", "ratchetPermissions", "ratchetReplyToPrComments", "updatedAt", "userId", "workspaceOrder") SELECT "cachedSlashCommands", "createdAt", "customIdeCommand", "defaultClaudeModel", "defaultCodexModel", "defaultSessionProvider", "defaultWorkspacePermissions", "id", "notificationSoundPath", "playSoundOnComplete", "preferredIde", "ratchetEnabled", "ratchetPermissions", "ratchetReplyToPrComments", "updatedAt", "userId", "workspaceOrder" FROM "UserSettings";
DROP TABLE "UserSettings";
ALTER TABLE "new_UserSettings" RENAME TO "UserSettings";
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
CREATE INDEX "UserSettings_userId_idx" ON "UserSettings"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Carry existing settings still holding the previous default onto the new one.
-- Rows where a different model was explicitly chosen are left untouched.
UPDATE "UserSettings"
SET "defaultClaudeModel" = 'opus'
WHERE "defaultClaudeModel" = 'sonnet';