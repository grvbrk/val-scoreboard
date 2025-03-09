from pydantic import BaseModel, HttpUrl


class MatchResultSegment(BaseModel):
    team1: str
    team2: str
    score1: int
    score2: int
    flag1: str
    flag2: str
    time_completed: str
    round_info: str
    tournament_name: str
    match_page: str
    tournament_icon: HttpUrl


class MatchResultData(BaseModel):
    status: int
    segments: list[MatchResultSegment]


class MatchResultsResponse(BaseModel):
    data: MatchResultData
