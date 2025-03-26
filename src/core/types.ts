export type SingleUpcomingMatchSegment = {
  team1: string;
  team2: string;
  logo1: string;
  logo2: string;
  team1_short: string;
  team2_short: string;
  players1: { id: number; name: string; flag: string }[];
  players2: { id: number; name: string; flag: string }[];
  match_series: string;
  match_event: string;
  event_logo: string;
  match_date: string;
  match_time: string;
  unix_timestamp: string;
  rounds: string;
};

export type SingleUpcomingMatchData = {
  data: {
    status: number;
    segments: SingleUpcomingMatchSegment[];
  };
};

export type AllUpcomingMatchSegment = {
  team1: string;
  team2: string;
  flag1: string;
  flag2: string;
  match_series: string;
  match_event: string;
  unix_timestamp: string;
  match_page: string;
};

export type AllUpcomingMatchesData = {
  data: {
    status: number;
    segments: AllUpcomingMatchSegment[];
  };
};

export type SingleLiveMatchData = {
  data: {
    status: number;
    is_live: boolean;
    segments: SingleLiveMatchSegment[];
  };
};

export type SingleLiveMatchSegment = {
  team1: string;
  team2: string;
  logo1: string;
  logo2: string;
  match_series: string;
  match_event: string;
  event_logo: string;
  match_date: string;
  match_time: string;
  team1_score: string;
  team2_score: string;
  team_picks: string;
  rounds: Round[];
};

export type AllLiveMatchesData = {
  data: {
    status: number;
    segments: AllLiveMatchSegment[];
  };
};

export type AllLiveMatchSegment = {
  team1: string;
  team2: string;
  flag1: string;
  flag2: string;
  match_series: string;
  match_event: string;
  match_page: string;
};

export type AllMatchResults = {
  data: {
    status: number;
    segments: AllMatchResultSegment[];
  };
};

export type AllMatchResultSegment = {
  team1: string;
  team2: string;
  score1: string;
  score2: string;
  flag1: string;
  flag2: string;
  match_series: string;
  match_event: string;
  time_completed: string;
  match_page: string;
  tournament_icon: string;
};

export type SingleMatchResult = {
  data: {
    status: number;
    segments: SingleMatchResultSegment[];
  };
};

export type SingleMatchResultSegment = {
  team1: string;
  team2: string;
  logo1: string;
  logo2: string;
  team1_short: string;
  team2_short: string;
  match_series: string;
  match_event: string;
  event_logo: string;
  team1_score: string;
  team2_score: string;
  team_picks: string;
  rounds: Round[];
};

type Round = {
  round: string;
  map_name: string | null;
  map_duration: string | null;
  team1_round_score: string | null;
  team2_round_score: string | null;
  team1_stats: PlayerStat[];
  team2_stats: PlayerStat[];
};

export type PlayerStat = {
  name: string;
  flag: string;
  agents: string[];
  rating: string;
  acs: string;
  k: string;
  d: string;
  a: string;
  diff_k_d: string;
  kast: string;
  adr: string;
  hs: string;
  fk: string;
  fd: string;
  diff_fk_fd: string;
};

export enum PageType {
  UPCOMING = 'Upcoming',
  LIVE = 'Live',
  RESULTS = 'Results',
}

export type PredictionType = {
  winPred: string;
  team1ScorePred: string;
  team2ScorePred: string;
  superTeam: Player[];
};

export type Player = {
  id: string;
  name: string;
  team: 'A' | 'B';
  teamName: string;
  teamLogo: string;
  teamShort: string;
  flag: string;
};
