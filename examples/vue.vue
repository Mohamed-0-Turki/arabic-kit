<script setup lang="ts">
import { computed, ref } from "vue";
import { date, digits, number, time } from "arabic-kit";
import type { Locale } from "arabic-kit";

const props = withDefaults(
  defineProps<{
    locale?: Locale;
    orders: { id: string; total: number; createdAt: string }[];
  }>(),
  { locale: "ar" },
);

const typed = ref("");

const nationalId = computed(() =>
  digits(typed.value, "latin").replace(/\D/g, "").slice(0, 10),
);

const nationalIdDisplay = computed(() =>
  nationalId.value ? digits(nationalId.value, "arabic") : "—",
);
</script>

<template>
  <section dir="rtl">
    <table>
      <thead>
        <tr>
          <th>المرجع</th>
          <th>الإجمالي</th>
          <th>الوقت</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in props.orders" :key="order.id">
          <td>{{ order.id }}</td>
          <td>
            {{ number(order.total, { locale: props.locale, group: true }) }}
          </td>
          <td>
            {{ time(order.createdAt, { locale: props.locale, hour12: true }) }}
          </td>
        </tr>
      </tbody>
    </table>

    <p>{{ date("2026-09-28", { locale: props.locale, month: "long" }) }}</p>

    <label>
      الرقم الوطني
      <input v-model="typed" inputmode="numeric" />
    </label>
    <p>{{ nationalIdDisplay }}</p>
  </section>
</template>
