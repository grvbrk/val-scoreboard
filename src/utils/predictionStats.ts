import { PredictionType } from 'src/core/types.js';

export function generatePlayerPickRates(preds: PredictionType[] | null) {
  if (!preds) return null;
  const playerPickCount: Record<string, number> = {};
  const teamWinCount: Record<string, number> = {};
  const totalPredictions = preds.length;

  preds.forEach(({ winPred, superTeam }) => {
    teamWinCount[winPred] = (teamWinCount[winPred] || 0) + 1;

    superTeam.forEach(({ name }) => {
      playerPickCount[name] = (playerPickCount[name] || 0) + 1;
    });
  });

  const playerPickRates = Object.entries(playerPickCount).map(([name, count]) => ({
    name,
    pickRate: Math.round((count / totalPredictions) * 100) + '%',
  }));

  const teamWinRates = Object.entries(teamWinCount).map(([team, count]) => ({
    team,
    winRate: Math.round((count / totalPredictions) * 100) + '%',
  }));

  return playerPickRates;
}
