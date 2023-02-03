import * as zod from "https://deno.land/x/zod@v3.20.2/mod.ts";
import { decompress } from "https://deno.land/x/zip@v1.2.5/mod.ts";
import { headers } from "./github.ts";

const entry = zod.object({
  artifacts: zod.array(zod.object({
    name: zod.string(),
    created_at: zod.string(),
    archive_download_url: zod.string().startsWith("https://api.github.com/"),
    workflow_run: zod.object({
      //   id: zod.number(),
      //   repository_id: zod.number(),
      //   head_repository_id: zod.number(),
      head_branch: zod.string(),
      //   head_sha: zod.string(),
    }),
  })),
});

const api = "https://api.github.com/";

const artefacts = await fetch(
  new URL(
    `/repos/guardian/dotcom-rendering/actions/artifacts?${
      new URLSearchParams({
        name: "bundle-analyser-report-modern",
      }).toString()
    }`,
    api,
  ),
  { headers },
).then((r) => r.json()).then((r) =>
  entry.parse(r).artifacts.filter(({ workflow_run }) =>
    workflow_run.head_branch === "main"
  ).map(({ created_at, archive_download_url }) => ({
    created_at,
    archive_download_url,
  }))
);

for (const artefact of artefacts) {
  const archive = await fetch(artefact.archive_download_url, { headers });

  const path = `./zip/bundle-analysis-${artefact.created_at}.zip`;

  const stat = await Deno.stat(path)
    .then(({ isFile }) => isFile)
    .catch(() => false);

  if (stat) {
    console.info("Already found", path);
    continue;
  }

  if (archive.body) {
    const file = await Deno.open(
      path,
      { write: true, create: true },
    );
    await archive.body.pipeTo(file.writable);
  }

  decompress(path, path.replace(".zip", ""));
}
