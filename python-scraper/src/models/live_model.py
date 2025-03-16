from pydantic import BaseModel


class Rounds(BaseModel):
    round: str
    map_name: str
    map_duration: str
    team1_round_score: str
    team2_round_score: str


class LiveMatchSegment(BaseModel):
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
    rounds: list[Rounds]


class LiveMatchData(BaseModel):
    status: int
    segments: list[LiveMatchSegment]


class LiveMatchResponse(BaseModel):
    data: LiveMatchData
