import { useId, useState } from "react";
import { date, digits, number, stretch, time } from "arabic-kit";
import type { Locale } from "arabic-kit";

type Tile = { label: string; value: number; period: string };

type Props = {
  locale?: Locale;
  tiles: Tile[];
  orders: { id: string; total: number; createdAt: string }[];
};

export function Dashboard({ locale = "ar", tiles, orders }: Props) {
  return (
    <section>
      {tiles.map((tile) => (
        <article key={tile.label}>
          <h2>{stretch(tile.label, 1)}</h2>
          <p>{number(tile.value, { locale, group: true })}</p>
          <time>{date(tile.period, { locale, month: "long" })}</time>
        </article>
      ))}

      <table>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{number(order.total, { locale, group: true })}</td>
              <td>{time(order.createdAt, { locale, hour12: true })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function NationalIdInput() {
  const fieldId = useId();
  const [typed, setTyped] = useState("");
  const [digitsOption, setDigitsOption] = useState<"arabic" | "latin">(
    "arabic",
  );

  const latin = digits(typed, "latin").replace(/\D/g, "").slice(0, 10);
  const display = latin ? digits(latin, digitsOption) : "";

  return (
    <div>
      <label htmlFor={fieldId}>الرقم الوطني</label>
      <input
        id={fieldId}
        inputMode="numeric"
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
      />

      <button
        type="button"
        onClick={() =>
          setDigitsOption(digitsOption === "arabic" ? "latin" : "arabic")
        }
      >
        {digitsOption === "arabic"
          ? "عرض بالأرقام العربية"
          : "عرض بالأرقام اللاتينية"}
      </button>

      <p>{display}</p>
    </div>
  );
}
