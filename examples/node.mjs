import { date, number, time } from "arabic-kit";

const orders = [
  { id: "ORD-2026-00412", total: 8490, createdAt: "14:05" },
  { id: "ORD-2026-00413", total: 1290.5, createdAt: "18:30" },
  { id: "ORD-2026-00414", total: 0, createdAt: "09:00" },
];

const reportDay = "2026-09-28";

console.log(`تقرير ${date(reportDay, { locale: "ar", month: "long" })}`);
console.log("=".repeat(40));

for (const order of orders) {
  const total = number(order.total, { locale: "ar", group: true });
  const at = time(order.createdAt, { locale: "ar", hour12: true });

  console.log(`${order.id}  ${total}  ${at}`);
}

const sum = orders.reduce((acc, order) => acc + order.total, 0);

console.log("-".repeat(40));
console.log(`الإجمالي: ${number(sum, { locale: "ar", group: true })}`);
