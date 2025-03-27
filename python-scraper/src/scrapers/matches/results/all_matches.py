import requests
from bs4 import BeautifulSoup


def scrape_all_match_results():
    url = "https://www.vlr.gg/matches/results"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    }

    results = []
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return {"data": {"status": response.status_code, "segments": results}}

    soup = BeautifulSoup(response.text, "html.parser")

    matches = soup.select("a.wf-module-item")
    for match in matches:
        team_array = match.select("div.match-item-vs .text-of")
        team1 = team_array[0].getText().strip().replace("\n", "").replace("\t", "")
        team2 = team_array[1].getText().strip().replace("\n", "").replace("\t", "")

        match_page = "https://www.vlr.gg" + match.get("href")

        scores = match.select("div.match-item-vs-team-score")
        score1 = scores[0].getText().strip()
        score2 = scores[1].getText().strip()

        flags = match.select(".match-item-vs-team .flag")

        flag1 = "".join(flags[0].get("class")).replace("mod-16", "").replace("mod", "")
        flag2 = "".join(flags[1].get("class")).replace("mod-16", "").replace("mod", "")

        match_series = (
            match.select_one(".match-item-event .match-item-event-series")
            .getText()
            .strip()
        )

        match_event = (
            match.select_one(".match-item-event")
            .getText()
            .strip()
            .replace("\t", " ")
            .strip()
            .split("\n")[1]
            .strip()
        )

        time_completed = match.select_one(".ml-eta").getText().strip() + " ago"
        tournament_icon = match.select_one(".match-item-icon img").get("src")

        results.append(
            {
                "team1": team1,
                "team2": team2,
                "score1": score1,
                "score2": score2,
                "flag1": flag1,
                "flag2": flag2,
                "match_series": match_series,
                "match_event": match_event,
                "time_completed": time_completed,
                "match_page": match_page,
                "tournament_icon": tournament_icon,
            }
        )

    return {"data": {"status": response.status_code, "segments": results}}
