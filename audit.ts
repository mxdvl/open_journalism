import { underline } from "https://deno.land/std@0.180.0/fmt/colors.ts";
import { cached } from "./cached.ts";
import { is_script } from "./parser.ts";

const sorted_by_size = (
  { size: a }: { size: number },
  { size: b }: { size: number },
) => b - a;

const types = ["Script", "Document", "Image", "Font", "Other"] as const;

export const get_report = async (test: string) => {
  const {
    testUrl,
    from,
    median: {
      firstView: { breakdown, requests, "lighthouse.Performance": performance },
    },
  } = await cached(test);

  console.info("Component audit for", underline(testUrl));

  const breakdown_values = Object.entries(breakdown)
    .map(([label, { color, bytes }]) => ({
      label,
      colour: ["rgb(", ...color, ")"].join(" "),
      size: bytes,
    }))
    .sort(sorted_by_size);

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
  })).sort(sorted_by_size);

  const first_party = scripts
    .filter(({ full_url }) => full_url.startsWith("https://assets.guim.co.uk/"))
    .map(({ full_url, objectSize }) => ({
      label: new URL(full_url).pathname.split("/").at(-1)?.replace(
        /\.([a-z0-9]{20})\.js$/i,
        ".js",
      ) ??
        "unknown",
      size: objectSize,
    }))
    .sort(sorted_by_size);

  return {
    testUrl,
    per_domain,
    breakdown_values,
    first_party,
    performance,
    from,
    requests: requests.map((request) => {
      const request_type = types.find((type) =>
        type === request.request_type
      ) ?? types[4];

      return ({
        ...request,
        request_type,
      });
    }),
  };
};
