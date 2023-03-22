import { Item, Items } from "./pie.ts";

const size = 600;
const width = 360;

const to_pixel = (n: number) => Math.ceil(n / 3_000);

const get_bars = (items: Items) =>
  items.reduce<{ bars: string[]; running_total: number }>(
    ({ bars, running_total }, item) => {
      const pixels = to_pixel(item.size);

      bars.push(
        [
          `<rect x=${20} y=${
            running_total - pixels
          } height=${pixels} width=20 fill="${item.colour}" />`,
          `<text x=${45} y=${
            running_total - pixels / 2
          } text-align="left" fill=black>${item.label}</text>`,
        ].join("\n"),
      );

      return { bars, running_total: running_total - pixels };
    },
    { bars: [], running_total: size },
  ).bars;

type Group = "Guardian" | "SourcePoint" | "YouTube" | "Other";

const get_group = (label: string): [Group, string] => {
  switch (label) {
    case "assets.guim.co.uk":
    case "sourcepoint.theguardian.com":
    case "contributions.guardianapis.com":
      return ["Guardian", "#052962"];

    case "www.youtube-nocookie.com":
    case "www.youtube.com":
      return ["YouTube", "tomato"];

    case "www.google-analytics.com":
    case "www.google.com":
      return ["Other", "grey"];

    default:
      return ["Other", "grey"];
  }
};

const group_items = (items: Items) =>
  items.reduce((grouped_items, item) => {
    const [group, colour] = get_group(item.label);
    const running_total = grouped_items.get(group)?.size ?? 0;
    const size = running_total + item.size;

    grouped_items.set(group, {
      label: group + ` (${Math.ceil(size / 1000)} kB)`,
      size,
      colour,
    });

    return grouped_items;
  }, new Map<Group, Item>()).values();

export const get_chart = (items: Items, not_js: Items) => {
  const bars = get_bars([...group_items(items)]);

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0,30 ${width},${size}" width="${width}" height="${size}">
      <style>text { font-family: monospace; font-size: 12px; text-anchor: left }</style>
      
      ${
    Array.from({ length: 7 }, (_, i) => {
      const y = size - to_pixel(i * 250_000);
      return [
        `<line stroke="#ccc" x2=${width - 60} y1=${y} y2=${y} />`,
        `<text fill="#777" x=${width} text-anchor="end" y=${y + 5}>${
          i * 250
        } kB</text>`,
      ].flat();
    }).join("\n")
  }
      
        <g fill="none" stroke-width="90" transform="translate(90 0)">
        ${bars.join("\n")}
        </g>
        <g fill="none" stroke-width="90" transform="translate(0 0)">
        ${get_bars(not_js).join("\n")}
        </g>
      <text x="0" y="0.5em" style="font-weight: bold;">${"BAR CHART"}</text>
  </svg>
  `;
};
