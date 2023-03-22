interface Item {
  label: string;
  size: number;
  colour?: string;
}

type Items = Item[];

const { format } = Intl.NumberFormat("en-GB");

export const get_table = (title: string, items: Items) => {
  const rows = items
    .map(({ label, size }) =>
      `<tr><td>${label}</td><td class="right">${
        format(Math.ceil(size / 1_000))
      } kB</td></tr>`
    )
    .join("\n");

  return `<h2>${title}</h2>
    <table>
        <thead>
            <td>Name</td>
            <td>Size</td>
        </thead>
        <tbody>
            ${rows}
        </tbody>
    </table>
  `;
};
