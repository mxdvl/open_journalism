import { assertEquals } from "https://deno.land/std@0.176.0/testing/asserts.ts";
import { get_JSDoc } from "./components.ts";

Deno.test("Can match text correctly", () => {
  const input = `
/**
 * insert
 *
 * Takes html, parses and hydrates it, inserts the resulting blocks
 * at the top of the liveblog, and then enhances any tweets
 *
 * @param {string} html The block html to be inserted
 * @returns void
 */
function insert(html: string, enhanceTweetsSwitch: boolean) {
        // Create
        // ------
        const template = document.createElement('template');
        template.innerHTML = html;
        const fragment = template.content;

        // Hydrate
        // -------
        const islands = fragment.querySelectorAll('gu-island');
        initHydration(islands);

        // Insert
        // ------
        // Shouldn't we sanitise this html?
        // We're being sent this string by our own backend, not reader input, so we
        // trust that the tags and attributes it contains are safe and intentional
        const blogBody = document.querySelector<HTMLElement>('#liveblog-body');
        if (!blogBody || !topOfBlog) return;
        // nextSibling? See: https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore#example_2
        blogBody.insertBefore(fragment, topOfBlog.nextSibling);

        // Enhance
        // -----------
        if (enhanceTweetsSwitch) {
                const pendingBlocks =
                        blogBody.querySelectorAll<HTMLElement>('.pending.block');
               

/**
 * # AudioAtomWrapper
 *
 * Wrapper around [\`@guardian/atoms-rendering\`’s \`AudioAtom\`](https://github.com/guardian/csnx/blob/main/libs/%40guardian/atoms-rendering/src/AudioAtom.tsx)
 */
export const AudioAtomWrapper = ({
    id,
	trackUrl,
	kicker,
	title,
	pillar,
	duration,
	contentIsNotSensitive,
	aCastisEnabled,
	readerCanBeShownAds,
}: Props) => {
`;

  const [, match] = input.match(get_JSDoc("AudioAtomWrapper")) ?? [];

  assertEquals(
    match,
    [
      " # AudioAtomWrapper",
      "",
      " Wrapper around [`@guardian/atoms-rendering`’s `AudioAtom`](https://github.com/guardian/csnx/blob/main/libs/%40guardian/atoms-rendering/src/AudioAtom.tsx)\n",
    ].map((l) => ` *${l}`).join("\n"),
  );
});
