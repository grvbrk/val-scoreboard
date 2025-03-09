from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import Annotated, Literal

# import logging

# logging.basicConfig(
#     level=logging.INFO, format=" %(asctime)s - %(levelname)s- %(message)s"
# )
router = APIRouter()


class StatsParams(BaseModel):
    region: Annotated[
        Literal["na", "eu", "ap", "sa", "jp", "oce", "mn"],
        Field(description="Region shortname"),
    ]
    timespan: Annotated[str, Field(description="Timespan (30, 60, 90, or all)")]


@router.get("/stats")
async def get_stats(params: Annotated[StatsParams, Query()]):
    return params
