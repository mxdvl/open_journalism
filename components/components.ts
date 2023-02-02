import * as zod from "https://deno.land/x/zod@v3.20.2/mod.ts";

const entry = zod.array(zod.object({
  name: zod.string(),
  path: zod.string(),
  sha: zod.string(),
  size: zod.number(),
  url: zod.string(),
  html_url: zod.string(),
  //   git_url: zod.string(),
  //   download_url: zod.string(),
  type: zod.enum(["file", "dir"]),
}));

const api = "https://api.github.com/";

const islands = await fetch(
  new URL(
    "/repos/guardian/dotcom-rendering/contents/dotcom-rendering/src/web/components",
    api,
  ),
).then((r) => r.json()).then((r) =>
  entry.parse(r).filter(({ name }) => name.includes(".importable.tsx"))
);

interface Component {
  name: string;
  island: boolean;
  visual: boolean;
  description: string;
}

// const data = await fetch(
//   "https://raw.githubusercontent.com/guardian/csnx/main/libs/%40guardian/atoms-rendering/src/AudioAtom.tsx",
// ).then((r) => r.text());

// console.log(data);

// const components: Component[] = [
//   {
//     name: "AlreadyVisited",
//     island: true,
//     visual: false,
//     description: "Increment the number of times",
//   },
//   {
//     name: "AudioAtomWrapper",
//     island: true,
//     visual: true,
//     description:
//       "Wrapper around [`@guardian/atoms-rendering`](https://github.com/guardian/csnx/blob/main/libs/%40guardian/atoms-rendering/src/AudioAtom.tsx)",
//   },
//   { name: "Branding", island: true, visual: true, description: "" },
//   { name: "BrazeMessaging", island: true, visual: 1 > 1, description: "" },
//   {
//     name: "CalloutBlockComponent",
//     island: true,
//     visual: 1 > 1,
//     description: "",
//   },
//   {
//     name: "CalloutEmbedBlockComponent",
//     island: true,
//     visual: 1 > 1,
//     description: "",
//   },
//   { name: "Carousel", island: true, visual: 1 > 1, description: "" },
//   { name: "ChartAtomWrapper", island: true, visual: 1 > 1, description: "" },
//   { name: "CommentCount", island: true, visual: true, description: "" },
//   { name: "DiscussionContainer", island: true, visual: 1 > 1, description: "" },
//   { name: "DiscussionMeta", island: true, visual: 1 > 1, description: "" },
//   {
//     name: "DocumentBlockComponent",
//     island: true,
//     visual: 1 > 1,
//     description: "",
//   },
//   { name: "EditionDropdown", island: true, visual: 1 > 1, description: "" },
//   { name: "EmbedBlockComponent", island: true, visual: 1 > 1, description: "" },
//   { name: "EnhancePinnedPost", island: true, visual: 1 > 1, description: "" },
//   { name: "FetchCommentCounts", island: true, visual: 1 > 1, description: "" },
//   { name: "FetchOnwardsData", island: true, visual: 1 > 1, description: "" },
//   { name: "FilterButton", island: true, visual: 1 > 1, description: "" },
//   {
//     name: "FilterKeyEventsToggle",
//     island: true,
//     visual: 1 > 1,
//     description: "",
//   },
//   { name: "FocusStyles", island: true, visual: 1 > 1, description: "" },
//   {
//     name: "GetCricketScoreboard",
//     island: true,
//     visual: 1 > 1,
//     description: "",
//   },
//   { name: "GetMatchNav", island: true, visual: 1 > 1, description: "" },
//   { name: "GetMatchStats", island: true, visual: 1 > 1, description: "" },
//   { name: "GetMatchTabs", island: true, visual: 1 > 1, description: "" },
//   { name: "GuideAtomWrapper", island: true, visual: 1 > 1, description: "" },
//   { name: "HeaderTopBar", island: true, visual: 1 > 1, description: "" },
//   {
//     name: "InstagramBlockComponent",
//     island: true,
//     visual: 1 > 1,
//     description: "",
//   },
//   {
//     name: "InteractiveBlockComponent",
//     island: true,
//     visual: 1 > 1,
//     description: "",
//   },
//   {
//     name: "InteractiveContentsBlockComponent",
//     island: true,
//     visual: 1 > 1,
//     description: "",
//   },
//   { name: "KeyEventsCarousel", island: true, visual: 1 > 1, description: "" },
//   {
//     name: "KnowledgeQuizAtomWrapper",
//     island: true,
//     visual: 1 > 1,
//     description: "",
//   },
//   { name: "LabsHeader", island: true, visual: 1 > 1, description: "" },
//   { name: "LiveBlogEpic", island: true, visual: 1 > 1, description: "" },
//   { name: "Liveness", island: true, visual: 1 > 1, description: "" },
//   {
//     name: "MapEmbedBlockComponent",
//     island: true,
//     visual: 1 > 1,
//     description: "",
//   },
//   { name: "Metrics", island: true, visual: 1 > 1, description: "" },
//   { name: "MostViewedFooter", island: true, visual: 1 > 1, description: "" },
//   {
//     name: "MostViewedFooterData",
//     island: true,
//     visual: 1 > 1,
//     description: "",
//   },
//   {
//     name: "MostViewedRightWrapper",
//     island: true,
//     visual: 1 > 1,
//     description: "",
//   },
//   { name: "OnwardsUpper", island: true, visual: 1 > 1, description: "" },
//   {
//     name: "PersonalityQuizAtomWrapper",
//     island: true,
//     visual: 1 > 1,
//     description: "",
//   },
//   { name: "ProfileAtomWrapper", island: true, visual: 1 > 1, description: "" },
//   { name: "PulsingDot", island: true, visual: 1 > 1, description: "" },
//   { name: "QandaAtomWrapper", island: true, visual: 1 > 1, description: "" },
//   { name: "ReaderRevenueDev", island: true, visual: 1 > 1, description: "" },
//   { name: "ReaderRevenueLinks", island: true, visual: 1 > 1, description: "" },
//   { name: "RecipeMultiplier", island: true, visual: 1 > 1, description: "" },
//   { name: "RichLinkComponent", island: true, visual: 1 > 1, description: "" },
//   { name: "SecureSignupIframe", island: true, visual: 1 > 1, description: "" },
//   { name: "SetABTests", island: true, visual: 1 > 1, description: "" },
//   { name: "ShareCount", island: true, visual: 1 > 1, description: "" },
//   { name: "ShowHideContainers", island: true, visual: 1 > 1, description: "" },
//   { name: "ShowMore", island: true, visual: 1 > 1, description: "" },
//   { name: "SignInGateSelector", island: true, visual: 1 > 1, description: "" },
//   { name: "SlotBodyEnd", island: true, visual: 1 > 1, description: "" },
//   { name: "Snow", island: true, visual: 1 > 1, description: "" },
//   {
//     name: "SpotifyBlockComponent",
//     island: true,
//     visual: 1 > 1,
//     description: "",
//   },
//   { name: "StickyBottomBanner", island: true, visual: 1 > 1, description: "" },
//   { name: "SubNav", island: true, visual: 1 > 1, description: "" },
//   { name: "SupportTheG", island: true, visual: 1 > 1, description: "" },
//   { name: "TableOfContents", island: true, visual: 1 > 1, description: "" },
//   { name: "TimelineAtomWrapper", island: true, visual: 1 > 1, description: "" },
//   { name: "TopicFilterBank", island: true, visual: 1 > 1, description: "" },
//   { name: "TopRightAdSlot", island: true, visual: 1 > 1, description: "" },
//   { name: "TweetBlockComponent", island: true, visual: 1 > 1, description: "" },
//   {
//     name: "UnsafeEmbedBlockComponent",
//     island: true,
//     visual: 1 > 1,
//     description: "",
//   },
//   {
//     name: "VideoFacebookBlockComponent",
//     island: true,
//     visual: 1 > 1,
//     description: "",
//   },
//   { name: "VineBlockComponent", island: true, visual: 1 > 1, description: "" },
//   {
//     name: "YoutubeBlockComponent",
//     island: true,
//     visual: 1 > 1,
//     description: "",
//   },
// ];

export const components_list = islands.map((
  { name, html_url },
) =>
  `<li>
    <h3>${name}</h3>
    <p>
        See <a href="${html_url}">${name}</a> online
    </p>
</li>`
);
