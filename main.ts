import { serve } from "https://deno.land/std@0.174.0/http/server.ts";
import { get_report } from "./audit.ts";
import { get_doughtnut } from "./pie.ts";

const index = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guardian Components audit</title>
</head>
<body>
    <h1>Missing test id</h1>
    <p>
        To get a test report, please provide a WebPageTest id, e.g. : <a href="/230117_BiDcKE_8T2">/230117_BiDcKE_8T2</a>
    </p>
</body>
</html>
`;

const html = (body: string) =>
  new Response(body, {
    headers: {
      "Content-Type": "text/html",
    },
  });

await serve(async (req) => {
  const test = new URL(req.url).pathname.slice(1);

  console.log(test);

  if (!test || test === "") return html(index);

  const { testUrl, breakdown_values, per_domain, first_party } =
    await get_report(test);

  const body = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guardian Components audit – ${testUrl}</title>
</head>
<body>
    <h1>Component audit for ${testUrl}</h1>
    ${get_doughtnut("assets", breakdown_values)}
    ${get_doughtnut("js", per_domain)}
    ${get_doughtnut("1st party", first_party)}
</body>
</html>
`;

  return html(body);
});
