import { date, digits, number, stretch, time } from "arabic-kit";

const locale = "ar";
const format = { locale, group: true };

console.log("=== جامعة: جدول امتحانات ===");

const student = { id: "0234517", examDate: "2026-10-04", startTime: "08:30" };

console.log(`رقم الطالب: ${number(student.id, { locale })}`);
console.log(`رقم الطالب (مع تجميع): ${number(student.id, { ...format })}`);
console.log(date(student.examDate, { locale, month: "long", weekday: true }));
console.log(`الساعة: ${time(student.startTime, { locale })}`);

console.log("\n=== جهة حكومية: موعد استخراج ===");

const appointment = {
  nationalId: "1098765432",
  day: "2026-09-28",
  at: "11:15",
};

console.log(`الرقم الوطني: ${number(appointment.nationalId, { locale })}`);
console.log(
  `الموعد: ${date(appointment.day, { locale, month: "long", weekday: true })}`,
);
console.log(`الساعة: ${time(appointment.at, { locale, hour12: true })}`);
console.log(
  `  مع تحويل الأرقام: ${digits(`الرقم الوطني: ${appointment.nationalId}`, "arabic")}`,
);

console.log("\n=== SaaS: بطاقات لوحة التحكم ===");

const usage = { seats: 1240, unused: 87, period: "2026-09-28" };

console.log(
  stretch(`ملخص الفترة ${date(usage.period, { locale, month: "long" })}`, 1),
);
console.log(`المقاعد: ${number(usage.seats, { ...format })}`);
console.log(`غير المستخدم: ${number(usage.unused, { ...format })}`);

console.log("\n=== تصدير CSV ===");

const reportRows = [
  { label: "المبيعات", value: 25000, time: "17:45" },
  { label: "المرتجعات", value: 1200, time: "19:10" },
];

for (const row of reportRows) {
  console.log(
    [
      row.label,
      number(row.value, { ...format }),
      time(row.time, { locale }),
    ].join(","),
  );
}

console.log("\n=== إدخال نموذج: أرقام عربية من لوحة المفاتيح ===");

const normalizeDigits = (typed) => digits(typed, "latin");

console.log(normalizeDigits("١٠٩٨٧٦٥٤٣٢"));
console.log(date(normalizeDigits("٢٠٢٦-٠٩-٢٨"), { locale, month: "long" }));
console.log(number(normalizeDigits("١٠٩٨٧٦٥٤٣٢"), { locale }));
