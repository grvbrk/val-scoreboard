import { Devvit } from '@devvit/public-api';
import { CLR_DUTCH_WHITE } from 'src/core/colors.js';
import { MAPS } from 'src/utils/maps.js';

export const LoadingState: Devvit.BlockComponent = () => {
  return (
    <zstack height={100} width={100}>
      <hstack height={100} width={100}>
        {MAPS.map((map) => {
          return (
            <image
              url={`maps/${map}.png`}
              imageHeight={100}
              imageWidth={100}
              height={100}
              width={100}
              resizeMode="cover"
              grow
            />
          );
        })}
      </hstack>
      <vstack width={100} height={100} alignment="center middle">
        <text color={CLR_DUTCH_WHITE} size="large">
          Loading...
        </text>
        <text color={CLR_DUTCH_WHITE} size="xsmall">
          Please refresh the page if it takes too long.
        </text>
      </vstack>
    </zstack>
  );
};
