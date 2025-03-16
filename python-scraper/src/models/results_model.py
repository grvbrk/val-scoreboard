from pydantic import BaseModel


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
    team1_stats: list[PlayerStat]
    team2_stats: list[PlayerStat]


class SingleMatchResultSegment(BaseModel):
    team1: str
    team2: str
    rounds: list[Round]


class SingleMatchResultData(BaseModel):
    status: int
    segments: list[SingleMatchResultSegment]


class SingleMatchResultResponse(BaseModel):
    data: SingleMatchResultData


class AllMatchResultSegment(BaseModel):
    team1: str
    team2: str
    score1: str
    score2: str
    match_page: str


class AllMatchResultsData(BaseModel):
    status: int
    segments: list[AllMatchResultSegment]


class AllMatchResultsResponse(BaseModel):
    data: AllMatchResultsData
