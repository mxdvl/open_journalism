import { serve } from "https://deno.land/std@0.180.0/http/server.ts";
import { get_report } from "./audit.ts";
import { get_map } from "./cached.ts";
import { get_chart } from "./chart.ts";
// import { get_pie } from "./pie.ts";
import { get_table } from "./table.ts";

const template = await Deno.readTextFile("./index.html");

const to_string = (array: Record<string, string | number>[]) =>
  array.map((item) =>
    "{" + Object.entries(item).map(([key, value]) =>
      `${key}: ${typeof value === "number" ? value : `"${value}"`}`
    ) + "}"
  );

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

  const links = [
    per_domain
      .map(({ label, size }) => ({
        source: "js",
        target: label,
        value: size,
      })),
    first_party.slice(0, 6).map(({ label, size }) => ({
      source: "assets.guim.co.uk",
      target: label,
      value: size,
    })),
    breakdown_values
      .filter(({ label }) => label !== "js")
      .map((
        { label, size },
      ) => ({
        source: "everything else",
        target: label,
        value: size,
      })),
  ] satisfies { source: string; target: string; value: number }[][];

  return html(
    `Guardian page weight – ${test}`,
    `<h1>Guardian page weight report – <a href="https://www.webpagetest.org/result/${test}/">wepagetest #${test}</a></h1>
    <h2>${testUrl}</h2>
    ${[
      // get_pie("assets", breakdown_values),
      // get_pie("js", per_domain),
      get_chart(
        per_domain,
        breakdown_values.filter((value) => value.label !== "js"),
      ),
      // get_pie("1st party", first_party),
    ]}

    <script type="module">

    const links = [
      ${to_string(links.flat())}
    ]
    
    ${await Deno.readTextFile(
      new URL(import.meta.resolve("./sankey.js")),
    )};
    document.querySelector("#sankey")?.appendChild(chart);
    </script>

    <div id="sankey"></div>
  
  ${get_table("All JavaScript", per_domain)}
  ${get_table("1st party JavaScript", first_party)}
  `,
  );
});
