const express = require("express");

const generateHandlers = require("../handler");

const routes = (database) => {
  const router = express.Router();

  // Generating handlers for the routes
  const handlers = generateHandlers(database);

  // Post api for adding new ites
  router.post("/item", handlers.addItem);

  // Post api for adding card and store details
  router.post("/card", handlers.addCardStore);

  // GET api to get all the items registerd with a card number
  router.get("/card/:card_number", handlers.getItemsByCardNumber);

  // DELETE api to search items by month year
  router.delete("/card/:card_number", handlers.deleteItemsByCardNumber);

  // GET api to search items by store name
  router.get("/store/:store_name", handlers.getItemsByStore);

  // GET api to search items by store location
  router.get("/location/:location", handlers.getItemsByLocation);

  // GET api to search items by date
  router.get("/day/:date", handlers.getItemsByDate);

  // GET api to search items by month year
  router.get("/month/:month_number/:year_number", handlers.getItemsByMonthYear);

  return router;
};

module.exports = routes;
