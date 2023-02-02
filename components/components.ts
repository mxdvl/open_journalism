// import * as zod from "https://deno.land/x/zod@v3.20.2/mod.ts";
import { components } from "./from_bundle.ts";

// const entry = zod.array(zod.object({
//   name: zod.string(),
//   path: zod.string(),
//   sha: zod.string(),
//   size: zod.number(),
//   url: zod.string(),
//   html_url: zod.string(),
//   //   git_url: zod.string(),
//   //   download_url: zod.string(),
//   type: zod.enum(["file", "dir"]),
// }));

// const api = "https://api.github.com/";

// const islands = await fetch(
//   new URL(
//     "/repos/guardian/dotcom-rendering/contents/dotcom-rendering/src/web/components",
//     api,
//   ),
// ).then((r) => r.json()).then((r) =>
//   entry.parse(r).filter(({ name }) => name.includes(".importable.tsx"))
// );

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
// ];

export const components_list = components.map((
  { file, gzipSize, parsedSize },
) => {
  return `<li>
    <h3>${file}</h3>
    <h4>${(gzipSize / 1024).toFixed(1)}kB gzip / ${
    (parsedSize / 1024).toFixed(1)
  }kB parsed</h4>
    <p>
    See <a href="https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/web/components/${file}">…/components/${file}</a> online
    </p>
    </li>`;
});
