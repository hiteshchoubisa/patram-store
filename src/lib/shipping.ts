export const SHIPPING_COST_INDIA = 49;
export const FREE_SHIPPING_MIN_ORDER = 249;

export interface ShippingAddressInput {
  city?: string;
  state?: string;
  address?: string;
  country?: string;
}

export interface ShippingInput extends ShippingAddressInput {
  subtotal?: number;
}

export function isUdaipurAddress({
  city = "",
  state = "",
  address = "",
}: ShippingAddressInput): boolean {
  const normalizedCity = city.toLowerCase().trim();
  const normalizedState = state.toLowerCase().trim();
  const normalizedAddress = address.toLowerCase().trim();

  return (
    (normalizedCity.includes("udaipur") || normalizedAddress.includes("udaipur")) &&
    (normalizedState.includes("rajasthan") || normalizedState.includes("raj"))
  );
}

export function qualifiesForFreeShipping({
  subtotal = 0,
  ...address
}: ShippingInput): boolean {
  return isUdaipurAddress(address) || subtotal >= FREE_SHIPPING_MIN_ORDER;
}

export function getShippingCost({ subtotal = 0, ...address }: ShippingInput): number {
  if (qualifiesForFreeShipping({ subtotal, ...address })) {
    return 0;
  }

  return SHIPPING_COST_INDIA;
}

export function getFreeShippingLabel({
  subtotal = 0,
  ...address
}: ShippingInput): string {
  const udaipur = isUdaipurAddress(address);
  const orderValue = subtotal >= FREE_SHIPPING_MIN_ORDER;

  if (udaipur && orderValue) return "Free";
  if (udaipur) return "Free (Udaipur)";
  if (orderValue) return "Free";
  return "Free";
}
