const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

// 450000 -> "Rp 450.000"
export function formatRupiah(amount: number) {
  return rupiah.format(amount);
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

// "2026-11-10" -> "10 Nov 2026". Dibaca sebagai UTC supaya tanggalnya tidak bergeser
// karena zona waktu.
export function formatDate(isoDate: string) {
  return dateFormat.format(new Date(`${isoDate}T00:00:00Z`));
}

// Memeriksa teks berbentuk yyyy-MM-dd yang merupakan tanggal sungguhan.
export function isIsoDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
  );
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}