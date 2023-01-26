import { serve } from "https://deno.land/std@0.174.0/http/server.ts";
import { get_report } from "./audit.ts";
import { get_map } from "./cached.ts";
import { get_doughtnut } from "./pie.ts";
import { get_table } from "./table.ts";

const template = await Deno.readTextFile("./index.html");

const html = (title: string, body: string) =>
  new Response(
    template
      .replace("<!-- title -->", title)
      .replace("<!-- body -->", body),
    {
      headers: {
        "Content-Type": "text/html",
      },
    },
  );

await serve(async (req) => {
  const test = new URL(req.url).pathname.slice(1);

  if (test === "favicon.ico") {
    return new Response("Not found", {
      status: 404,
    });
  }

  if (!test) {
    const map = get_map();
    return html(
      "Guardian Components audit",
      `<h1>Missing test id</h1>
  <p>
      To get a test report, please provide a WebPageTest id. See list below of recently checked:
  </p>
  <ul>
        ${
        [
          ...new Set([
            "230117_BiDcKE_8T2",
            "230117_BiDc1V_A4Z",
            "230117_BiDcMB_A49",
            "230117_BiDcHG_A09",
            ...map.keys(),
          ]),
        ]
          .map((id) =>
            `<li><a href="/${id}">${id}</a> – ${
              map.get(id)?.testUrl ?? "???"
            }</li>`
          )
          .join("\n")
      }
  </ul>
  `,
    );
  }

  const { testUrl, breakdown_values, per_domain, first_party } =
    await get_report(test);

  return html(
    `Guardian Components audit – ${testUrl}`,
    ` <h1>Component audit for ${testUrl}</h1>
  ${get_doughtnut("assets", breakdown_values)}
  ${get_doughtnut("js", per_domain)}
  ${get_doughtnut("1st party", first_party)}
  
  ${get_table("1st party", first_party)}
  `,
  );
});
