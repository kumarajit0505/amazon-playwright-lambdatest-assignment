const TEST_DATA = {
  iphone: {
    searchQuery: "iPhone 15 Pro",
    displayName: "iPhone 15 Pro",
    titlePattern: /iphone/i,
    brandFilter: "Apple",
    deliveryCountry: {
      code: "CA",
      name: "Canada",
    },
  },

  galaxy: {
    searchQuery: "Samsung Galaxy S24",
    displayName: "Samsung Galaxy S24",
    titlePattern: /galaxy|samsung/i,
    brandFilter: "Samsung",
    deliveryCountry: {
      code: "CA",
      name: "Canada",
    },
  },
};

module.exports = TEST_DATA;
