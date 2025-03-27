import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { cn } from '../utils';
import { Player } from '../../src/core/types';

interface PlayerCardProps {
  player: Player;
  onSelect: () => void;
  isSelected: boolean;
  disabled?: boolean;
}

export function PlayerCard({ player, onSelect, isSelected, disabled = false }: PlayerCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Card
        className={cn(
          `bg-almond cursor-pointer overflow-hidden transition-all duration-200`,
          disabled && !isSelected && 'cursor-not-allowed opacity-50'
        )}
        onClick={() => !disabled && onSelect()}
      >
        <CardContent className="flex flex-col items-center p-4">
          <div className="relative mb-3 flex items-center justify-center rounded-md">
            <img src={player.teamLogo} alt={player.name} className="object-cover" />
          </div>
          <motion.h3
            className={cn('text-charcoal w-full truncate text-center text-sm font-bold xl:text-lg')}
            layout
          >
            {player.name}
          </motion.h3>
        </CardContent>
      </Card>
    </motion.div>
  );
}
