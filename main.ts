import { serve } from "https://deno.land/std@0.180.0/http/server.ts";
import { get_report } from "./audit.ts";
import { get_map } from "./cached.ts";
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
  try {
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

    const {
      testUrl,
      per_domain,
      first_party,
      performance,
      from,
      requests,
      extraData,
    } = await get_report(test);

    const total = requests.reduce((acc, req) => acc + req.objectSize, 0);

    const sorted_requests = requests
      .filter(({ request_type }) => request_type !== "Preflight")
      .map((request) =>
        request.request_type === "Image"
          ? { ...request, request_type: "Media" }
          : request
      )
      .map((request) =>
        request.full_url.endsWith(".mp4")
          ? { ...request, request_type: "Media" }
          : request
      )
      .sort((a, b) => b.objectSize - a.objectSize);

    const requests_per_type_and_domain = [
      ...sorted_requests
        .reduce((map, { full_url, request_type, objectSize }) => {
          const id = [request_type, new URL(full_url).hostname].join("/");
          const existing = map.get(id) ?? 0;
          map.set(id, existing + objectSize);
          return map;
        }, new Map<string, number>()).entries(),
    ];

    const threshold = total / 250;

    const sorted_requests_above_threshold = sorted_requests
      .filter(({ objectSize }) => objectSize > threshold);

    const links = [
      requests_per_type_and_domain
        .filter(([, value]) => value > 960)
        .map(([target, value]) => ({
          source: target.split("/").at(0) === "Script"
            ? "Script"
            : "Everything else",
          target,
          value,
        })),

      sorted_requests_above_threshold
        .map(({ request_type, full_url, objectSize }) => ({
          source: [request_type, new URL(full_url).hostname].join("/"),
          target: [
            request_type,
            new URL(full_url).hostname,
            new URL(full_url).pathname.slice(1),
          ].join("/"),
          value: objectSize,
        })),
    ] satisfies { source: string; target: string; value: number }[][];

    const node_padding = 12;
    const height = Math.ceil(total / 2_400) +
      sorted_requests_above_threshold.length * node_padding;

    const perf_score = performance === undefined
      ? "<h3>(no Lighthouse score for this test)</h3>"
      : `<h3>Lighthouse performance score: ${
        Math.round(performance * 100)
      }</h3>`;

    return html(
      `Guardian page weight – ${test}`,
      `<h1>Guardian page weight report – <a href="https://www.webpagetest.org/result/${test}/">wepagetest #${test}</a></h1>
    <h2>${testUrl}</h2>

    ${perf_score}
    <h3>From: ${from}</h3>

    <ul>
      <li>TTFB: ${extraData.ttfb}</li>
      <li>LCP: ${extraData.lcp}</li>
      <li>CLS: ${extraData.cls?.toFixed(3)}</li>
      <li>TBT: ${extraData.tbt}</li>
    </ul>


    <script type="module">
    const links = [
      ${to_string(links.flat())}
    ]

    const height = ${height};
    const nodePadding = ${node_padding};
    
    ${await Deno.readTextFile(
        new URL(import.meta.resolve("./sankey.js")),
      )};
    document.querySelector("#sankey")?.appendChild(chart);
    </script>

    <div id="sankey" style="display: flex; min-height: ${height}px; position: relative;">

    <ul class="key" style="list-style-type: none; display: flex; gap: 20px; padding: 0; position: absolute; bottom: 0; left: 0;"></ul>
    </div>

    <div id="tables" style="display: flex; flex-wrap: wrap; gap: 1em;">
    ${get_table("JS size per domain", per_domain)}
    ${get_table("JS files on assets.guim.co.uk", first_party)}
    </div>
  `,
    );
  } catch (error) {
    return new Response(error, {
      status: 500,
    });
  }
});
