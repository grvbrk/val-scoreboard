from pydantic import BaseModel, HttpUrl


class PlayerInfo(BaseModel):
    id: int
    name: str
    flag: str


class SingleUpcomingMatchSegment(BaseModel):
    team1: str
    team2: str
    logo1: str
    logo2: str
    team1_short: str
    team2_short: str
    players1: list[PlayerInfo]
    players2: list[PlayerInfo]
    match_series: str
    match_event: str
    event_logo: str
    match_date: str
    match_time: str
    unix_timestamp: str
    rounds: str


class SingleUpcomingMatchData(BaseModel):
    status: int
    segments: list[SingleUpcomingMatchSegment]


class SingleUpcomingMatchResponse(BaseModel):
    data: SingleUpcomingMatchData


class AllUpcomingMatchSegment(BaseModel):
    team1: str
    team2: str
    match_page: HttpUrl


class AllUpcomingMatchesData(BaseModel):
    status: int
    segments: list[AllUpcomingMatchSegment]


class AllUpcomingMatchesResponse(BaseModel):
    data: AllUpcomingMatchesData
