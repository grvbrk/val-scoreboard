import { motion } from 'motion/react';
import { PlayerCard } from './PlayerCard';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Player, SingleUpcomingMatchSegment } from '../../src/core/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { useState } from 'react';
import { Check, Trophy, Users, X } from 'lucide-react';
import { Badge } from './ui/badge';

type SuperTeamSelectorType = {
  upcomingMatchData: SingleUpcomingMatchSegment;
  availablePlayers: Player[];
  setAvailablePlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  selectedPlayers: Player[];
  setSelectedPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  handleSubmitTeam: () => void;
  hasUserSelected: boolean;
  setHasUserSelected: React.Dispatch<React.SetStateAction<boolean>>;
  team1wins: boolean;
  score1: string;
  score2: string;
  team1_short: string;
  team2_short: string;
  logo1: string;
  logo2: string;
};

export default function SuperteamSelector({
  availablePlayers,
  setAvailablePlayers,
  selectedPlayers,
  setSelectedPlayers,
  handleSubmitTeam,
  hasUserSelected,
  setHasUserSelected,
  // team1wins,
  score1,
  score2,
  team1_short,
  team2_short,
  // logo1,
  // logo2,
}: SuperTeamSelectorType) {
  const isTeamComplete = selectedPlayers.length === 5;

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  function handleSelectPlayer(player: Player) {
    if (selectedPlayers.some((p) => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id));
      setAvailablePlayers([...availablePlayers, player]);
    } else {
      setSelectedPlayers([...selectedPlayers, player]);
      setAvailablePlayers(availablePlayers.filter((p) => p.id !== player.id));
    }
  }

  return (
    <div className="space-y-12">
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between px-2">
          <h2 className="flex items-center font-bold md:text-2xl">
            <span className="text-red-500">YOUR SUPERTEAM</span>
            <span className="ml-2 flex items-center justify-center rounded-full bg-red-500 p-2 text-xs md:ml-3 md:text-sm">
              {selectedPlayers.length}/5
            </span>
          </h2>
          <Button
            onClick={() => {
              setIsConfirmDialogOpen(true);
            }}
            disabled={!isTeamComplete || hasUserSelected}
            className="text-almond cursor-pointer border-none bg-gradient-to-r from-red-500 to-red-600 font-semibold hover:from-red-600 hover:to-red-700 md:p-6 md:text-xl"
          >
            SUBMIT TEAM
          </Button>
        </div>

        <Card className="relative overflow-hidden rounded-xl border-neutral-700 bg-neutral-800/50 p-4 backdrop-blur-sm">
          {selectedPlayers.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center text-neutral-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-lg">Select players to build your superteam</p>
              <p className="mt-2 text-sm">Click on players below to add them to your team</p>
            </motion.div>
          ) : (
            <motion.div className="grid grid-cols-3 gap-2 sm:grid-cols-5" layout>
              {selectedPlayers.map((player) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.1,
                    ease: 'easeIn',
                  }}
                  layout
                >
                  <PlayerCard
                    player={player}
                    onSelect={() => {
                      handleSelectPlayer(player);
                    }}
                    disabled={hasUserSelected}
                    isSelected={hasUserSelected ? false : true}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h2 className="text-almond font-bold md:text-2xl">
          {hasUserSelected ? 'PLAYERS' : 'AVAILABLE PLAYERS'}
        </h2>

        <Card className="relative overflow-hidden rounded-xl border-none bg-transparent shadow-none">
          {availablePlayers.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center text-neutral-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-lg">All players selected!</p>
              <p className="mt-2 text-sm">Your superteam is complete. Click Submit to continue.</p>
            </motion.div>
          ) : (
            <motion.div className="grid grid-cols-3 gap-2 sm:grid-cols-5" layout>
              {availablePlayers.map((player) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 100,
                    damping: 20,
                  }}
                  layout
                >
                  <PlayerCard
                    player={player}
                    onSelect={() => handleSelectPlayer(player)}
                    isSelected={false}
                    disabled={isTeamComplete}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </Card>
      </motion.div>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent className="text-almond bg-neutral-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-xl font-bold">
              Confirm Your Selection?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-center">
              This action cannot be undone. Your prediction and superteam will be locked.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy size={18} />
                <h3 className="font-bold">Your Prediction</h3>
              </div>
              <div className="rounded-lg p-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex flex-col items-center">
                    <Badge variant="outline" className="text-almond text-md px-3 py-1 font-medium">
                      {team1_short}
                    </Badge>
                  </div>

                  <div className="text-md flex items-center gap-1">
                    <span>{score1}</span>
                    <span className="text-muted-foreground">:</span>
                    <span>{score2}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <Badge variant="outline" className="text-almond text-md px-3 py-1 font-medium">
                      {team2_short}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* <Separator /> */}

            <div>
              <div className="flex items-center gap-2">
                <Users size={18} />
                <h3 className="font-bold">Your Superteam</h3>
              </div>
              <div className="rounded-lg p-4">
                <div className="grid grid-cols-2 gap-1">
                  {selectedPlayers.map((player) => (
                    <div key={player.id} className="flex items-center gap-2">
                      <span className="justify-center">{player.teamShort}</span>
                      <span>{player.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-almond cursor-pointer bg-neutral-800 hover:bg-neutral-800">
              <X size={16} />
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsConfirmDialogOpen(false);
                setHasUserSelected(true);
                handleSubmitTeam();
              }}
              className="bg-almond hover:bg-primary/90 cursor-pointer"
            >
              <Check size={16} />
              Confirm Selection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
