import requests
from datetime import datetime, timedelta
from bs4 import BeautifulSoup


def get_ordinal(n):
    return (
        f"{n}{'th' if 11 <= n <= 13 else {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')}"
    )


def scrape_single_upcoming_match(url: str):
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

    unix_timestamp = (
        datetime.strptime(utc_string, "%Y-%m-%d %H:%M:%S") + timedelta(hours=4)
    ).strftime("%Y-%m-%d %H:%M:%S")

    match_time = (
        datetime.strptime(utc_string, "%Y-%m-%d %H:%M:%S") + timedelta(hours=4)
    ).strftime("%-I:%M %p UTC")

    match_date = (
        match_info.select_one("div.match-header-date > div:nth-of-type(1)")
        .getText()
        .strip()
    )

    match_series_logo = match_info.select_one("a.match-header-event img").get("src")
    match_total_rounds = (
        match_info.select_one("div.match-header-vs-score > div:nth-of-type(3)")
        .getText()
        .strip()
    )

    teams = match_info.select(
        ".match-header-link .match-header-link-name .wf-title-med"
    )
    team1 = teams[0].getText().strip()
    team2 = teams[1].getText().strip()

    team_logos = match_info.select(".match-header-link img")
    team1_logo = team_logos[0].get("src")
    team2_logo = team_logos[1].get("src")

    # _________________________________________ #

    players_info = soup.select("div.vm-stats-game")[0].select("table")
    team1_players = players_info[0].select("tbody tr")
    team2_players = players_info[1].select("tbody tr")

    team1_short = team1_players[0].select_one(".ge-text-light").getText().strip()
    team2_short = team2_players[0].select_one(".ge-text-light").getText().strip()

    players1 = []
    players2 = []

    for idx, player in enumerate(team1_players):
        name = player.select_one(".text-of").getText().strip()
        player_flag = "".join(player.select_one("i").get("class")).replace("mod", "")
        players1.append({"id": idx + 1, "name": name, "flag": player_flag})

    for idx, player in enumerate(team2_players):
        name = player.select_one(".text-of").getText().strip()
        player_flag = "".join(player.select_one("i").get("class")).replace("mod", "")
        players2.append({"id": idx + 1, "name": name, "flag": player_flag})

    results.append(
        {
            "team1": team1,
            "team2": team2,
            "logo1": team1_logo,
            "logo2": team2_logo,
            "team1_short": team1_short,
            "team2_short": team2_short,
            "players1": players1,
            "players2": players2,
            "match_series": match_series,
            "match_event": match_event,
            "event_logo": match_series_logo,
            "match_date": match_date,
            "match_time": match_time,
            "unix_timestamp": unix_timestamp,
            "rounds": match_total_rounds,
        }
    )
    return {"data": {"status": response.status_code, "segments": results}}
