/**
 * Demo implementation of the future store-stock boundary.
 *
 * A real adapter can implement the same async methods later without changing
 * the shopping UI or voice tools. This MVP must not call a live inventory or
 * order system, so the values below are deterministic sample data.
 */
export const demoStockAdapter = {
  basis: "sample",
  locationId: "erlenbach-demo",
  label: "Sample Erlenbach stock · not live",

  async getAvailability(productIds) {
    return productIds.map((productId) => ({
      productId,
      quantity: sampleQuantity(productId),
      basis: "sample",
    }));
  },

  async preparePickupPreview({ basket }) {
    return {
      accepted: Object.keys(basket).length > 0,
      simulated: true,
      location: "Juliette Erlenbach",
      pickupWindow: "Tomorrow, 10:30–11:00",
    };
  },
};

export function sampleQuantity(productId) {
  const hash = [...String(productId)].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return 3 + (hash % 10);
}
