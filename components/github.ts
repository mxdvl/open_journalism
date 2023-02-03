const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");

export const headers: HeadersInit = {
  "Authorization": `Bearer ${GITHUB_TOKEN}`,
};

// console.log(
//   await fetch("https://api.github.com/rate_limit", { headers })
//     .then((r) => r.json()),
// );
