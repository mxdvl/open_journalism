import { serve } from "https://deno.land/std@0.174.0/http/server.ts";
import { get_report } from "./audit.ts";
import { get_doughtnut } from "./pie.ts";

await serve(async (req) => {
  const test = new URL(req.url).pathname.slice(1);

  console.log(test);

  if (!test || test === "") throw new Error("Missing test ID");

  const { testUrl, breakdown_values, per_domain, first_party } =
    await get_report(test);

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

  return new Response(body, {
    headers: {
      "Content-Type": "text/html",
    },
  });
});
