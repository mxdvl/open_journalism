/** τ = 2π https://en.wikipedia.org/wiki/Turn_(angle)#Tau_proposals */
const tau = Math.PI * 2;

const PRECISION = 3;
const radius = 300;

interface Item {
  label: string;
  size: number;
  colour?: string;
}

type Items = Item[];

const polar_to_cartesian = (angle: number, radius: number) => ({
  x: (Math.cos(angle) * radius).toFixed(PRECISION),
  y: (Math.sin(angle) * radius).toFixed(PRECISION),
});

const get_segments = (
  items: Items,
) => {
  const total = items.reduce((acc, { size }) => acc + size, 0);
  return items.reduce<{
    start: number;
    segments: string[];
    texts: string[];
  }>(
    ({ start, segments, texts }, { label, size, colour }, index) => {
      if (size < total / 1000) return { start, segments, texts };

      const length = (size / total) * tau;

      const mid = start + length / 2;
      const end = start + length;

      //   const adjust = (index % 2 === 0 ? 1 : -1) * radius / 20;

      const fallback_colour = `hsl(${index * 44} 72% 60%)`;

      const { x: x_start, y: y_start } = polar_to_cartesian(start, radius);
      const { x: x_end, y: y_end } = polar_to_cartesian(end, radius);

      const large_arc_flag = size / total > 0.5 ? "1" : "0";

      const d = [
        "M0,0",
        `L${x_start},${y_start}`,
        `A ${radius} ${radius} 0 ${large_arc_flag} 1 ${x_end},${y_end}`,
        "Z",
      ];

      const segment = `
      <path fill="${colour ?? fallback_colour}" d="${d.join(" ")}"/>
      `;

      const { x: x_mid, y: y_mid } = polar_to_cartesian(mid, 2 / 3 * radius);

      const text = `
      <text fill="black" x="${x_mid}" y="${y_mid}" >
        <tspan dx="0" dy="0">${label}</tspan>
        <tspan x="${x_mid}" dy="1.5em">${
        (100 * size / total).toFixed(0)
      }%</tspan>
      </text>`;

      return {
        start: end,
        segments: segments.concat(segment),
        texts: texts.concat(text),
      };
    },
    { start: -(tau / 4), segments: [], texts: [] },
  );
};

export const get_doughtnut = (title: string, items: Items): string => {
  const { segments, texts } = get_segments(items);
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="-300,-300 600,600" width="600" height="600">
      <style>text { font-family: monospace; font-size: 16px; text-anchor: middle }</style>
      <g fill="none" stroke-width="90">
      ${segments.join("\n")}
      ${texts.join("\n")}
      </g>
      <circle cx="0" cy="0" r="50" fill="white" />
      <text x="0" y="0.5em" style="font-weight: bold;">${title}</text>
  </svg>
  `;
};
