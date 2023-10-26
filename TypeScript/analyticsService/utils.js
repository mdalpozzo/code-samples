const mapItemsForAnalytics = (bookingItems) => {
  return bookingItems.map((item) => {
    return {
      item_name: item.name,
      item_id: item.parent_item_id, // ??
      price: item.price / 100,
      quantity: item.count,
    };
  });
};

export default mapItemsForAnalytics;

// our item model
// {
//     booking_id: null
// coachnet_item: false
// count: 1
// created: null
// daily: false
// deferred: false
// delivery: false
// description: ""
// generator: false
// id: 0
// image_url: ""
// mileage: false
// name: "Rental Amount"
// original_tax_rate_id: 0
// other_claim: false
// outdoorsy_item: false
// parent_item_id: 0
// position: 0
// premium_amount: 0
// price: 47800
// rental_amount: true
// required: false
// tax_amount: 3465
// tax_description: "Cali sales tax?"
// tax_name: "LA"
// tax_rate: 7.25
// tax_rates: [{…}]
// total: 47800
// updated: null
// }

// GTM item model
// {
//     item_name: "Donut Friday Scented T-Shirt", // Name or ID is required.
//     item_id: "67890",
//     price: 33.75,
//     item_brand: "Google",
//     item_category: "Apparel",
//     item_category2: "Mens",
//     item_category3: "Shirts",
//     item_category4: "T shirts",
//     item_variant: "Black",
//     item_list_name: "Search Results",  // If associated with a list selection.
//     item_list_id: "SR123",  // If associated with a list selection.
//     index: 1,  // If associated with a list selection.
//     quantity: 1
// }
