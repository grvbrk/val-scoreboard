import { UpcomingMatchesType } from './types.js';

export const upcoming_matches: UpcomingMatchesType = {
  'data': {
    'status': 200,
    'segments': [
      {
        'team1': 'Joblife',
        'team2': 'Eternal Fire',
        'flag1': 'flag_eu',
        'flag2': 'flag_tr',
        'time_until_match': '2h 7m from now',
        'match_series': 'Group Stage: Day 3',
        'match_event': 'Challengers League 2025 EMEA #1',
        'unix_timestamp': '2025-03-05 19:00:00',
        'match_page':
          'https://www.vlr.gg/454041/joblife-vs-eternal-fire-challengers-league-2025-emea-1-d3',
      },
      {
        'team1': 'FOKUS',
        'team2': 'DNSTY',
        'flag1': 'flag_de',
        'flag2': 'flag_it',
        'time_until_match': '2h 7m from now',
        'match_series': 'Group Stage: Day 3',
        'match_event': 'Challengers League 2025 EMEA #1',
        'unix_timestamp': '2025-03-05 19:00:00',
        'match_page': 'https://www.vlr.gg/454047/fokus-vs-dnsty-challengers-league-2025-emea-1-d3',
      },
      {
        'team1': 'Zen eSports',
        'team2': 'OXEN',
        'flag1': 'flag_ar',
        'flag2': 'flag_cl',
        'time_until_match': '2h 7m from now',
        'match_series': 'Regular Phase: Week 1',
        'match_event': 'Challengers League 2025 LATAM South ACE: Stage 1',
        'unix_timestamp': '2025-03-05 19:00:00',
        'match_page':
          'https://www.vlr.gg/455782/zen-esports-vs-oxen-challengers-league-2025-latam-south-ace-stage-1-w1',
      },
      {
        'team1': 'Zerance Holy Mint',
        'team2': 'G2 Gozen',
        'flag1': 'flag_fr',
        'flag2': 'flag_eu',
        'time_until_match': '2h 7m from now',
        'match_series': 'Group Stage: Week 4',
        'match_event': 'Game Changers 2025 EMEA: Stage 1',
        'unix_timestamp': '2025-03-05 19:00:00',
        'match_page':
          'https://www.vlr.gg/449619/zerance-holy-mint-vs-g2-gozen-game-changers-2025-emea-stage-1-w4',
      },
    ],
  },
};

export const live_match = {
  'data': {
    'status': 200,
    'segments': [
      {
        'team1': 'G2 Esports',
        'team2': 'T1',
        'flag1': 'flag_us',
        'flag2': 'flag_kr',
        'team1_logo': 'https://owcdn.net/img/633822848a741.png',
        'team2_logo': 'https://owcdn.net/img/62fe0b8f6b084.png',
        'score1': '0',
        'score2': '0',
        'team1_round_ct': 'N/A',
        'team1_round_t': '0',
        'team2_round_ct': '0',
        'team2_round_t': 'N/A',
        'map_number': '1',
        'current_map': 'Lotus',
        'time_until_match': 'LIVE',
        'match_event': 'Champions Tour 2025: Masters Bangkok',
        'match_series': 'Playoffs: Grand Final',
        'unix_timestamp': '2025-03-02 11:15:00',
        'match_page':
          'https://www.vlr.gg/449011/g2-esports-vs-t1-champions-tour-2025-masters-bangkok-gf',
      },
    ],
  },
};

export const match_results = {
  'data': {
    'status': 200,
    'segments': [
      {
        'team1': 'Team International',
        'team2': 'Team Thailand',
        'score1': '9',
        'score2': '13',
        'flag1': 'flag_un',
        'flag2': 'flag_th',
        'time_completed': '1h 18m ago',
        'round_info': 'Showmatch-Main Event',
        'tournament_name': 'Champions Tour 2025: Masters Bangkok',
        'match_page':
          '/450589/team-international-vs-team-thailand-champions-tour-2025-masters-bangkok-main-event',
        'tournament_icon': 'https://owcdn.net/img/603bfd7bf3f54.png',
      },
      {
        'team1': 'EDward Gaming',
        'team2': 'T1',
        'score1': '1',
        'score2': '3',
        'flag1': 'flag_cn',
        'flag2': 'flag_kr',
        'time_completed': '1d 1h ago',
        'round_info': 'Playoffs-Lower Final',
        'tournament_name': 'Champions Tour 2025: Masters Bangkok',
        'match_page': '/449013/edward-gaming-vs-t1-champions-tour-2025-masters-bangkok-lbf',
        'tournament_icon': 'https://owcdn.net/img/603bfd7bf3f54.png',
      },
    ],
  },
};
