import { Devvit } from '@devvit/public-api';

export const MatchResultsPage: Devvit.BlockComponent = (_, context) => {
  return (
    <blocks height="regular">
      <vstack width={'100%'} height={'100%'} cornerRadius="medium" backgroundColor="red">
        {/* <text>{context.dimensions!.width}</text> */}
        <TopBar />
        <MainBar />
        <MatchInfo context={context} />
      </vstack>
    </blocks>
  );
};

export function TopBar(): JSX.Element {
  return (
    <hstack
      height="58px"
      padding="medium"
      backgroundColor="alienblue-700"
      alignment="center middle"
    >
      <vstack alignment="top start">
        <text color="white" style="heading" size="medium">
          Match results Page
        </text>
        <text color="white" style="body" size="small">
          Main Event: Week 1
        </text>
      </vstack>
      <vstack grow />
      <vstack alignment="middle end">
        <text color="white" style="body" size="small">
          Tuesday, March 4th
        </text>
        <text color="white" style="body" size="small">
          6:00 PM PST
        </text>
      </vstack>
    </hstack>
  );
}

export function MainBar(): JSX.Element {
  return (
    <zstack width="100%" backgroundColor="green">
      <hstack width={'100%'} height={'100%'}>
        <hstack borderColor="yellow" alignment="middle center">
          <text color="yellow">team 1</text>
          <image url={'uefa-champions-acm.png'} imageHeight={32} imageWidth={32} />
        </hstack>
        <vstack borderColor="yellow" grow alignment="middle center">
          <text color="yellow">Final</text>
          <text color="yellow">2 : 0</text>
          <text color="yellow">B03</text>
        </vstack>
        <hstack borderColor="yellow" alignment="middle center">
          <image url={'uefa-champions-acm.png'} imageHeight={32} imageWidth={32} />
          <text color="yellow">team 2</text>
        </hstack>
      </hstack>
    </zstack>
  );
}

export function MatchInfo({ context }: { context: Devvit.Context }): JSX.Element {
  return (
    <zstack width="100%" backgroundColor="yellow">
      <hstack width={'100%'} height={'100%'} alignment="middle center">
        <vstack>
          <PlayerInfo context={context} />
          <PlayerInfo context={context} />
          <PlayerInfo context={context} />
          <PlayerInfo context={context} />
          <PlayerInfo context={context} />
        </vstack>
        <spacer size="medium" />
        <vstack>
          <PlayerInfo context={context} />
          <PlayerInfo context={context} />
          <PlayerInfo context={context} />
          <PlayerInfo context={context} />
          <PlayerInfo context={context} />
        </vstack>
      </hstack>
    </zstack>
  );
}

export function PlayerInfo({ context }: { context: Devvit.Context }): JSX.Element {
  return (
    <hstack padding="small" borderColor="red">
      <hstack borderColor="red">
        <image url={'uefa-champions-acm.png'} imageHeight={16} imageWidth={16} />
        <text>Spaz</text>
      </hstack>
      <hstack borderColor="red">
        <image url={'uefa-champions-acm.png'} imageHeight={16} imageWidth={16} />
        <image url={'uefa-champions-acm.png'} imageHeight={16} imageWidth={16} />
        <image url={'uefa-champions-acm.png'} imageHeight={16} imageWidth={16} />
      </hstack>
      <hstack padding="small" borderColor="red">
        <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
          <text size="xsmall">1.77</text>
        </hstack>

        <spacer width={'2px'} />

        <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
          <text size="xsmall">273</text>
        </hstack>

        <spacer width={'2px'} />

        <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
          <text size="xsmall">43 / 20 / 32</text>
        </hstack>

        <spacer width={'2px'} />

        <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
          <text size="xsmall">+23</text>
        </hstack>

        {(context.dimensions?.width ?? 360) > 400 && (
          <>
            <spacer width={'2px'} />

            <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
              <text size="xsmall">91%</text>
            </hstack>

            <spacer width={'2px'} />

            <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
              <text size="xsmall">172</text>
            </hstack>

            <spacer width={'2px'} />

            <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
              <text size="xsmall">19%</text>
            </hstack>

            <spacer width={'2px'} />

            <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
              <text size="xsmall">0</text>
            </hstack>

            <spacer width={'1px'} />

            <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
              <text size="xsmall">1</text>
            </hstack>

            <spacer width={'1px'} />

            <hstack backgroundColor="grey" padding="xsmall" alignment="center middle">
              <text size="xsmall">-1</text>
            </hstack>
          </>
        )}
      </hstack>
    </hstack>
  );
}
