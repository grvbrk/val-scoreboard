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
        return {
            "data": {
                "status": response.status_code,
                "is_live": False,
                "segments": results,
            }
        }

    soup = BeautifulSoup(response.text, "html.parser")

    match_info = soup.select_one("div.match-header")

    is_live = False
    is_live_el = match_info.select_one("span.match-header-vs-note.mod-live")
    if is_live_el and is_live_el.getText().strip() == "live":
        is_live = True

    if not is_live:
        return {
            "data": {
                "status": response.status_code,
                "is_live": False,
                "segments": results,
            }
        }

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
    team1_name = teams[0].getText().strip().replace("\n", "").replace("\t", "")
    team2_name = teams[1].getText().strip().replace("\n", "").replace("\t", "")

    team_logos = match_info.select(".match-header-link img")
    team1_logo = team_logos[0].get("src")
    team2_logo = team_logos[1].get("src")

    scores = match_info.select("div.match-header-vs-score .js-spoiler span")
    team1_score = scores[0].getText().strip()
    team2_score = scores[2].getText().strip()

    team_picks_el = match_info.select_one(".match-header-note")
    team_picks = team_picks_el.getText().strip() if team_picks_el else ""

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

                team_tables = round.select("table")
                team1_table = team_tables[0]
                team2_table = team_tables[1]

                team1_players = team1_table.select("tbody tr")
                team2_players = team2_table.select("tbody tr")

                team1_player_stats = []
                team2_player_stats = []

                for players in team1_players:
                    stat = {}
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                stat["name"] = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stat["flag"] = "".join(
                                    single_stat.select_one("i").get("class")
                                ).replace("mod", "")
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stat["agents"] = agents_list
                            case 2:
                                # class="mod-stat"
                                stat["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stat["acs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stat["k"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stat["d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stat["a"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stat["diff_k_d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stat["kast"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stat["adr"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stat["hs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stat["fk"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stat["fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stat["diff_fk_fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

                    team1_player_stats.append(stat)

                for players in team2_players:
                    stat = {}
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                stat["name"] = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stat["flag"] = "".join(
                                    single_stat.select_one("i").get("class")
                                ).replace("mod", "")
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stat["agents"] = agents_list
                            case 2:
                                # class="mod-stat"
                                stat["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stat["acs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stat["k"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stat["d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stat["a"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stat["diff_k_d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stat["kast"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stat["adr"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stat["hs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stat["fk"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stat["fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stat["diff_fk_fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

                    team2_player_stats.append(stat)

                rounds_arr.append(
                    {
                        "round": "1",
                        "map_name": map_name,
                        "map_duration": map_duration,
                        "team1_round_score": team1_round_score,
                        "team2_round_score": team2_round_score,
                        "team1_stats": team1_player_stats,
                        "team2_stats": team2_player_stats,
                    }
                )

            case 1:
                """All"""
                team_tables = round.select("table")
                team1_table = team_tables[0]
                team2_table = team_tables[1]

                team1_players = team1_table.select("tbody tr")
                team2_players = team2_table.select("tbody tr")

                team1_player_stats = []
                team2_player_stats = []

                for players in team1_players:
                    stat = {}
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                stat["name"] = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stat["flag"] = "".join(
                                    single_stat.select_one("i").get("class")
                                ).replace("mod", "")
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stat["agents"] = agents_list
                            case 2:
                                # class="mod-stat"
                                stat["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stat["acs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stat["k"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stat["d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stat["a"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stat["diff_k_d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stat["kast"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stat["adr"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stat["hs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stat["fk"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stat["fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stat["diff_fk_fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

                    team1_player_stats.append(stat)

                for players in team2_players:
                    stat = {}
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                stat["name"] = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stat["flag"] = "".join(
                                    single_stat.select_one("i").get("class")
                                ).replace("mod", "")
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stat["agents"] = agents_list
                            case 2:
                                # class="mod-stat"
                                stat["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stat["acs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stat["k"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stat["d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stat["a"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stat["diff_k_d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stat["kast"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stat["adr"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stat["hs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stat["fk"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stat["fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stat["diff_fk_fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

                    team2_player_stats.append(stat)

                rounds_arr.insert(
                    0,
                    {
                        "round": "all",
                        "map_name": None,
                        "map_duration": None,
                        "team1_round_score": None,
                        "team2_round_score": None,
                        "team1_stats": team1_player_stats,
                        "team2_stats": team2_player_stats,
                    },
                )

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

                team_tables = round.select("table")
                team1_table = team_tables[0]
                team2_table = team_tables[1]

                team1_players = team1_table.select("tbody tr")
                team2_players = team2_table.select("tbody tr")

                team1_player_stats = []
                team2_player_stats = []

                for players in team1_players:
                    stat = {}
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                stat["name"] = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stat["flag"] = "".join(
                                    single_stat.select_one("i").get("class")
                                ).replace("mod", "")
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stat["agents"] = agents_list
                            case 2:
                                # class="mod-stat"
                                stat["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stat["acs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stat["k"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stat["d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stat["a"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stat["diff_k_d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stat["kast"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stat["adr"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stat["hs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stat["fk"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stat["fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stat["diff_fk_fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

                    team1_player_stats.append(stat)

                for players in team2_players:
                    stat = {}
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                stat["name"] = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stat["flag"] = "".join(
                                    single_stat.select_one("i").get("class")
                                ).replace("mod", "")
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stat["agents"] = agents_list
                            case 2:
                                # class="mod-stat"
                                stat["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stat["acs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stat["k"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stat["d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stat["a"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stat["diff_k_d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stat["kast"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stat["adr"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stat["hs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stat["fk"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stat["fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stat["diff_fk_fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

                    team2_player_stats.append(stat)

                rounds_arr.append(
                    {
                        "round": "2",
                        "map_name": map_name,
                        "map_duration": map_duration,
                        "team1_round_score": team1_round_score,
                        "team2_round_score": team2_round_score,
                        "team1_stats": team1_player_stats,
                        "team2_stats": team2_player_stats,
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

                team_tables = round.select("table")
                team1_table = team_tables[0]
                team2_table = team_tables[1]

                team1_players = team1_table.select("tbody tr")
                team2_players = team2_table.select("tbody tr")

                team1_player_stats = []
                team2_player_stats = []

                for players in team1_players:
                    stat = {}
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                stat["name"] = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stat["flag"] = "".join(
                                    single_stat.select_one("i").get("class")
                                ).replace("mod", "")
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stat["agents"] = agents_list
                            case 2:
                                # class="mod-stat"
                                stat["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stat["acs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stat["k"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stat["d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stat["a"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stat["diff_k_d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stat["kast"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stat["adr"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stat["hs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stat["fk"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stat["fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stat["diff_fk_fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

                    team1_player_stats.append(stat)

                for players in team2_players:
                    stat = {}
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                stat["name"] = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stat["flag"] = "".join(
                                    single_stat.select_one("i").get("class")
                                ).replace("mod", "")
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stat["agents"] = agents_list
                            case 2:
                                # class="mod-stat"
                                stat["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stat["acs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stat["k"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stat["d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stat["a"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stat["diff_k_d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stat["kast"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stat["adr"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stat["hs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stat["fk"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stat["fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stat["diff_fk_fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

                    team2_player_stats.append(stat)

                rounds_arr.append(
                    {
                        "round": "3",
                        "map_name": map_name,
                        "map_duration": map_duration,
                        "team1_round_score": team1_round_score,
                        "team2_round_score": team2_round_score,
                        "team1_stats": team1_player_stats,
                        "team2_stats": team2_player_stats,
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

                team_tables = round.select("table")
                team1_table = team_tables[0]
                team2_table = team_tables[1]

                team1_players = team1_table.select("tbody tr")
                team2_players = team2_table.select("tbody tr")

                team1_player_stats = []
                team2_player_stats = []

                for players in team1_players:
                    stat = {}
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                stat["name"] = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stat["flag"] = "".join(
                                    single_stat.select_one("i").get("class")
                                ).replace("mod", "")
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stat["agents"] = agents_list
                            case 2:
                                # class="mod-stat"
                                stat["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stat["acs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stat["k"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stat["d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stat["a"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stat["diff_k_d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stat["kast"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stat["adr"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stat["hs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stat["fk"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stat["fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stat["diff_fk_fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

                    team1_player_stats.append(stat)

                for players in team2_players:
                    stat = {}
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                stat["name"] = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stat["flag"] = "".join(
                                    single_stat.select_one("i").get("class")
                                ).replace("mod", "")
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stat["agents"] = agents_list
                            case 2:
                                # class="mod-stat"
                                stat["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stat["acs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stat["k"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stat["d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stat["a"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stat["diff_k_d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stat["kast"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stat["adr"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stat["hs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stat["fk"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stat["fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stat["diff_fk_fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

                    team2_player_stats.append(stat)

                rounds_arr.append(
                    {
                        "round": "4",
                        "map_name": map_name,
                        "map_duration": map_duration,
                        "team1_round_score": team1_round_score,
                        "team2_round_score": team2_round_score,
                        "team1_stats": team1_player_stats,
                        "team2_stats": team2_player_stats,
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

                team_tables = round.select("table")
                team1_table = team_tables[0]
                team2_table = team_tables[1]

                team1_players = team1_table.select("tbody tr")
                team2_players = team2_table.select("tbody tr")

                team1_player_stats = []
                team2_player_stats = []

                for players in team1_players:
                    stat = {}
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                stat["name"] = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stat["flag"] = "".join(
                                    single_stat.select_one("i").get("class")
                                ).replace("mod", "")
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stat["agents"] = agents_list
                            case 2:
                                # class="mod-stat"
                                stat["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stat["acs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stat["k"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stat["d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stat["a"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stat["diff_k_d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stat["kast"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stat["adr"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stat["hs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stat["fk"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stat["fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stat["diff_fk_fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

                    team1_player_stats.append(stat)

                for players in team2_players:
                    stat = {}
                    player_stats = players.select("td")
                    for i, single_stat in enumerate(player_stats):
                        match i:
                            case 0:
                                # class="mod-player"
                                stat["name"] = (
                                    single_stat.select_one(".text-of").getText().strip()
                                )
                                stat["flag"] = "".join(
                                    single_stat.select_one("i").get("class")
                                ).replace("mod", "")
                            case 1:
                                # class="mod-agents"
                                agents_list = []
                                agents = single_stat.select("span.mod-agent")
                                for agent in agents:
                                    agents_list.append(
                                        agent.select_one("img").get("title").strip()
                                    )
                                stat["agents"] = agents_list
                            case 2:
                                # class="mod-stat"
                                stat["rating"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 3:
                                # class="mod-stat"
                                stat["acs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 4:
                                # class="mod-stat mod-vlr-kills"
                                stat["k"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 5:
                                # class="mod-stat mod-vlr-deaths"
                                stat["d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 6:
                                # class="mod-stat mod-vlr-assists"
                                stat["a"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 7:
                                # class="mod-stat mod-kd-diff"
                                stat["diff_k_d"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 8:
                                # class="mod-stat"
                                stat["kast"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 9:
                                # class="mod-stat"
                                stat["adr"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 10:
                                # class="mod-stat"
                                stat["hs"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 11:
                                # class="mod-stats mod-fb"
                                stat["fk"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 12:
                                # class="mod-stats mod-fd"
                                stat["fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )
                            case 13:
                                # class="mod-stats mod-fk-diff"
                                stat["diff_fk_fd"] = (
                                    single_stat.select_one("span.mod-both")
                                    .getText()
                                    .strip()
                                )

                    team2_player_stats.append(stat)

                rounds_arr.append(
                    {
                        "round": "5",
                        "map_name": map_name,
                        "map_duration": map_duration,
                        "team1_round_score": team1_round_score,
                        "team2_round_score": team2_round_score,
                        "team1_stats": team1_player_stats,
                        "team2_stats": team2_player_stats,
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
            "team_picks": team_picks,
            "rounds": rounds_arr,
        }
    )

    return {
        "data": {
            "status": response.status_code,
            "is_live": is_live,
            "segments": results,
        }
    }
