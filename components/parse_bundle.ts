import * as zod from "https://deno.land/x/zod@v3.20.2/mod.ts";

const module = zod.object({
  label: zod.string(),
  isAsset: zod.boolean(),
  statSize: zod.number(),
  parsedSize: zod.number(),
  gzipSize: zod.number(),
});

const latest = [...Deno.readDirSync("zip")]
  .filter(({ name, isDirectory }) =>
    name.startsWith("bundle-analysis") && isDirectory
  )
  .at(-1);

if (!latest) throw new Error("No matching dir found");

const { name } = latest;

const data = await Deno.readTextFile(
  `zip/${name}/browser.modern-bundles.html`,
).then((r) =>
  r.split("\n").find((l) => l.trim().startsWith("window.chartData"))
);

const items = zod.array(module).parse(
  JSON.parse(data?.slice(25, -1) ?? "[]"),
)
  .filter(({ label }) => label.includes("-importable.modern."))
  .map(({ label, gzipSize, parsedSize }) => ({
    file: label.split("-").at(0) + ".importable.tsx",
    parsedSize,
    gzipSize,
  }));

console.log(items);

await Deno.writeTextFile(
  "./components/from_bundle.ts",
  `
/**
 * **DO NOT EDIT**
 * This is generated automatically!
 */
export const components = [
${items.map((i) => "\t" + JSON.stringify(i) + ",").join("\n")}
] as const;
  `,
);
