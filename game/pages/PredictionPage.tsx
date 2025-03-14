import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { cn } from '../utils';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import SuperteamSelector from '../components/SuperTeamSelector';

interface TeamProps {
  name: string;
  logo: string;
}

interface MatchPredictorProps {
  postId: string;
  teamA: TeamProps;
  teamB: TeamProps;
}

export const PredictionPage = ({ postId, teamA, teamB }: MatchPredictorProps) => {
  const [scoreA, setScoreA] = useState<string>('0');
  const [scoreB, setScoreB] = useState<string>('0');
  const [teamAWins, setTeamAWins] = useState<boolean>(false);

  const handleScoreChange = (team: 'A' | 'B', value: string) => {
    if (!/^\d*$/.test(value)) return;

    if (team === 'A') {
      setScoreA(value);
      if (Number.parseInt(value) > Number.parseInt(scoreB)) {
        setTeamAWins(true);
      } else if (Number.parseInt(value) < Number.parseInt(scoreB)) {
        setTeamAWins(false);
      }
    } else {
      setScoreB(value);
      if (Number.parseInt(value) > Number.parseInt(scoreA)) {
        setTeamAWins(false);
      } else if (Number.parseInt(value) < Number.parseInt(scoreA)) {
        setTeamAWins(true);
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-900 to-red-800 px-4 py-10 text-white">
      <div className="container mx-auto">
        <h1 className="mb-4 bg-gradient-to-r from-red-500 to-white bg-clip-text text-center text-5xl font-bold text-transparent">
          VALORANT SUPERTEAM
        </h1>
        <div className="mx-auto mb-8 h-1 w-40 bg-gradient-to-r from-red-500 to-red-600"></div>
        <h1 className="text-2xl font-bold">MATCH PREDICTION</h1>
        <p className="mb-10 max-w-2xl text-neutral-400">
          Predict the score of the upcoming match between Fnatic and Team Vitality!
        </p>
        <p className="mx-auto mb-10 max-w-2xl text-center text-neutral-400">
          Create your ultimate superteam by selecting 5 players from the upcoming match Fnatic vs
          Team Vitality. Click to select players and submit your team to compete!
        </p>
        <SuperteamSelector />
      </div>
    </main>
    // <div className="bg-pearl relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg">
    //   <Card className={cn('mx-auto w-full max-w-md')}>
    //     <CardHeader>
    //       <CardTitle className="text-center">Match Prediction</CardTitle>
    //       <CardDescription className="text-center">
    //         Predict the score for the upcoming match
    //       </CardDescription>
    //     </CardHeader>
    //     <CardContent>
    //       <div className="mb-6 flex items-center justify-center gap-2">
    //         <span className={teamAWins ? 'font-medium' : 'text-muted-foreground'}>
    //           {teamA.name} wins
    //         </span>
    //         <Switch checked={!teamAWins} onCheckedChange={(checked) => setTeamAWins(!checked)} />
    //         <span className={!teamAWins ? 'font-medium' : 'text-muted-foreground'}>
    //           {teamB.name} wins
    //         </span>
    //       </div>

    //       <div className="grid grid-cols-5 items-center gap-4">
    //         {/* Team A */}
    //         <div className="col-span-2 flex flex-col items-center gap-2">
    //           <div
    //             className={cn(
    //               'rounded-lg p-2 transition-colors',
    //               teamAWins ? 'bg-primary/10' : 'bg-background'
    //             )}
    //           >
    //             <img
    //               src={teamA.logo || '/placeholder.svg'}
    //               alt={teamA.name}
    //               width={64}
    //               height={64}
    //               className="mx-auto"
    //             />
    //           </div>
    //           <Label className="text-center font-medium">{teamA.name}</Label>
    //         </div>

    //         <div className="col-span-1 flex items-center justify-center">
    //           <span className="text-muted-foreground text-xl font-bold">VS</span>
    //         </div>

    //         <div className="col-span-2 flex flex-col items-center gap-2">
    //           <div
    //             className={cn(
    //               'rounded-lg p-2 transition-colors',
    //               !teamAWins ? 'bg-primary/10' : 'bg-background'
    //             )}
    //           >
    //             <img
    //               src={teamB.logo || '/placeholder.svg'}
    //               alt={teamB.name}
    //               width={64}
    //               height={64}
    //               className="mx-auto"
    //             />
    //           </div>
    //           <Label className="text-center font-medium">{teamB.name}</Label>
    //         </div>

    //         <div className="col-span-2 mt-4">
    //           <div className="flex justify-center">
    //             <Input
    //               type="text"
    //               value={scoreA}
    //               onChange={(e) => handleScoreChange('A', e.target.value)}
    //               className="w-16 text-center text-lg font-bold"
    //               maxLength={2}
    //             />
    //           </div>
    //         </div>

    //         <div className="col-span-1" />

    //         <div className="col-span-2 mt-4">
    //           <div className="flex justify-center">
    //             <Input
    //               type="text"
    //               value={scoreB}
    //               onChange={(e) => handleScoreChange('B', e.target.value)}
    //               className="w-16 text-center text-lg font-bold"
    //               maxLength={2}
    //             />
    //           </div>
    //         </div>
    //       </div>

    //       <div className="text-muted-foreground mt-8 text-center text-sm">
    //         {teamAWins
    //           ? `You predict ${teamA.name} will win ${scoreA}-${scoreB}`
    //           : `You predict ${teamB.name} will win ${scoreB}-${scoreA}`}
    //       </div>
    //     </CardContent>
    //   </Card>
    // </div>
  );
};
