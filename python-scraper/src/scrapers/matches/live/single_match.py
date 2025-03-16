import requests
from datetime import datetime, timedelta
from bs4 import BeautifulSoup


def scrape_single_live_match(url: str):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    }

    results = []

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return {"data": {"status": response.status_code, "segments": results}}

    soup = BeautifulSoup(response.text, "html.parser")

    match_info = soup.select_one("div.match-header")

    match_series = (
        match_info.select_one("a.match-header-event > div > div:nth-of-type(1)")
        .getText()
        .strip()
    )
    match_event = (
        match_info.select_one("a.match-header-event div.match-header-event-series")
        .getText()
        .strip()
        .replace("\n", "")
        .replace("\t", "")
    )

    utc_string = match_info.select_one(
        "div.match-header-date > div:nth-of-type(2)"
    ).get("data-utc-ts")

    match_time = (
        datetime.strptime(utc_string, "%Y-%m-%d %H:%M:%S") + timedelta(hours=4)
    ).strftime("%-I:%M %p UTC")

    match_date = (
        match_info.select_one("div.match-header-date > div:nth-of-type(1)")
        .getText()
        .strip()
    )

    match_series_logo = match_info.select_one("a.match-header-event img").get("src")

    teams = match_info.select(".match-header-vs .match-header-link-name .wf-title-med")
    team1_name = teams[0].getText().strip()
    team2_name = teams[1].getText().strip()

    team_logos = match_info.select(".match-header-link img")
    team1_logo = team_logos[0].get("src")
    team2_logo = team_logos[1].get("src")

    scores = match_info.select("div.match-header-vs-score .js-spoiler span")
    team1_score = scores[0].getText().strip()
    team2_score = scores[2].getText().strip()

    # _________________________________________ #

    rounds_arr = []

    rounds = soup.select("div.vm-stats-game")
    for idx, round in enumerate(rounds):
        match idx:
            case 0:
                """Round 1"""
                map_name = (
                    round.select_one("div.map > div > span")
                    .getText()
                    .replace("PICK", "")
                    .strip()
                )
                map_duration = round.select_one(".map-duration").getText().strip()

                teams = round.select("div.team")
                team1 = teams[0]
                team2 = teams[1]

                team1_round_score = team1.select_one(".score").getText().strip()
                team2_round_score = team2.select_one(".score").getText().strip()

                rounds_arr.append(
                    {
                        "round": "1",
                        "map_name": map_name,
                        "map_duration": map_duration,
                        "team1_score": team1_round_score,
                        "team2_score": team2_round_score,
                    }
                )

            case 1:
                """All"""
                continue

            case 2:
                """Round 2"""
                map_name = (
                    round.select_one("div.map > div > span")
                    .getText()
                    .replace("PICK", "")
                    .strip()
                )
                map_duration = round.select_one(".map-duration").getText().strip()

                teams = round.select("div.team")
                team1 = teams[0]
                team2 = teams[1]

                team1_round_score = team1.select_one(".score").getText().strip()
                team2_round_score = team2.select_one(".score").getText().strip()

                rounds_arr.append(
                    {
                        "round": "2",
                        "map_name": map_name,
                        "map_duration": map_duration,
                        "team1_score": team1_round_score,
                        "team2_score": team2_round_score,
                    }
                )

            case 3:
                """Round 3"""
                map_name = (
                    round.select_one("div.map > div > span")
                    .getText()
                    .replace("PICK", "")
                    .strip()
                )
                map_duration = round.select_one(".map-duration").getText().strip()

                teams = round.select("div.team")
                team1 = teams[0]
                team2 = teams[1]

                team1_round_score = team1.select_one(".score").getText().strip()
                team2_round_score = team2.select_one(".score").getText().strip()

                rounds_arr.append(
                    {
                        "round": "3",
                        "map_name": map_name,
                        "map_duration": map_duration,
                        "team1_score": team1_round_score,
                        "team2_score": team2_round_score,
                    }
                )

            case 4:
                """Round 4"""
                map_name = (
                    round.select_one("div.map > div > span")
                    .getText()
                    .replace("PICK", "")
                    .strip()
                )
                map_duration = round.select_one(".map-duration").getText().strip()

                teams = round.select("div.team")
                team1 = teams[0]
                team2 = teams[1]

                team1_round_score = team1.select_one(".score").getText().strip()
                team2_round_score = team2.select_one(".score").getText().strip()

                rounds_arr.append(
                    {
                        "round": "4",
                        "map_name": map_name,
                        "map_duration": map_duration,
                        "team1_score": team1_round_score,
                        "team2_score": team2_round_score,
                    }
                )

            case 5:
                """Round 5"""
                map_name = (
                    round.select_one("div.map > div > span")
                    .getText()
                    .replace("PICK", "")
                    .strip()
                )
                map_duration = round.select_one(".map-duration").getText().strip()

                teams = round.select("div.team")
                team1 = teams[0]
                team2 = teams[1]

                team1_round_score = team1.select_one(".score").getText().strip()
                team2_round_score = team2.select_one(".score").getText().strip()

                rounds_arr.append(
                    {
                        "round": "5",
                        "map_name": map_name,
                        "map_duration": map_duration,
                        "team1_score": team1_round_score,
                        "team2_score": team2_round_score,
                    }
                )

    results.append(
        {
            "team1": team1_name,
            "team2": team2_name,
            "logo1": team1_logo,
            "logo2": team2_logo,
            "match_series": match_series,
            "match_event": match_event,
            "event_logo": match_series_logo,
            "match_date": match_date,
            "match_time": match_time,
            "team1_score": team1_score,
            "team2_score": team2_score,
            "rounds": rounds_arr,
        }
    )

    return {"data": {"status": response.status_code, "segments": results}}
