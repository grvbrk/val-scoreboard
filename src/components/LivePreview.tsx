import { Devvit } from '@devvit/public-api';
import { CLR_DUTCH_WHITE } from 'src/core/colors.js';
import { AllLiveMatchSegment } from 'src/core/types.js';
import { MAPS } from 'src/utils/maps.js';

export const LivePreview: Devvit.BlockComponent<{
  upcomingMatchInfo: AllLiveMatchSegment;
}> = ({ upcomingMatchInfo }) => {
  return (
    <zstack height="100%" width="100%">
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
      <vstack height="100%" width="100%" alignment="middle center">
        <text size="medium" weight="bold" color={CLR_DUTCH_WHITE} wrap alignment="center middle">
          {upcomingMatchInfo.match_event}
        </text>
        <text size="small" color={CLR_DUTCH_WHITE} alignment="center middle">
          {upcomingMatchInfo.match_series} • Live
        </text>

        <spacer size="medium" />

        <hstack alignment="center middle" width={100}>
          <hstack width={50} alignment="end middle">
            <image
              url={`flags/${upcomingMatchInfo.flag1.replace('flag-', '')}.png`}
              imageHeight={16}
              imageWidth={16}
            />
            <spacer size="xsmall" />
            <text
              maxWidth={50}
              alignment="center middle"
              color={CLR_DUTCH_WHITE}
              size="large"
              weight="bold"
              wrap
            >
              {upcomingMatchInfo.team1}
            </text>
          </hstack>
          <spacer size="large" />
          <text color={CLR_DUTCH_WHITE}>vs</text>
          <spacer size="large" />
          <hstack width={50} alignment="start middle">
            <image
              url={`flags/${upcomingMatchInfo.flag2.replace('flag-', '')}.png`}
              imageHeight={16}
              imageWidth={16}
            />
            <spacer size="xsmall" />
            <text
              alignment="center middle"
              maxWidth={50}
              color={CLR_DUTCH_WHITE}
              size="large"
              weight="bold"
              wrap
            >
              {upcomingMatchInfo.team2}
            </text>
          </hstack>
        </hstack>
      </vstack>
    </zstack>
  );
};

export const LivePreviewMobile: Devvit.BlockComponent<{
  upcomingMatchInfo: AllLiveMatchSegment;
}> = ({ upcomingMatchInfo }) => {
  return (
    <zstack height="100%" width="100%">
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
      <vstack height="100%" width="100%" alignment="middle center">
        <text size="medium" weight="bold" color={CLR_DUTCH_WHITE} wrap>
          {upcomingMatchInfo.match_event}
        </text>
        <text size="xsmall" color={CLR_DUTCH_WHITE} alignment="center middle">
          {upcomingMatchInfo.match_series} • Live
        </text>

        <spacer size="small" />

        <hstack alignment="center middle" width={100}>
          <hstack width={50} alignment="end middle">
            <image
              url={`flags/${upcomingMatchInfo.flag1.replace('flag-', '')}.png`}
              imageHeight={16}
              imageWidth={16}
            />
            <spacer size="xsmall" />
            <text
              alignment="center middle"
              maxWidth={50}
              color={CLR_DUTCH_WHITE}
              size="medium"
              weight="bold"
              wrap
            >
              {upcomingMatchInfo.team1}
            </text>
          </hstack>
          <spacer size="medium" />
          <text color={CLR_DUTCH_WHITE}>vs</text>
          <spacer size="medium" />
          <hstack width={50} alignment="start middle">
            <image
              url={`flags/${upcomingMatchInfo.flag2.replace('flag-', '')}.png`}
              imageHeight={16}
              imageWidth={16}
            />
            <spacer size="xsmall" />
            <text
              alignment="center middle"
              maxWidth={50}
              color={CLR_DUTCH_WHITE}
              size="medium"
              weight="bold"
              wrap
            >
              {upcomingMatchInfo.team2}
            </text>
          </hstack>
        </hstack>
      </vstack>
    </zstack>
  );
};
