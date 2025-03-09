from pydantic import BaseModel, HttpUrl
from datetime import datetime


class PlayerStat(BaseModel):
    name: str
    agents: list[str]
    rating: int
    ACS: int
    K: int
    D: int
    A: int
    Diff_K_D: int
    KAST: str
    ADR: str
    HS: str
    FK: int
    FD: int
    Diff_FK_FD: int


class MapStat(BaseModel):
    team_1: list[PlayerStat]
    team_2: list[PlayerStat]


class stats(BaseModel):
    all_maps: MapStat
    map_1: MapStat
    map_2: MapStat
    map_3: MapStat | None
    map_4: MapStat | None
    map_5: MapStat | None


class LiveMatchSegment(BaseModel):
    team1: str
    team2: str
    flag1: str
    flag2: str
    team1_logo: HttpUrl
    team2_logo: HttpUrl
    map_stats: stats
    map_number: int
    current_map: str
    time_until_match: str
    match_event: str
    match_series: str
    unix_timestamp: datetime
    match_page: HttpUrl


class LiveMatchData(BaseModel):
    status: int
    segments: list[LiveMatchSegment]


class LiveMatchResponse(BaseModel):
    data: LiveMatchData
