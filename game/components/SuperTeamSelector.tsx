import { motion } from 'motion/react';
import { PlayerCard } from './PlayerCard';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Player } from '../pages/PredictionPage';
import { SingleUpcomingMatchSegment } from '../../src/core/types';

type SuperTeamSelectorType = {
  upcomingMatchData: SingleUpcomingMatchSegment;
  availablePlayers: Player[];
  setAvailablePlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  selectedPlayers: Player[];
  setSelectedPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  handleSubmitTeam: () => void;
};

export default function SuperteamSelector({
  availablePlayers,
  setAvailablePlayers,
  selectedPlayers,
  setSelectedPlayers,
  handleSubmitTeam,
}: SuperTeamSelectorType) {
  const isTeamComplete = selectedPlayers.length === 5;

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
          <h2 className="flex items-center font-bold text-white md:text-2xl">
            <span className="text-red-500">YOUR SUPERTEAM</span>
            <span className="ml-2 flex items-center justify-center rounded-full bg-red-500 p-2 text-xs md:ml-3 md:text-sm">
              {selectedPlayers.length}/5
            </span>
          </h2>
          <Button
            onClick={handleSubmitTeam}
            disabled={!isTeamComplete}
            className="cursor-pointer border-none bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 disabled:opacity-70 md:p-6 md:text-xl"
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
            <motion.div className="grid grid-cols-3 gap-2 md:grid-cols-5" layout>
              {selectedPlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.1,
                    ease: 'easeIn',
                  }}
                  layout
                >
                  <PlayerCard
                    player={player}
                    onSelect={() => handleSelectPlayer(player)}
                    isSelected={true}
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
        <h2 className="text-2xl font-bold text-white">AVAILABLE PLAYERS</h2>

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
            <motion.div className="grid grid-cols-3 gap-2 md:grid-cols-5" layout>
              {availablePlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.3 + index * 0.05,
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
    </div>
  );
}
