from pydantic import BaseModel, HttpUrl


class PlayerStat(BaseModel):
    name: str
    flag: str
    agents: list[str]
    rating: str
    acs: str
    k: str
    d: str
    a: str
    diff_k_d: str
    kast: str
    adr: str
    hs: str
    fk: str
    fd: str
    diff_fk_fd: str


class Round(BaseModel):
    round: str
    map_name: str | None
    map_duration: str | None
    team1_round_score: str | None
    team2_round_score: str | None
    team1_stats: list[PlayerStat]
    team2_stats: list[PlayerStat]


class SingleLiveMatchSegment(BaseModel):
    team1: str
    team2: str
    logo1: str
    logo2: str
    match_series: str
    match_event: str
    event_logo: str
    match_date: str
    match_time: str
    team1_score: str
    team2_score: str
    team_picks: str
    rounds: list[Round]


class SingleLiveMatchData(BaseModel):
    status: int
    is_live: bool
    segments: list[SingleLiveMatchSegment]


class SingleLiveMatchResponse(BaseModel):
    data: SingleLiveMatchData


class AllLiveMatchSegment(BaseModel):
    team1: str
    team2: str
    flag1: str
    flag2: str
    match_series: str
    match_event: str
    match_page: HttpUrl


class AllLiveMatchesData(BaseModel):
    status: int
    segments: list[AllLiveMatchSegment]


class AllLiveMatchesResponse(BaseModel):
    data: AllLiveMatchesData
