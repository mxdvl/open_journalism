import type { Result } from "./parser.ts";
import { get_result } from "./parser.ts";

const map = new Map<string, Result>();

export const cached = async (test: string): Promise<Result> => {
  const found = map.get(test);
  if (found) return found;

  const result = await fetch(
    new URL(
      `https://www.webpagetest.org/jsonResult.php?${new URLSearchParams({
        test,
      })}`,
    ),
  )
    .then((r) => r.json())
    .then((d) => get_result(d));

  map.set(test, result);

  return result;
};

export const get_map = () => new Map(map);
