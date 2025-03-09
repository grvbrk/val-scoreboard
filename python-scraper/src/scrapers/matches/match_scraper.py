import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from bs4 import BeautifulSoup
from datetime import datetime, timezone
import time
from src.models.upcoming_model import UpcomingMatchResponse


# with open("soup_output.html", "w", encoding="utf-8") as f:
#     f.write(soup.prettify())

options = Options()
service = Service()
options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
driver = webdriver.Chrome(options=options, service=service)


def scrape_upcoming_matches() -> UpcomingMatchResponse:
    url = "https://www.vlr.gg"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    }

    results = []

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return {"data": {"status": response.status_code, "segments": results}}

    soup = BeautifulSoup(response.text, "html.parser")

    for item in soup.select(".js-home-matches-upcoming a.wf-module-item"):
        is_upcoming = item.select_one(".h-match-eta.mod-upcoming")
        if is_upcoming:
            teams, flags, scores = [], [], []

            for team in item.select(".h-match-team"):
                teams_el = team.select_one(".h-match-team-name")
                teams.append(teams_el.getText().strip())

                flag_el = team.select_one(".flag")
                flags.append(
                    "".join(flag_el.get("class"))
                    .replace("mod-16", "")
                    .replace("mod", "")
                    if flag_el
                    else "N/A"
                )

                score_el = team.select_one(".h-match-team-score")
                scores.append(score_el.getText().strip() if score_el else "N/A")

            eta_el = item.select_one(".h-match-eta")
            eta = eta_el.getText().strip() if eta_el else "TBD"
            if eta != "LIVE":
                eta += " from now"

            match_event_elem = item.select_one(".h-match-preview-event")
            match_event = (
                match_event_elem.getText().strip() if match_event_elem else "Unknown"
            )

            match_series_elem = item.select_one(".h-match-preview-series")
            match_series = (
                match_series_elem.getText().strip() if match_series_elem else "Unknown"
            )

            timestamp_elem = item.select_one(".moment-tz-convert")
            timestamp = (
                datetime.fromtimestamp(
                    int(timestamp_elem["data-utc-ts"]), tz=timezone.utc
                ).strftime("%Y-%m-%d %H:%M:%S")
                if timestamp_elem
                else "Unknown"
            )

            url_path = f"https://www.vlr.gg/{item.get("href")}"

            results.append(
                {
                    "team1": teams[0] if len(teams) > 0 else "Unknown",
                    "team2": teams[1] if len(teams) > 1 else "Unknown",
                    "flag1": flags[0] if len(flags) > 0 else "Unknown",
                    "flag2": flags[1] if len(flags) > 1 else "Unknown",
                    "time_until_match": eta,
                    "match_series": match_series,
                    "match_event": match_event,
                    "unix_timestamp": timestamp,
                    "match_page": url_path,
                }
            )

    return {"data": {"status": response.status_code, "segments": results}}


