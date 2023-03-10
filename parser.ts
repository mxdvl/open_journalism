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
  request_type: literal_union([
    "Document",
    "Fetch",
    "Font",
    "Image",
    "Other",
    "Script",
    "Stylesheet",
    "XHR",
    "Preflight",
  ]).optional(),
  contentType: string(),
  objectSize: number(),
});

const result = object({
  testUrl: string(),
  median: object({
    firstView: object({
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
