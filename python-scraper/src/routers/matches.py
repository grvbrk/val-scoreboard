from fastapi import APIRouter
from src.scrapers.matches.match_scraper import (
    scrape_upcoming_matches,
    scrape_live_matches,
    scrape_all_match_results,
)
from src.models.live_model import LiveMatchResponse
from src.models.upcoming_model import UpcomingMatchResponse
from src.models.results_model import MatchResultsResponse

router = APIRouter()


@router.get("/match/upcoming")
async def get_matches() -> UpcomingMatchResponse:
    return scrape_upcoming_matches()


@router.get("/match/live")
async def get_matches() -> LiveMatchResponse:
    return scrape_live_matches()


@router.get("/match/results")
async def get_matches() -> MatchResultsResponse:
    return scrape_all_match_results()
