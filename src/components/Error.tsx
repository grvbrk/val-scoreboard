import { Devvit } from '@devvit/public-api';

export const ErrorState: Devvit.BlockComponent = () => {
  return (
    <blocks height="regular">
      <vstack>
        <text style="heading" size="xxlarge">
          Loading...
        </text>
        <text style="heading" size="medium">
          Try again later
        </text>
      </vstack>
    </blocks>
  );
};
