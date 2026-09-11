export const demoReservationAdapter = {
  basis: "concept",
  locationId: "zrh-airside-center",
  label: "Zürich Duty Free departure shop",
  async prepareReservation({ basket, travel }) {
    return { accepted: Object.keys(basket).length > 0 && Boolean(travel.departureDateTime),
      submittedExternally: false, pickupLocation: "Zürich Duty Free departure shop" };
  },
};
