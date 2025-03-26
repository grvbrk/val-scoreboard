from fastapi import APIRouter, Query
from typing import Annotated
from src.scrapers.matches.upcoming.all_matches import scrape_all_upcoming_matches
from src.scrapers.matches.upcoming.single_match import scrape_single_upcoming_match
from src.scrapers.matches.live.all_matches import scrape_all_live_matches
from src.scrapers.matches.live.single_match import scrape_single_live_match
from src.scrapers.matches.results.all_matches import scrape_all_match_results
from src.scrapers.matches.results.single_match import scrape_single_match_result
from src.models.live_model import AllLiveMatchesResponse, SingleLiveMatchResponse
from src.models.upcoming_model import (
    AllUpcomingMatchesResponse,
    SingleUpcomingMatchResponse,
)
from src.models.results_model import AllMatchResultsResponse, SingleMatchResultResponse


router = APIRouter()


@router.get("/match/upcoming/all")
async def get_matches() -> AllUpcomingMatchesResponse:
    return scrape_all_upcoming_matches()


@router.get("/match/upcoming/single")
async def get_matches(
    url: Annotated[
        str | None,
        Query(
            title="match url",
            description="vlr.gg match url for scraping upcoming match data",
            regex=r"^https:\/\/www\.vlr\.gg\/\d+\/[\w-]+\/?$",
        ),
    ] = None,
) -> SingleUpcomingMatchResponse:
    return scrape_single_upcoming_match(url)


@router.get("/match/live/all")
async def get_matches() -> AllLiveMatchesResponse:
    return scrape_all_live_matches()


@router.get("/match/live/single")
async def get_matches(
    url: Annotated[
        str | None,
        Query(
            title="match url",
            description="vlr.gg match url for scraping live match data",
            regex=r"^https:\/\/www\.vlr\.gg\/\d+\/[\w-]+\/?$",
        ),
    ] = None,
) -> SingleLiveMatchResponse:
    return scrape_single_live_match(url)


@router.get("/match/results/all")
async def get_matches() -> AllMatchResultsResponse:
    return scrape_all_match_results()


@router.get("/match/results/single")
async def get_matches(
    url: Annotated[
        str | None,
        Query(
            title="match url",
            description="vlr.gg match url for scraping match results",
            regex=r"^https:\/\/www\.vlr\.gg\/\d+\/[\w-]+\/?$",
        ),
    ] = None,
) -> SingleMatchResultResponse:
    return scrape_single_match_result(url)
