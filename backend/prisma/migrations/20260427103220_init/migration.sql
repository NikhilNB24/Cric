-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'TOURNAMENT_ADMIN', 'SCORER', 'VIEWER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "InningsStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DismissalType" AS ENUM ('BOWLED', 'CAUGHT', 'CAUGHT_AND_BOWLED', 'LBW', 'RUN_OUT', 'STUMPED', 'HIT_WICKET', 'RETIRED', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "overs" INTEGER NOT NULL,
    "venue" TEXT,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innings" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "battingTeamId" TEXT NOT NULL,
    "bowlingTeamId" TEXT NOT NULL,
    "inningsNumber" INTEGER NOT NULL,
    "status" "InningsStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "runs" INTEGER NOT NULL DEFAULT 0,
    "wickets" INTEGER NOT NULL DEFAULT 0,
    "legalBalls" INTEGER NOT NULL DEFAULT 0,
    "extras" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "innings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ball_events" (
    "id" TEXT NOT NULL,
    "inningsId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "overNumber" INTEGER NOT NULL,
    "ballInOver" INTEGER NOT NULL,
    "strikerId" TEXT NOT NULL,
    "nonStrikerId" TEXT NOT NULL,
    "bowlerId" TEXT NOT NULL,
    "scoredById" TEXT NOT NULL,
    "runsBat" INTEGER NOT NULL DEFAULT 0,
    "wides" INTEGER NOT NULL DEFAULT 0,
    "noBalls" INTEGER NOT NULL DEFAULT 0,
    "byes" INTEGER NOT NULL DEFAULT 0,
    "legByes" INTEGER NOT NULL DEFAULT 0,
    "penaltyRuns" INTEGER NOT NULL DEFAULT 0,
    "isLegalDelivery" BOOLEAN NOT NULL DEFAULT true,
    "isWicket" BOOLEAN NOT NULL DEFAULT false,
    "dismissalType" "DismissalType",
    "playerOutId" TEXT,
    "notes" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ball_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_score_snapshots" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "currentScore" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_score_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "teams_tournamentId_name_key" ON "teams"("tournamentId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "players_teamId_name_key" ON "players"("teamId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "innings_matchId_inningsNumber_key" ON "innings"("matchId", "inningsNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ball_events_idempotencyKey_key" ON "ball_events"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "ball_events_inningsId_sequence_key" ON "ball_events"("inningsId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "match_score_snapshots_matchId_key" ON "match_score_snapshots"("matchId");

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innings" ADD CONSTRAINT "innings_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innings" ADD CONSTRAINT "innings_battingTeamId_fkey" FOREIGN KEY ("battingTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innings" ADD CONSTRAINT "innings_bowlingTeamId_fkey" FOREIGN KEY ("bowlingTeamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ball_events" ADD CONSTRAINT "ball_events_inningsId_fkey" FOREIGN KEY ("inningsId") REFERENCES "innings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ball_events" ADD CONSTRAINT "ball_events_strikerId_fkey" FOREIGN KEY ("strikerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ball_events" ADD CONSTRAINT "ball_events_nonStrikerId_fkey" FOREIGN KEY ("nonStrikerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ball_events" ADD CONSTRAINT "ball_events_bowlerId_fkey" FOREIGN KEY ("bowlerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ball_events" ADD CONSTRAINT "ball_events_scoredById_fkey" FOREIGN KEY ("scoredById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ball_events" ADD CONSTRAINT "ball_events_playerOutId_fkey" FOREIGN KEY ("playerOutId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_score_snapshots" ADD CONSTRAINT "match_score_snapshots_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
