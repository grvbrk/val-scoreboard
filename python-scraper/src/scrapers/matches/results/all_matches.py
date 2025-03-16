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
        team1 = team_array[0].getText().strip()
        team2 = team_array[1].getText().strip()

        match_page = "https://www.vlr.gg/" + match.get("href")

        scores = match.select("div.match-item-vs-team-score")
        score1 = scores[0].getText().strip()
        score2 = scores[1].getText().strip()

        results.append(
            {
                "team1": team1,
                "team2": team2,
                "score1": score1,
                "score2": score2,
                "match_page": match_page,
            }
        )

    return {"data": {"status": response.status_code, "segments": results}}
