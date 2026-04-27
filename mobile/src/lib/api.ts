const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export type UserRole = 'SUPER_ADMIN' | 'TOURNAMENT_ADMIN' | 'SCORER' | 'VIEWER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';

export type CurrentUser = {
  id: string;
  phone: string;
  name: string | null;
  role: UserRole;
  status: UserStatus;
};

export type TeamSummary = {
  id: string;
  name: string;
  shortName: string | null;
};

export type TournamentSummary = {
  id: string;
  name: string;
};

export type TournamentListItem = TournamentSummary & {
  description: string | null;
  _count?: {
    teams: number;
    matches: number;
  };
};

export type ScoreSnapshot = {
  currentScore: string;
  summary: string;
  payload: unknown;
  updatedAt: string;
};

export type ViewerMatch = {
  id: string;
  status: MatchStatus;
  overs: number;
  venue: string | null;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
  tournament: TournamentSummary;
  homeTeam: TeamSummary;
  awayTeam: TeamSummary;
  scoreSnapshot: ScoreSnapshot | null;
};

export type CreateUserPayload = {
  phone: string;
  name?: string | null;
  role: UserRole;
};

export type CreateTournamentPayload = {
  name: string;
  description?: string | null;
};

export type CreateTeamPayload = {
  name: string;
  shortName?: string | null;
};

export type CreatePlayerPayload = {
  name: string;
  phone?: string | null;
};

export type CreateMatchPayload = {
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  overs: number;
  venue?: string | null;
  scheduledAt?: string | null;
};

export type PlayerCareerStat = {
  id: string | null;
  playerId: string;
  matches: number;
  battingInnings: number;
  bowlingInnings: number;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  outs: number;
  highestScore: number;
  wickets: number;
  ballsBowled: number;
  runsConceded: number;
  catches: number;
  updatedAt: string | null;
};

export type PlayerWithStats = {
  id: string;
  teamId: string;
  name: string;
  phone: string | null;
  team: TeamSummary;
  careerStat: PlayerCareerStat | null;
};

export type PlayerStatsResponse = {
  player: PlayerWithStats;
  careerStat: PlayerCareerStat;
};

export type StartInningsPayload = {
  battingTeamId: string;
  bowlingTeamId: string;
};

export type SubmitBallPayload = {
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  runsBat?: number;
  wides?: number;
  noBalls?: number;
  byes?: number;
  legByes?: number;
  penaltyRuns?: number;
  isWicket?: boolean;
  dismissalType?: string;
  playerOutId?: string | null;
  fielderId?: string | null;
  notes?: string | null;
  idempotencyKey: string;
};

type ApiOptions = {
  idToken?: string | null;
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
};

async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.idToken ? { Authorization: `Bearer ${options.idToken}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as T;
}

async function getErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    const message = payload.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    return message ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

export function getCurrentUser(idToken: string): Promise<CurrentUser> {
  return apiRequest<{ user: CurrentUser }>('/me', { idToken }).then((payload) => payload.user);
}

export function listLiveMatches(idToken: string) {
  return apiRequest<ViewerMatch[]>('/viewer/matches/live', { idToken });
}

export function listRecentMatches(idToken: string) {
  return apiRequest<ViewerMatch[]>('/viewer/matches/recent', { idToken });
}

export function getLiveScore(idToken: string, matchId: string) {
  return apiRequest<ViewerMatch>(`/viewer/matches/${matchId}/live-score`, { idToken });
}

export function listUsers(idToken: string) {
  return apiRequest<CurrentUser[]>('/users', { idToken });
}

export function createUser(idToken: string, body: CreateUserPayload) {
  return apiRequest<CurrentUser>('/users', {
    idToken,
    method: 'POST',
    body,
  });
}

export function listTournaments(idToken: string) {
  return apiRequest<TournamentListItem[]>('/tournaments', { idToken });
}

export function createTournament(idToken: string, body: CreateTournamentPayload) {
  return apiRequest<TournamentListItem>('/tournaments', {
    idToken,
    method: 'POST',
    body,
  });
}

export function createTeam(idToken: string, tournamentId: string, body: CreateTeamPayload) {
  return apiRequest<unknown>(`/tournaments/${tournamentId}/teams`, {
    idToken,
    method: 'POST',
    body,
  });
}

export function createPlayer(idToken: string, teamId: string, body: CreatePlayerPayload) {
  return apiRequest<unknown>(`/teams/${teamId}/players`, {
    idToken,
    method: 'POST',
    body,
  });
}

export function createMatch(idToken: string, body: CreateMatchPayload) {
  return apiRequest<unknown>('/matches', {
    idToken,
    method: 'POST',
    body,
  });
}

export function startInnings(idToken: string, matchId: string, body: StartInningsPayload) {
  return apiRequest<unknown>(`/matches/${matchId}/innings`, {
    idToken,
    method: 'POST',
    body,
  });
}

export function searchPlayerStats(idToken: string, query: string) {
  return apiRequest<PlayerWithStats[]>(
    `/player-stats/players?query=${encodeURIComponent(query)}&limit=10`,
    { idToken },
  );
}

export function getPlayerStats(idToken: string, playerId: string) {
  return apiRequest<PlayerStatsResponse>(`/player-stats/players/${playerId}`, { idToken });
}

export function submitBall(idToken: string, inningsId: string, body: SubmitBallPayload) {
  return apiRequest<unknown>(`/innings/${inningsId}/balls`, {
    idToken,
    method: 'POST',
    body,
  });
}

export function undoLastBall(idToken: string, inningsId: string) {
  return apiRequest<unknown>(`/innings/${inningsId}/undo-last-ball`, {
    idToken,
    method: 'POST',
  });
}

export { apiBaseUrl };
