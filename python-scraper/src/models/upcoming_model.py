from pydantic import BaseModel, HttpUrl
from datetime import datetime


class UpcomingMatchSegment(BaseModel):
    team1: str
    team2: str
    flag1: str
    flag2: str
    time_until_match: str
    match_series: str
    match_event: str
    unix_timestamp: datetime
    match_page: HttpUrl


class UpcomingMatchData(BaseModel):
    status: int
    segments: list[UpcomingMatchSegment]


class UpcomingMatchResponse(BaseModel):
    data: UpcomingMatchData
