import { SingleMatchResultSegment, PredictionType } from './types.js';
import { Devvit } from '@devvit/public-api';

export function calculateSuperteamStats(
  data: SingleMatchResultSegment,
  userPreds: { userId: string; prediction: PredictionType }[]
) {
  const roundData = data.rounds.find((r) => r.round === 'All') || data.rounds[0];

  const allPlayers = [
    ...roundData.team1_stats.map((player) => ({ ...player, teamShort: data.team1_short })),
    ...roundData.team2_stats.map((player) => ({ ...player, teamShort: data.team2_short })),
  ].map((player) => {
    const k = parseInt(player.k, 10) || 0;
    const d = parseInt(player.d, 10) || 0;
    const a = parseInt(player.a, 10) || 0;
    const acs = parseFloat(player.acs) || 0;

    const rawScore = k * 2 + a - d;
    const finalScore = rawScore * (acs / 100);

    return { name: player.name, teamShort: player.teamShort, score: finalScore };
  });

  const superteamPlayers = allPlayers.sort((a, b) => b.score - a.score).slice(0, 5);
  const superteamNames = new Set(superteamPlayers.map((player) => player.name));

  const totalUsers = userPreds.length;
  const correctPicks = userPreds.filter((user) => {
    const userTeam = new Set(user.prediction.superTeam.map((player) => player.name));
    return (
      superteamNames.size === userTeam.size &&
      [...superteamNames].every((name) => userTeam.has(name))
    );
  }).length;

  const pickedByPercent =
    totalUsers > 0 ? `${Math.round((correctPicks / totalUsers) * 100)}%` : '0%';

  return {
    pickedByCount: correctPicks,
    pickedByPercent,
    players: superteamPlayers.map((player) => ({
      name: player.name,
      teamShort: player.teamShort,
    })),
  };
}

export function calculateWinPredictions(
  userPreds: { userId: string; prediction: PredictionType }[]
) {
  const totalUsers = userPreds.length;

  const scorePredCounts: Record<string, { count: number; team: string }> = {};
  userPreds.forEach((pred) => {
    const score = `${pred.prediction.team1ScorePred}-${pred.prediction.team2ScorePred}`;
    const team = pred.prediction.winPred;

    if (!scorePredCounts[score]) {
      scorePredCounts[score] = { count: 0, team };
    }
    scorePredCounts[score].count += 1;
  });

  const winPredictions = Object.entries(scorePredCounts).map(([score, { count, team }]) => ({
    score,
    team,
    pickedByCount: count,
    pickedByPercent: totalUsers > 0 ? `${Math.round((count / totalUsers) * 100)}%` : '0%',
  }));

  return winPredictions;
}

export function calculatePlayerPickRates(
  data: SingleMatchResultSegment,
  userPreds: { userId: string; prediction: PredictionType }[]
) {
  const totalUsers = userPreds.length;

  const allPlayers = [
    ...data.rounds[0].team1_stats.map((player) => ({
      name: player.name,
      teamShort: data.team1_short,
    })),
    ...data.rounds[0].team2_stats.map((player) => ({
      name: player.name,
      teamShort: data.team2_short,
    })),
  ];

  const playerPickCounts: Record<string, { count: number; teamShort: string }> = {};
  allPlayers.forEach((player) => {
    playerPickCounts[player.name] = { count: 0, teamShort: player.teamShort };
  });

  userPreds.forEach((pred) => {
    pred.prediction.superTeam.forEach((player) => {
      if (playerPickCounts[player.name]) {
        playerPickCounts[player.name].count += 1;
      }
    });
  });

  const playerPickRates = Object.entries(playerPickCounts)
    .map(([name, { count, teamShort }]) => ({
      name,
      teamShort,
      pickedByCount: count,
      pickedByPercent: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
    }))
    .sort((a, b) => b.pickedByCount - a.pickedByCount); // descending order

  return playerPickRates;
}

export function getPerfectPredictors(
  data: SingleMatchResultSegment,
  userPreds: { userId: string; prediction: PredictionType }[]
) {
  const roundData = data.rounds.find((r) => r.round === 'All') || data.rounds[0];
  if (!roundData) return [];

  const actualScore = `${data.team1_score}-${data.team2_score}`;

  const allPlayers = [
    ...roundData.team1_stats.map((player) => ({
      name: player.name,
      teamShort: data.team1_short,
      k: parseInt(player.k, 10) || 0,
      d: parseInt(player.d, 10) || 0,
      a: parseInt(player.a, 10) || 0,
      acs: parseFloat(player.acs) || 0,
    })),
    ...roundData.team2_stats.map((player) => ({
      name: player.name,
      teamShort: data.team2_short,
      k: parseInt(player.k, 10) || 0,
      d: parseInt(player.d, 10) || 0,
      a: parseInt(player.a, 10) || 0,
      acs: parseFloat(player.acs) || 0,
    })),
  ];

  const scoredPlayers = allPlayers.map((player) => {
    const rawScore = player.k * 2 + player.a - player.d;
    const finalScore = rawScore * (player.acs / 100);
    return { name: player.name, teamShort: player.teamShort, score: finalScore };
  });

  const superteam = scoredPlayers.sort((a, b) => b.score - a.score).slice(0, 5);
  const superteamNames = new Set(superteam.map((player) => player.name));

  const perfectUsers = userPreds
    .filter(({ prediction }) => {
      const userScore = `${prediction.team1ScorePred}-${prediction.team2ScorePred}`;
      if (userScore !== actualScore) return false;

      const userTeam = new Set(prediction.superTeam.map((player) => player.name));
      return (
        superteamNames.size === userTeam.size &&
        [...superteamNames].every((name) => userTeam.has(name))
      );
    })
    .map(({ userId }) => userId);

  return perfectUsers;
}

export async function getUsernamesFromIds(context: Devvit.Context, userIds: string[]) {
  return await Promise.all(
    userIds.map(async (userId) => {
      const user = await context.reddit.getUserById(userId);
      if (user) {
        return { userId, username: user.username };
      }
      return { userId, username: undefined };
    })
  );
}
