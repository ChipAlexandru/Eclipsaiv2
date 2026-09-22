import { sampleStock } from "./pickupJourney.mjs";

/** Illustrative quantities only. This adapter never contacts a store system. */
export const demoStockAdapter = {
  basis: "sample",
  label: "Branch-specific sample stock · not live",
  async getAvailability(productIds, branchId = "erlenbach") {
    return productIds.map((productId) => ({
      productId, branchId, quantity: sampleStock(productId, branchId), basis: "sample",
    }));
  },
};

export function sampleQuantity(productId, branchId = "erlenbach") {
  return sampleStock(productId, branchId);
}
