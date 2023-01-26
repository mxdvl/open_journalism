import {
  array,
  enum as literal_union,
  infer as inferred,
  number,
  object,
  string,
  tuple,
} from "https://deno.land/x/zod@v3.20.2/mod.ts";
import { underline } from "https://deno.land/std@0.174.0/fmt/colors.ts";
import { serve } from "https://deno.land/std@0.174.0/http/server.ts";
import { get } from "./cache.ts";
import { get_doughtnut } from "./pie.ts";

const type = object({
  color: tuple([number(), number(), number()]),
  bytes: number(),
});

const request = object({
  full_url: string(),
  request_type: literal_union([
    "Document",
    "Fetch",
    "Font",
    "Image",
    "Other",
    "Script",
    "Stylesheet",
    "XHR",
    "Preflight",
  ]),
  contentType: string(),
  objectSize: number(),
});

const result = object({
  data: object({
    testUrl: string(),
    median: object({
      firstView: object({
        requests: array(request),
        breakdown: object({
          html: type,
          js: type,
          css: type,
          image: type,
          font: type,
          other: type,
        }),
      }),
    }),
  }),
});

const [test] = Deno.args;

if (!test) throw new Error("Missing test ID");

const url = new URL(
  `https://www.webpagetest.org/jsonResult.php?${new URLSearchParams({
    test,
  })}`,
);

const cache = await caches.open("oj-reports");

const { data: { testUrl, median: { firstView: { breakdown, requests } } } } =
  result.parse(
    await get(url, cache).then((r) => r.json()),
  );

console.info("Component audit for", underline(testUrl));

const breakdown_values = Object.entries(breakdown).map((
  [label, { color, bytes }],
) => ({ label, colour: ["rgb(", ...color, ")"].join(" "), size: bytes }));

type Request = inferred<typeof request>;
type Script = Request & {
  request_type: "Script";
};

const is_script = (
  request: Request,
): request is Script => request.request_type === "Script";

const scripts = requests
  .filter(is_script);

const breakdown_js = scripts
  .map(({ full_url, objectSize }) => ({
    label: new URL(full_url).hostname,
    size: objectSize,
  })).reduce((map, { label, size }) => {
    const running_total = map.get(label) ?? 0;
    map.set(label, running_total + size);
    return map;
  }, new Map<string, number>());

const per_domain = [...breakdown_js.entries()].map(([label, size]) => ({
  label,
  size,
}));

const first_party = scripts
  .filter(({ full_url }) => full_url.startsWith("https://assets.guim.co.uk/"))
  .map(({ full_url, objectSize }) => ({
    label: new URL(full_url).pathname.split("/").at(-1)?.replace(
      /\.\w+\.js$/i,
      ".js",
    ) ??
      "unknown",
    size: objectSize,
  }))
  .sort((a, b) => b.size - a.size);

console.log(first_party);

const body = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component audit for ${testUrl}</title>
</head>
<body>
    <h1>Component audit for ${testUrl}</h1>
    ${get_doughtnut("assets", breakdown_values)}
    ${get_doughtnut("js", per_domain)}
    ${get_doughtnut("1st party", first_party)}
</body>
</html>
`;

serve(() =>
  new Response(body, {
    headers: {
      "Content-Type": "text/html",
    },
  })
);
