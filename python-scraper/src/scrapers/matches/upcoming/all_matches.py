import requests
from bs4 import BeautifulSoup


def scrape_upcoming_matches():
    url = "https://www.vlr.gg"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    }

    results = []

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return {"data": {"status": response.status_code, "segments": results}}

    soup = BeautifulSoup(response.text, "html.parser")

    matches = soup.select(".js-home-matches-upcoming a.wf-module-item")
    for match in matches:
        is_upcoming = match.select_one(".h-match-eta.mod-upcoming")
        if is_upcoming:

            teams = []
            for team in match.select(".h-match-team"):
                teams_el = team.select_one(".h-match-team-name")
                teams.append(teams_el.getText().strip())

                # flag_el = team.select_one(".flag")
                # flags.append(
                #     "".join(flag_el.get("class"))
                #     .replace("mod-16", "")
                #     .replace("mod", "")
                #     if flag_el
                #     else "N/A"
                # )

                # score_el = team.select_one(".h-match-team-score")
                # scores.append(score_el.getText().strip() if score_el else "N/A")

            # eta_el = match.select_one(".h-match-eta")
            # eta = eta_el.getText().strip() if eta_el else "TBD"
            # if eta != "LIVE":
            #     eta += " from now"

            # match_event_elem = match.select_one(".h-match-preview-event")
            # match_event = (
            #     match_event_elem.getText().strip() if match_event_elem else "Unknown"
            # )

            # match_series_elem = match.select_one(".h-match-preview-series")
            # match_series = (
            #     match_series_elem.getText().strip() if match_series_elem else "Unknown"
            # )

            # timestamp_elem = match.select_one(".moment-tz-convert")
            # timestamp = (
            #     datetime.fromtimestamp(
            #         int(timestamp_elem["data-utc-ts"]), tz=timezone.utc
            #     ).strftime("%Y-%m-%d %H:%M:%S")
            #     if timestamp_elem
            #     else "Unknown"
            # )

            url_path = "https://www.vlr.gg/" + match.get("href")
            # response = requests.get(url_path, headers=headers)
            # if response.status_code != 200:
            #     return {"data": {"status": response.status_code, "segments": results}}

            # match_soup = BeautifulSoup(response.text, "html.parser")
            # team_shorts = match_soup.select("div.ge-text-light")
            # print(team_shorts)
            # team1_short = team_shorts[0].getText().strip()
            # team2_short = team_shorts[5].getText().strip()

            results.append(
                {
                    "team1": teams[0] if len(teams) > 0 else "Unknown",
                    "team2": teams[1] if len(teams) > 1 else "Unknown",
                    # "flag1": flags[0] if len(flags) > 0 else "Unknown",
                    # "flag2": flags[1] if len(flags) > 1 else "Unknown",
                    # "team1_short": team1_short,
                    # "team2_short": team2_short,
                    # "time_until_match": eta,
                    # "match_series": match_series,
                    # "match_event": match_event,
                    # "unix_timestamp": timestamp,
                    "match_page": url_path,
                }
            )

    return {"data": {"status": response.status_code, "segments": results}}
