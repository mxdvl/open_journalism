import {
  array,
  enum as literal_union,
  infer as inferred,
  literal,
  number,
  object,
  record,
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

const step = object({
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
});

const single_run = object({
  numSteps: literal(1),
}).merge(step);

const multiple_run = object({
  numSteps: literal(2),
  steps: array(step).nonempty(),
});

const result = object({
  testUrl: string(),
  from: string(),
  runs: object({
    "1": object({
      firstView: single_run.or(multiple_run),
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
