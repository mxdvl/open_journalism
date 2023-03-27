import {
  array,
  enum as literal_union,
  infer as inferred,
  number,
  object,
  string,
  tuple,
} from "https://deno.land/x/zod@v3.20.2/mod.ts";

const type = object({
  color: tuple([number(), number(), number()]),
  bytes: number(),
});

const request = object({
  full_url: string(),
  responseCode: number(),
  headers: object({ request: array(string()) }),
  request_type: literal_union([
    "Document",
    "Fetch",
    "Font",
    "Image",
    "Media",
    "Other",
    "Script",
    "Stylesheet",
    "XHR",
    "Preflight",
  ]).optional(),
  objectSize: number(),
});

const result = object({
  testUrl: string(),
  from: string(),
  median: object({
    firstView: object({
      "lighthouse.Performance": number().optional(),
      requests: array(request),
      breakdown: object({
        html: type,
        js: type,
        css: type,
        image: type,
        font: type,
        other: type,
      }),
    }),
  }),
});

export type Result = inferred<typeof result>;
type Request = inferred<typeof request>;
type Script = Request & {
  request_type: "Script";
};

export const is_script = (
  request: Request,
): request is Script => request.request_type === "Script";

const data = object({ data: result });

export const get_result = (json: unknown): Result => data.parse(json).data;
