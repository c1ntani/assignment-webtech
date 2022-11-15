// In memory cache to store items until card number is posted
let allItems = [];

// Function to add item to cache
const addItem = (item) => {
  item.name = item.name.toLowerCase();

  if (!item.category) item.category = "";
  else item.category = item.category.toLowerCase();

  allItems.push(item);
};

// Function to get items from cache
const getItems = () => {
  return allItems;
};

// Function to reset the cache
const resetItems = () => {
  allItems = [];
};

module.exports = {
  addItem,
  getItems,
  resetItems,
};
