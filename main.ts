import { serve } from "https://deno.land/std@0.174.0/http/server.ts";
import { get_report } from "./audit.ts";
import { get_map } from "./cached.ts";
import { components_list } from "./components/components.ts";
import { get_pie } from "./pie.ts";
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

  if (test.endsWith(".png")) {
    return new Response(
      await Deno.readFile(import.meta.resolve(`./components/${test}`)),
      { headers: { "Content-Type": "image/png" } },
    );
  }

  if (test === "components") {
    return html(
      "Guardian Islands 🏝",
      `
      <style>
      ul#components {display: grid; padding: 0; max-width: 96rem; grid-template-columns: repeat(2, 1fr); gap: 1rem;}
      #components > li {
        list-style-type: none; border: 4px solid #eee;
        display: flex; flex-direction: column; height: min-content;
      }
      #components > li > * { padding: 0.25rem; }
      #components > li > header { display: flex; justify-content: space-between; }
      #components > li header, #components > li footer { background-color: #eee; }
      </style>
      <h1>Guardian Islands</h1>
      <h2>Automatically sourced from <a href="https://github.com/guardian/dotcom-rendering/tree/main/dotcom-rendering/src/web/components">Github</a></h2>
      <ul id="components">${components_list.join("\n")}</ul>`,
    );
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
  ${get_pie("assets", breakdown_values)}
  ${get_pie("js", per_domain)}
  ${get_pie("1st party", first_party)}
  
  ${get_table("1st party", first_party)}
  `,
  );
});