def scrape_live_matches():
    url = "https://www.vlr.gg"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    }

    results = []
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return {"data": {"status": response.status_code, "segments": results}}

    soup = BeautifulSoup(response.text, "html.parser")
    current_matches = soup.select(".js-home-matches-upcoming a.wf-module-item")
    for match in current_matches:
        is_match_live = match.select_one(".h-match-eta.mod-live")
        if is_match_live:
            live_match_url = "https://www.vlr.gg/" + match.get("href")

            driver.get(url=live_match_url)
            tabs = driver.find_elements(
                By.CLASS_NAME, "vm-stats-gamesnav-item.mod-active"
            )

            for i, tab in enumerate(tabs):
                try:
                    print(f"Clicking tab {i+1}")
                    driver.execute_script("arguments[0].scrollIntoView();", tab)
                    ActionChains(driver).move_to_element(tab).click().perform()
                    time.sleep(2)

                    map_soup = BeautifulSoup(driver.page_source, "html.parser")
                    all_maps_container = map_soup.select_one(".vm-stats-container")
                    stats_tables = all_maps_container.select(".wf-table-inset")[:2]
                    all_maps_stats = {"team1": {}, "team2": {}}

                    for idx, table in enumerate(stats_tables):
                        trs = table.find("tbody").find_all("tr")
                        for id, tr in enumerate(trs):
                            tds = tr.find_all("td")
                            print(tds[0].select_one("div.text-of").get_text().strip())
                            # for index, td in enumerate(tds):
                            #     print(f"td index : {index + 1}")
                            #     player_name = (
                            #         td.select_one("div.text-of").get_text().strip()
                            #     )
                            #     all_maps_stats["team1"]["name"] = player_name
                            #     print(player_name)

                except Exception as e:
                    driver.quit()
                    print(e)
                    return {"data": {"status": 404, "segments": []}}

            driver.quit()
        else:
            return {"data": {"status": 200, "segments": results}}
    return {"data": {"status": 200, "segments": results}}


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

    item = soup.select("a.wf-module-item")[0]
    match_url = "https://www.vlr.gg/" + item.get("href")
    response = requests.get(match_url, headers=headers)
    if response.status_code != 200:
        return {"data": {"status": response.status_code, "segments": results}}

    match_soup = BeautifulSoup(response.text, "html.parser")
    stats = {
        "all_rounds": {
            "team1": {},
            "team2": {},
        },
        "round1": {
            "round_info": {},
            "team1": {},
            "team2": {},
        },
        "round2": {
            "round_info": {},
            "team1": {},
            "team2": {},
        },
        "round3": {
            "round_info": {},
            "team1": {},
            "team2": {},
        },
        "round4": {
            "round_info": {},
            "team1": {},
            "team2": {},
        },
        "round5": {
            "round_info": {},
            "team1": {},
            "team2": {},
        },
    }
    rounds = match_soup.select("div.vm-stats-game")
    for idx, round in enumerate(rounds):
        match idx:
            case 0:
                """Round 1"""
                stats["round1"]["round_info"]["map_name"] = (
                    round.select_one("div.map > div > span")
                    .getText()
                    .replace("PICK", "")
                    .strip()
                )
                stats["round1"]["round_info"]["map_duration"] = (
                    round.select_one(".map-duration").getText().strip()
                )

                team_tables = round.select("table")
                team1_table = team_tables[0]
                team2_table = team_tables[1]

                team1_players = team1_table.select("tbody tr")
                team2_players = team2_table.select("tbody tr")

                for players in team1_players:
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                player_name = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stats["round1"]["team1"][player_name] = {}
                                stats["round1"]["team1"][player_name]["country"] = (
                                    "".join(
                                        single_stat.select_one("i").get("class")
                                    ).replace("mod", "")
                                )
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stats["round1"]["team1"][player_name][
                                    "agents"
                                ] = agents_list
                            case 2:
                                # class="mod-stat"
                                stats["round1"]["team1"][player_name]["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stats["round1"]["team1"][player_name]["ACS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stats["round1"]["team1"][player_name]["K"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stats["round1"]["team1"][player_name]["D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stats["round1"]["team1"][player_name]["A"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stats["round1"]["team1"][player_name]["Diff_K_D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stats["round1"]["team1"][player_name]["KAST"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stats["round1"]["team1"][player_name]["ADR"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stats["round1"]["team1"][player_name]["HS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stats["round1"]["team1"][player_name]["FK"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stats["round1"]["team1"][player_name]["FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stats["round1"]["team1"][player_name]["Diff_FK_FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

                for players in team2_players:
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                player_name = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stats["round1"]["team2"][player_name] = {}
                                stats["round1"]["team2"][player_name]["country"] = (
                                    "".join(
                                        single_stat.select_one("i").get("class")
                                    ).replace("mod", "")
                                )
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stats["round1"]["team2"][player_name][
                                    "agents"
                                ] = agents_list
                            case 2:
                                # class="mod-stat"
                                stats["round1"]["team2"][player_name]["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stats["round1"]["team2"][player_name]["ACS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stats["round1"]["team2"][player_name]["K"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stats["round1"]["team2"][player_name]["D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stats["round1"]["team2"][player_name]["A"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stats["round1"]["team2"][player_name]["Diff_K_D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stats["round1"]["team2"][player_name]["KAST"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stats["round1"]["team2"][player_name]["ADR"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stats["round1"]["team2"][player_name]["HS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stats["round1"]["team2"][player_name]["FK"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stats["round1"]["team2"][player_name]["FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stats["round1"]["team2"][player_name]["Diff_FK_FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

            case 1:
                """All Rounds"""
                team_tables = round.select("table")
                team1_table = team_tables[0]
                team2_table = team_tables[1]

                team1_players = team1_table.select("tbody tr")
                team2_players = team2_table.select("tbody tr")

                for players in team1_players:
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                player_name = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stats["all_rounds"]["team1"][player_name] = {}
                                stats["all_rounds"]["team1"][player_name]["country"] = (
                                    "".join(
                                        single_stat.select_one("i").get("class")
                                    ).replace("mod", "")
                                )
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stats["all_rounds"]["team1"][player_name][
                                    "agents"
                                ] = agents_list
                            case 2:
                                # class="mod-stat"
                                stats["all_rounds"]["team1"][player_name]["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stats["all_rounds"]["team1"][player_name]["ACS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stats["all_rounds"]["team1"][player_name]["K"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stats["all_rounds"]["team1"][player_name]["D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stats["all_rounds"]["team1"][player_name]["A"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stats["all_rounds"]["team1"][player_name][
                                    "Diff_K_D"
                                ] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stats["all_rounds"]["team1"][player_name]["KAST"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stats["all_rounds"]["team1"][player_name]["ADR"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stats["all_rounds"]["team1"][player_name]["HS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stats["all_rounds"]["team1"][player_name]["FK"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stats["all_rounds"]["team1"][player_name]["FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stats["all_rounds"]["team1"][player_name][
                                    "Diff_FK_FD"
                                ] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

                for players in team2_players:
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                player_name = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stats["all_rounds"]["team2"][player_name] = {}
                                stats["all_rounds"]["team2"][player_name]["country"] = (
                                    "".join(
                                        single_stat.select_one("i").get("class")
                                    ).replace("mod", "")
                                )
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stats["all_rounds"]["team2"][player_name][
                                    "agents"
                                ] = agents_list
                            case 2:
                                # class="mod-stat"
                                stats["all_rounds"]["team2"][player_name]["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stats["all_rounds"]["team2"][player_name]["ACS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stats["all_rounds"]["team2"][player_name]["K"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stats["all_rounds"]["team2"][player_name]["D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stats["all_rounds"]["team2"][player_name]["A"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stats["all_rounds"]["team2"][player_name][
                                    "Diff_K_D"
                                ] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stats["all_rounds"]["team2"][player_name]["KAST"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stats["all_rounds"]["team2"][player_name]["ADR"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stats["all_rounds"]["team2"][player_name]["HS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stats["all_rounds"]["team2"][player_name]["FK"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stats["all_rounds"]["team2"][player_name]["FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stats["all_rounds"]["team2"][player_name][
                                    "Diff_FK_FD"
                                ] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

            case 2:
                """Round 2"""
                stats["round2"]["round_info"]["map_name"] = (
                    round.select_one("div.map > div > span")
                    .getText()
                    .replace("PICK", "")
                    .strip()
                )
                stats["round2"]["round_info"]["map_duration"] = (
                    round.select_one(".map-duration").getText().strip()
                )

                team_tables = round.select("table")
                team1_table = team_tables[0]
                team2_table = team_tables[1]

                team1_players = team1_table.select("tbody tr")
                team2_players = team2_table.select("tbody tr")

                for players in team1_players:
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                player_name = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stats["round2"]["team1"][player_name] = {}
                                stats["round2"]["team1"][player_name]["country"] = (
                                    "".join(
                                        single_stat.select_one("i").get("class")
                                    ).replace("mod", "")
                                )
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stats["round2"]["team1"][player_name][
                                    "agents"
                                ] = agents_list
                            case 2:
                                # class="mod-stat"
                                stats["round2"]["team1"][player_name]["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stats["round2"]["team1"][player_name]["ACS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stats["round2"]["team1"][player_name]["K"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stats["round2"]["team1"][player_name]["D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stats["round2"]["team1"][player_name]["A"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stats["round2"]["team1"][player_name]["Diff_K_D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stats["round2"]["team1"][player_name]["KAST"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stats["round2"]["team1"][player_name]["ADR"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stats["round2"]["team1"][player_name]["HS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stats["round2"]["team1"][player_name]["FK"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stats["round2"]["team1"][player_name]["FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stats["round2"]["team1"][player_name]["Diff_FK_FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

                for players in team2_players:
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                player_name = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stats["round2"]["team2"][player_name] = {}
                                stats["round2"]["team2"][player_name]["country"] = (
                                    "".join(
                                        single_stat.select_one("i").get("class")
                                    ).replace("mod", "")
                                )
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stats["round2"]["team2"][player_name][
                                    "agents"
                                ] = agents_list
                            case 2:
                                # class="mod-stat"
                                stats["round2"]["team2"][player_name]["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stats["round2"]["team2"][player_name]["ACS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stats["round2"]["team2"][player_name]["K"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stats["round2"]["team2"][player_name]["D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stats["round2"]["team2"][player_name]["A"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stats["round2"]["team2"][player_name]["Diff_K_D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stats["round2"]["team2"][player_name]["KAST"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stats["round2"]["team2"][player_name]["ADR"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stats["round2"]["team2"][player_name]["HS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stats["round2"]["team2"][player_name]["FK"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stats["round2"]["team2"][player_name]["FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stats["round2"]["team2"][player_name]["Diff_FK_FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

            case 3:
                """Round 3"""
                stats["round3"]["round_info"]["map_name"] = (
                    round.select_one("div.map > div > span")
                    .getText()
                    .replace("PICK", "")
                    .strip()
                )
                stats["round3"]["round_info"]["map_duration"] = (
                    round.select_one(".map-duration").getText().strip()
                )

                team_tables = round.select("table")
                team1_table = team_tables[0]
                team2_table = team_tables[1]

                team1_players = team1_table.select("tbody tr")
                team2_players = team2_table.select("tbody tr")

                for players in team1_players:
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                player_name = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stats["round3"]["team1"][player_name] = {}
                                stats["round3"]["team1"][player_name]["country"] = (
                                    "".join(
                                        single_stat.select_one("i").get("class")
                                    ).replace("mod", "")
                                )
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stats["round3"]["team1"][player_name][
                                    "agents"
                                ] = agents_list
                            case 2:
                                # class="mod-stat"
                                stats["round3"]["team1"][player_name]["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stats["round3"]["team1"][player_name]["ACS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stats["round3"]["team1"][player_name]["K"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stats["round3"]["team1"][player_name]["D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stats["round3"]["team1"][player_name]["A"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stats["round3"]["team1"][player_name]["Diff_K_D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stats["round3"]["team1"][player_name]["KAST"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stats["round3"]["team1"][player_name]["ADR"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stats["round3"]["team1"][player_name]["HS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stats["round3"]["team1"][player_name]["FK"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stats["round3"]["team1"][player_name]["FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stats["round3"]["team1"][player_name]["Diff_FK_FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

                for players in team2_players:
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                player_name = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stats["round3"]["team2"][player_name] = {}
                                stats["round3"]["team2"][player_name]["country"] = (
                                    "".join(
                                        single_stat.select_one("i").get("class")
                                    ).replace("mod", "")
                                )
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stats["round3"]["team2"][player_name][
                                    "agents"
                                ] = agents_list
                            case 2:
                                # class="mod-stat"
                                stats["round3"]["team2"][player_name]["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stats["round3"]["team2"][player_name]["ACS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stats["round3"]["team2"][player_name]["K"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stats["round3"]["team2"][player_name]["D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stats["round3"]["team2"][player_name]["A"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stats["round3"]["team2"][player_name]["Diff_K_D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stats["round3"]["team2"][player_name]["KAST"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stats["round3"]["team2"][player_name]["ADR"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stats["round3"]["team2"][player_name]["HS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stats["round3"]["team2"][player_name]["FK"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stats["round3"]["team2"][player_name]["FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stats["round3"]["team2"][player_name]["Diff_FK_FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

            case 4:
                """Round 4"""
                stats["round4"]["round_info"]["map_name"] = (
                    round.select_one("div.map > div > span")
                    .getText()
                    .replace("PICK", "")
                    .strip()
                )
                stats["round4"]["round_info"]["map_duration"] = (
                    round.select_one(".map-duration").getText().strip()
                )

                team_tables = round.select("table")
                team1_table = team_tables[0]
                team2_table = team_tables[1]

                team1_players = team1_table.select("tbody tr")
                team2_players = team2_table.select("tbody tr")

                for players in team1_players:
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                player_name = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stats["round4"]["team1"][player_name] = {}
                                stats["round4"]["team1"][player_name]["country"] = (
                                    "".join(
                                        single_stat.select_one("i").get("class")
                                    ).replace("mod", "")
                                )
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stats["round4"]["team1"][player_name][
                                    "agents"
                                ] = agents_list
                            case 2:
                                # class="mod-stat"
                                stats["round4"]["team1"][player_name]["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stats["round4"]["team1"][player_name]["ACS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stats["round4"]["team1"][player_name]["K"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stats["round4"]["team1"][player_name]["D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stats["round4"]["team1"][player_name]["A"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stats["round4"]["team1"][player_name]["Diff_K_D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stats["round4"]["team1"][player_name]["KAST"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stats["round4"]["team1"][player_name]["ADR"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stats["round4"]["team1"][player_name]["HS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stats["round4"]["team1"][player_name]["FK"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stats["round4"]["team1"][player_name]["FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stats["round4"]["team1"][player_name]["Diff_FK_FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

                for players in team2_players:
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                player_name = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stats["round4"]["team2"][player_name] = {}
                                stats["round4"]["team2"][player_name]["country"] = (
                                    "".join(
                                        single_stat.select_one("i").get("class")
                                    ).replace("mod", "")
                                )
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stats["round4"]["team2"][player_name][
                                    "agents"
                                ] = agents_list
                            case 2:
                                # class="mod-stat"
                                stats["round4"]["team2"][player_name]["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stats["round4"]["team2"][player_name]["ACS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stats["round4"]["team2"][player_name]["K"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stats["round4"]["team2"][player_name]["D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stats["round4"]["team2"][player_name]["A"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stats["round4"]["team2"][player_name]["Diff_K_D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stats["round4"]["team2"][player_name]["KAST"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stats["round4"]["team2"][player_name]["ADR"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stats["round4"]["team2"][player_name]["HS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stats["round4"]["team2"][player_name]["FK"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stats["round4"]["team2"][player_name]["FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stats["round4"]["team2"][player_name]["Diff_FK_FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

            case 5:
                """Round 5"""
                stats["round5"]["round_info"]["map_name"] = (
                    round.select_one("div.map > div > span")
                    .getText()
                    .replace("PICK", "")
                    .strip()
                )
                stats["round5"]["round_info"]["map_duration"] = (
                    round.select_one(".map-duration").getText().strip()
                )

                team_tables = round.select("table")
                team1_table = team_tables[0]
                team2_table = team_tables[1]

                team1_players = team1_table.select("tbody tr")
                team2_players = team2_table.select("tbody tr")

                for players in team1_players:
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                player_name = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stats["round5"]["team1"][player_name] = {}
                                stats["round5"]["team1"][player_name]["country"] = (
                                    "".join(
                                        single_stat.select_one("i").get("class")
                                    ).replace("mod", "")
                                )
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stats["round5"]["team1"][player_name][
                                    "agents"
                                ] = agents_list
                            case 2:
                                # class="mod-stat"
                                stats["round5"]["team1"][player_name]["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stats["round5"]["team1"][player_name]["ACS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stats["round5"]["team1"][player_name]["K"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stats["round5"]["team1"][player_name]["D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stats["round5"]["team1"][player_name]["A"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stats["round5"]["team1"][player_name]["Diff_K_D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stats["round5"]["team1"][player_name]["KAST"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stats["round5"]["team1"][player_name]["ADR"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stats["round5"]["team1"][player_name]["HS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stats["round5"]["team1"][player_name]["FK"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stats["round5"]["team1"][player_name]["FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stats["round5"]["team1"][player_name]["Diff_FK_FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

                for players in team2_players:
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                player_name = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stats["round5"]["team2"][player_name] = {}
                                stats["round5"]["team2"][player_name]["country"] = (
                                    "".join(
                                        single_stat.select_one("i").get("class")
                                    ).replace("mod", "")
                                )
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stats["round5"]["team2"][player_name][
                                    "agents"
                                ] = agents_list
                            case 2:
                                # class="mod-stat"
                                stats["round5"]["team2"][player_name]["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stats["round5"]["team2"][player_name]["ACS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stats["round5"]["team2"][player_name]["K"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stats["round5"]["team2"][player_name]["D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stats["round5"]["team2"][player_name]["A"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stats["round5"]["team2"][player_name]["Diff_K_D"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stats["round5"]["team2"][player_name]["KAST"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stats["round5"]["team2"][player_name]["ADR"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stats["round5"]["team2"][player_name]["HS"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stats["round5"]["team2"][player_name]["FK"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stats["round5"]["team2"][player_name]["FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stats["round5"]["team2"][player_name]["Diff_FK_FD"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

    print(stats)
    return {"data": {"status": response.status_code, "segments": results}}
