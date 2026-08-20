// Mirrors home_service_qa_demo/src/utils/format.ts formatMoney, so assertions
// compare against exactly what the UI renders regardless of ICU/locale
// quirks in how "THB" is displayed.
export function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(value);
}
