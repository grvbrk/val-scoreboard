import SuperteamSelector from '../components/SuperTeamSelector';
import MatchPredictor from '../components/MatchPredictor';
import { Player, PredictionType, SingleUpcomingMatchSegment } from '../../src/core/types';
import { useState } from 'react';
import { sendToDevvit } from '../utils';

export const PredictionPage = ({
  upcomingMatchData,
  userPreds,
}: {
  postId: string;
  upcomingMatchData: SingleUpcomingMatchSegment;
  userPreds: PredictionType | null;
}) => {
  const { players1, players2, team1, team1_short, team2, team2_short, logo1, logo2, event_logo } =
    upcomingMatchData;

  const [hasUserSelected, setHasUserSelected] = useState<boolean>(userPreds ? true : false);
  const [score1, setScore1] = useState<string>(userPreds?.team1ScorePred || '0');
  const [score2, setScore2] = useState<string>(userPreds?.team2ScorePred || '0');
  const [team1Wins, setTeam1Wins] = useState<boolean>(
    userPreds ? userPreds.winPred === team1 : false
  );
  const selectedPlayerIds = new Set(userPreds?.superTeam.map((p) => p.id) ?? []);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([
    ...players1
      .filter((player) => !selectedPlayerIds.has(`1${player.id}`))
      .map((player) => ({
        id: `1${player.id}`,
        name: player.name,
        team: 'A' as const,
        teamLogo: logo1,
        teamName: team1,
        teamShort: team1_short,
        flag: player.flag,
      })),
    ...players2
      .filter((player) => !selectedPlayerIds.has(`2${player.id}`))
      .map((player) => ({
        id: `2${player.id}`,
        name: player.name,
        team: 'B' as const,
        teamLogo: logo2,
        teamName: team2,
        teamShort: team2_short,
        flag: player.flag,
      })),
  ]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>(userPreds?.superTeam ?? []);

  function handleSubmitTeam() {
    const userPred = {
      winPred: team1Wins ? team1 : team2,
      team1ScorePred: score1,
      team2ScorePred: score2,
      superTeam: selectedPlayers,
    };
    sendToDevvit({
      type: 'SEND_USER_PREDS',
      payload: userPred,
    });
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="container mx-auto">
        <div className="mb-8 flex flex-col items-center">
          <img src={event_logo} alt="Event Logo" className="mb-4 h-16" />
          <h1 className="mb-4 bg-gradient-to-r from-red-500 to-red-500 bg-clip-text text-center text-5xl font-bold text-transparent">
            VALORANT SUPERTEAM
          </h1>
          <div className="mx-auto mb-4 h-1 w-40 bg-gradient-to-r from-red-500 to-red-600"></div>
          <p className="mx-auto mb-2 max-w-2xl text-center text-neutral-400">
            {upcomingMatchData.match_series}
          </p>
          <p className="mx-auto mb-6 max-w-2xl text-center font-semibold text-neutral-300">
            {upcomingMatchData.match_event} • {upcomingMatchData.match_date} •{' '}
            {upcomingMatchData.match_time} • {upcomingMatchData.rounds}
          </p>

          <p className="mx-auto max-w-2xl text-center text-neutral-400">
            {`Create your ultimate superteam by selecting 5 players from the available pool. Click to select players and submit your team to compete!`}
          </p>
        </div>

        <MatchPredictor
          upcomingMatchData={upcomingMatchData}
          score1={score1}
          setScore1={setScore1}
          score2={score2}
          setScore2={setScore2}
          team1Wins={team1Wins}
          setTeam1Wins={setTeam1Wins}
          hasUserSelected={hasUserSelected}
        />
        <SuperteamSelector
          upcomingMatchData={upcomingMatchData}
          availablePlayers={availablePlayers}
          setAvailablePlayers={setAvailablePlayers}
          selectedPlayers={selectedPlayers}
          setSelectedPlayers={setSelectedPlayers}
          handleSubmitTeam={handleSubmitTeam}
          hasUserSelected={hasUserSelected}
          setHasUserSelected={setHasUserSelected}
          team1wins={team1Wins}
          score1={score1}
          score2={score2}
          team1_short={team1_short}
          team2_short={team2_short}
          logo1={logo1}
          logo2={logo2}
        />
      </div>
    </main>
  );
};
