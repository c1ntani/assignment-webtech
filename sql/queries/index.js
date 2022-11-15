module.exports = {
  createItemsTable: `CREATE TABLE items(id INTEGER PRIMARY KEY, name TEXT, category TEXT, price INTEGER, card_store_id INTEGER )`,
  createCardStoreTable: `CREATE TABLE card_store(id INTEGER PRIMARY KEY, card_number INTEGER, store_name TEXT, location TEXT, date TEXT )`,
  saveStoreCardDetails: `INSERT into card_store(card_number, store_name, location, date) VALUES(?,?,?,?)`,
  saveItemDetails: `INSERT into items(name, category, price, card_store_id) VALUES`,
  getCardStoreIdByCardNumber: `SELECT id FROM card_store WHERE card_number = ?`,
  getCardStoreIdByStoreName: `SELECT id FROM card_store WHERE store_name = ?`,
  getCardStoreIdByStoreLocation: `SELECT id FROM card_store WHERE location = ?`,
  getCardStoreDetailsByDate: `SELECT id, card_number, date FROM card_store WHERE date = ?`,
  getCardStoreDetailsByMonthYear: `SELECT id, card_number, date FROM card_store WHERE date like ?`,
  getItemsByCardStoreId: `SELECT * FROM items WHERE card_store_id IN `,
  deleteItemsByCardStoreId: `Delete FROM items WHERE card_store_id IN `,
};
