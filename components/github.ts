import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";

const { GITHUB_TOKEN } = config();

export const headers: HeadersInit = {
  "Authorization": `Bearer ${GITHUB_TOKEN}`,
};

// console.log(
//   await fetch("https://api.github.com/rate_limit", { headers })
//     .then((r) => r.json()),
// );
