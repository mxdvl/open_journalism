import * as zod from "https://deno.land/x/zod@v3.20.2/mod.ts";
import { unified } from "https://cdn.esm.sh/unified";
import remarkParse from "https://cdn.esm.sh/remark-parse";
import remarkHtml from "https://cdn.esm.sh/remark-html";
import { components } from "./from_bundle.ts";
import { headers } from "./github.ts";

const api = "https://api.github.com/";

const path = "dotcom-rendering/src/web/components";

const ref = "mxdvl/describe-islands";
const file_response = zod.object({
  name: zod.string().endsWith(".importable.tsx"),
  content: zod.string(),
  encoding: zod.literal("base64"),
  type: zod.literal("file"),
  size: zod.number(),
});

export const get_JSDoc = (name: string) =>
  new RegExp(
    "\n\/\\*\\*\n?" + "((?: \\*.*\n)+)" + " \\*\\/" +
      `\nexport const ${name} =`,
    "m",
  );

export const components_list = await Promise.all(
  components.map(async ({ file, gzipSize, parsedSize }) => {
    const url = new URL(
      `/repos/guardian/dotcom-rendering/contents/${path}/${file}` + "?" +
        new URLSearchParams({ ref }).toString(),
      api,
    );

    const file_content = await fetch(url, { headers })
      .then((r) => r.json())
      .then((json) => file_response.parseAsync(json))
      .then(({ content }) => atob(content));

    const name: string = file.split(".")[0] ?? "Unknown";

    const REGEX = get_JSDoc(name);

    const [, match] = file_content.match(REGEX) ?? [];

    const description = match?.split("\n")
      .map((line) => line.slice(3))
      .join("\n");

    const html = await unified()
      .use(remarkParse)
      .use(remarkHtml)
      .process(description ?? `# ${name} \n No description yet… 😢`);

    return `<li>
    <header>
        <h4>${(gzipSize / 1024).toFixed(1)}kB gzip</h4>
        <h4>${(parsedSize / 1024).toFixed(1)}kB parsed</h4>
    </header>

    <main>
    ${html}
    </main>

    <footer>
    See <a href="https://github.com/guardian/dotcom-rendering/blob/main/${path}/${file}">…/components/${file}</a> online
    </footer>
    </li>`;
  }),
);
