import { serve } from "https://deno.land/std@0.180.0/http/server.ts";

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
