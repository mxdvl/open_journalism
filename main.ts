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

    const params = test ? "?" + new URLSearchParams({ test }).toString() : "";

    return Response.redirect(
      `https://guardian.github.io/open-journalism/${params}`,
    );
  } catch (error) {
    return new Response(error, {
      status: 500,
    });
  }
});
