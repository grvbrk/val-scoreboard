import { cn } from '../utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { SingleUpcomingMatchSegment } from '../../src/core/types';

type MatchPredictorType = {
  upcomingMatchData: SingleUpcomingMatchSegment;
  score1: string;
  setScore1: React.Dispatch<React.SetStateAction<string>>;
  score2: string;
  setScore2: React.Dispatch<React.SetStateAction<string>>;
  team1Wins: boolean;
  setTeam1Wins: React.Dispatch<React.SetStateAction<boolean>>;
  hasUserSelected: boolean;
};

export default function MatchPredictor({
  upcomingMatchData,
  score1,
  setScore1,
  score2,
  setScore2,
  team1Wins,
  setTeam1Wins,
  hasUserSelected,
}: MatchPredictorType) {
  const { team1, team2, logo1, logo2, team1_short, team2_short, rounds } = upcomingMatchData;
  let maxRounds;
  const totalRounds = parseInt(rounds.includes('Map') ? rounds[0] : rounds[2]);
  if (totalRounds === 1) {
    maxRounds = 1;
  } else if (totalRounds === 3) {
    maxRounds = 2;
  } else maxRounds = 3;

  const handleScoreChange = (team: '1' | '2', value: string) => {
    if (!/^\d*$/.test(value)) return;

    let numValue = value === '' ? 0 : Number.parseInt(value);

    if (numValue > maxRounds) {
      numValue = maxRounds;
    }

    const limitedValue = numValue.toString();

    if (team === '1') {
      setScore1(limitedValue);
      if (numValue > parseInt(score2)) {
        setTeam1Wins(true);
      } else if (numValue < parseInt(score2)) {
        setTeam1Wins(false);
      }
    } else {
      setScore2(limitedValue);
      if (numValue > parseInt(score1)) {
        setTeam1Wins(false);
      } else if (numValue < parseInt(score1)) {
        setTeam1Wins(true);
      }
    }
  };
  return (
    <Card className="border-almond text-charcoal bg-almond relative mx-auto mb-8 max-w-md backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-center text-red-600">Match Prediction</CardTitle>
        <CardDescription className="text-charcoal text-center">
          Predict the score for the upcoming match
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center justify-center gap-2 font-medium">
          <span className={team1Wins ? 'text-red-600' : ''}>{team1_short} wins</span>
          <Switch
            disabled={hasUserSelected}
            checked={!team1Wins}
            onCheckedChange={(checked) => {
              setTeam1Wins(!checked);
              const tempScore = score1;
              setScore1(score2);
              setScore2(tempScore);
            }}
          />
          <span className={!team1Wins ? 'text-red-600' : ''}>{team2_short} wins</span>
        </div>

        <div className="grid grid-cols-5 items-center gap-4">
          <div className="col-span-2 flex flex-col items-center gap-2">
            <div
              className={cn(
                'w-/ rounded-lg p-2 transition-colors',
                team1Wins ? 'bg-primary' : 'bg-primary/30'
              )}
            >
              <img src={logo1} alt={team1} width={64} height={64} className="mx-auto" />
            </div>
            <Label className="text-center font-medium">{team1}</Label>
          </div>

          <div className="col-span-1 flex items-center justify-center">
            <span className="text-xl font-bold">VS</span>
          </div>

          <div className="col-span-2 flex flex-col items-center gap-2">
            <div
              className={cn(
                'rounded-lg p-2 transition-colors',
                !team1Wins ? 'bg-primary' : 'bg-primary/30'
              )}
            >
              <img src={logo2} alt={team2} width={64} height={64} className="mx-auto" />
            </div>
            <Label className="text-center font-medium">{team2}</Label>
          </div>

          <div className="col-span-2 mt-4">
            <div className="flex justify-center">
              <Input
                disabled={hasUserSelected}
                type="text"
                value={score1}
                onChange={(e) => handleScoreChange('1', e.target.value)}
                className="w-16 text-center text-lg font-bold"
                maxLength={2}
              />
            </div>
          </div>

          <div className="col-span-1" />

          <div className="col-span-2 mt-4">
            <div className="flex justify-center">
              <Input
                disabled={hasUserSelected}
                type="text"
                value={score2}
                onChange={(e) => handleScoreChange('2', e.target.value)}
                className="w-16 text-center text-lg font-bold"
                maxLength={2}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm">
          {team1Wins
            ? `You ${hasUserSelected ? 'predicted' : 'predict'} ${team1} will win ${score1}-${score2}`
            : `You ${hasUserSelected ? 'predicted' : 'predict'} ${team2} will win ${score2}-${score1}`}
        </div>
      </CardContent>
    </Card>
  );
}
