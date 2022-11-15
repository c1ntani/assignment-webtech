const moment = require("moment");
const cacheService = require("../services");

const helpers = require("../helpers");
const queries = require("../sql/queries");
const itemCategoryRules = require("../item_category_map.json");

const generateHandlers = (database) => {
  // Handler to add items in memeory
  const addItem = (req, res) => {
    const { name, category, price } = req.body;

    // Check if category is available in the item category list
    if (category && !itemCategoryRules.includes(category.toLowerCase())) {
      return res
        .status(400)
        .json({ error: "faliure", message: "Category is not allowed !" });
    }

    // Check if item name and price are presesnt
    if (!name || !price) {
      return res.status(400).json({
        error: "faliure",
        message: "Item name and price are required !",
      });
    }

    // Store the uploaded item in the in memory cache until the user card information is uploaded
    cacheService.addItem({ name, category, price });

    // Send success message to the user after the execution is finished successfully
    return res.status(200).json({ status: "success", message: "Item saved" });
  };

  // Handler to add card and store information
  const addCardStore = (req, res) => {
    let { card_number, store_name, location, date } = req.body;

    // Check if the required fields are present in the request body
    if (!card_number || !store_name || !location || !date) {
      return res.status(400).json({
        error: "faliure",
        message:
          "Bad Request. Card number, store name, location and date is required !",
      });
    }

    // Check if date is valid
    if (!moment(date, "DD.MM.YY", true).isValid()) {
      return res.status(400).json({
        error: "faliure",
        message: "Date is wrong, please enter date in format DD.MM.YY !",
      });
    }

    date = helpers.formatDate(date);

    // Retrieve all the items from the in memory cache
    let itemsList = cacheService.getItems();

    // Check if any items were uploaded, if not, throw bad request error
    if (!itemsList.length) {
      return res
        .status(400)
        .json({ error: "failure", message: "No items scanned !" });
    }

    // Run SQL query to insert the user card and store information in the 'card_store' table of SQLite database
    database.run(
      queries.saveStoreCardDetails,
      [card_number, store_name.toLowerCase(), location.toLowerCase(), date],
      function (err) {
        // Error handling if unable to insert data into database
        if (err) {
          console.log(err.message);

          return res.status(500).json({
            error: "failure",
            message: "Error while storing data into database",
          });
        }

        // Creating query to bulk upload items with foreign key card_store_id refering to the card and store
        let bulkUploadQuery = queries.saveItemDetails;

        // Retrieve all the items from the in memory cache
        itemsList = itemsList.map((item) => {
          bulkUploadQuery += `(?,?,?,?),`;

          return [item.name, item.category, item.price, this.lastID];
        });

        // Remove last ',' from the bulk upload query
        bulkUploadQuery = bulkUploadQuery.substring(
          0,
          bulkUploadQuery.length - 1
        );

        // Run the bulk upload SQL query to insert items into the 'Items' table
        database.run(bulkUploadQuery, [].concat(...itemsList), (err) => {
          // Error handling if unable to insert data into database
          if (err) {
            console.log(err);
            return res.status(500).json({
              error: "failure",
              message: "Error while storing data into database",
            });
          }

          // Reset the cache and remove all the items uploaded
          cacheService.resetItems();

          // Send success response after the insertion operations are completed
          res.status(200).json({
            status: "success",
            message: "Card and store details saved",
          });
        });
      }
    );
  };

  // Handler to get all items registered with card number
  const getItemsByCardNumber = (req, res) => {
    let card_number = req.params.card_number;

    // If card number is invalid, send bad request
    if (!card_number || !/^\d+$/.test(card_number)) {
      return res.status(400).json({
        error: "failed",
        message: "Card number is invalid or missing !",
      });
    }

    // Convert string to integer
    card_number = parseInt(card_number);

    // Run query to get the 'card_store_id' for the 'card_store' table using 'card_number'
    database.all(
      queries.getCardStoreIdByCardNumber,
      [card_number],
      (err, rows) => {
        // Error handling if unable to get data from database
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ error: "failed", message: "Error querying database" });
        }

        const ids = rows.map((item) => item.id);

        const getItemsQuery =
          queries.getItemsByCardStoreId + "(" + ids.join(",") + ")";

        // Run query to get the items list from the "items" table
        database.all(getItemsQuery, [], (err, items) => {
          // Error handling if unable to get data from database
          if (err) {
            console.log(err);
            return res
              .status(500)
              .json({ error: "failed", message: "Error querying database" });
          }

          // Send items list when the query is completed
          return res.status(200).json({ status: "success", items });
        });
      }
    );
  };

  // Handler to get all items by store name
  const getItemsByStore = (req, res) => {
    let store_name = req.params.store_name;

    // If store name is not present, send bad request
    if (!store_name) {
      return res.status(400).json({
        error: "failed",
        message: "Store name is invalid or missing !",
      });
    }

    // Run query to get the 'card_store_id' for the 'card_store' table using 'store_name'
    database.all(
      queries.getCardStoreIdByStoreName,
      [store_name],
      (err, rows) => {
        // Error handling if unable to get data from database
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ error: "failed", message: "Error querying database" });
        }

        const ids = rows.map((item) => item.id);

        const getItemsQuery =
          queries.getItemsByCardStoreId + "(" + ids.join(",") + ")";

        // Run query to get the items list from the "items" table
        database.all(getItemsQuery, [], (err, items) => {
          // Error handling if unable to get data from database
          if (err) {
            console.log(err);
            return res
              .status(500)
              .json({ error: "failed", message: "Error querying database" });
          }

          // Send items list when the query is completed
          return res.status(200).json({ status: "success", items });
        });
      }
    );
  };

  // Handler to get all items by store location
  const getItemsByLocation = (req, res) => {
    let location = req.params.location;

    // If store location is not present, send bad request
    if (!location) {
      return res.status(400).json({
        error: "failed",
        message: "Location is invalid or missing !",
      });
    }

    // Run query to get the 'card_store_id' for the 'card_store' table using 'location'
    database.all(
      queries.getCardStoreIdByStoreLocation,
      [location],
      (err, rows) => {
        // Error handling if unable to get data from database
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ error: "failed", message: "Error querying database" });
        }

        const ids = rows.map((item) => item.id);

        const getItemsQuery =
          queries.getItemsByCardStoreId + "(" + ids.join(",") + ")";

        // Run query to get the items list from the "items" table
        database.all(getItemsQuery, [], (err, items) => {
          // Error handling if unable to get data from database
          if (err) {
            console.log(err);
            return res
              .status(500)
              .json({ error: "failed", message: "Error querying database" });
          }

          // Send items list when the query is completed
          return res.status(200).json({ status: "success", items });
        });
      }
    );
  };

  // Handler to get all items by date
  const getItemsByDate = (req, res) => {
    let date = req.params.date;

    // If date is not present, send bad request
    if (!date || !moment(date, "DD.MM.YY", true).isValid()) {
      return res.status(400).json({
        error: "failed",
        message: "Date is invalid or missing. Use format DD.MM.YY !",
      });
    }

    // Run query to get the 'card_store_id' for the 'card_store' table using 'location'
    database.all(queries.getCardStoreDetailsByDate, [date], (err, rows) => {
      // Error handling if unable to get data from database
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "failed", message: "Error querying database" });
      }

      const cardIdMap = {};
      const ids = rows.map((item) => {
        cardIdMap[item.id] = item.card_number;
        return item.id;
      });

      const getItemsQuery =
        queries.getItemsByCardStoreId + "(" + ids.join(",") + ")";

      // Run query to get the items list from the "items" table
      database.all(getItemsQuery, [], (err, items) => {
        // Error handling if unable to get data from database
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ error: "failed", message: "Error querying database" });
        }

        // Add extra fields to the items list
        const finalItems = items.map((item) => {
          return {
            ...item,
            date,
            card_number: cardIdMap[item.card_store_id],
          };
        });

        // Send items list when the query is completed
        return res.status(200).json({ status: "success", finalItems });
      });
    });
  };

  // Handler to get all items by month year
  const getItemsByMonthYear = (req, res) => {
    let month = parseInt(req.params.month_number);
    let year = parseInt(req.params.year_number);

    // If month or year is not present, send bad request
    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({
        error: "failed",
        message: "Month or date is invalid or missing !",
      });
    }

    // Run query to get the 'card_store_id' for the 'card_store' table using 'month' and 'year'
    database.all(
      queries.getCardStoreDetailsByMonthYear,
      [`%.${month}.${year}`],
      (err, rows) => {
        // Error handling if unable to get data from database
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ error: "failed", message: "Error querying database" });
        }

        const cardIdMap = {};
        const ids = rows.map((item) => {
          cardIdMap[item.id] = [item.card_number, item.date];
          return item.id;
        });

        const getItemsQuery =
          queries.getItemsByCardStoreId + "(" + ids.join(",") + ")";

        // Run query to get the items list from the "items" table
        database.all(getItemsQuery, [], (err, items) => {
          // Error handling if unable to get data from database
          if (err) {
            console.log(err);
            return res
              .status(500)
              .json({ error: "failed", message: "Error querying database" });
          }

          // Add extra fields to the items list
          const finalItems = items.map((item) => {
            return {
              ...item,
              date: cardIdMap[item.card_store_id][1],
              card_number: cardIdMap[item.card_store_id][0],
            };
          });

          // Send items list when the query is completed
          return res.status(200).json({ status: "success", finalItems });
        });
      }
    );
  };

  // Handler to delete all items by card number
  const deleteItemsByCardNumber = (req, res) => {
    let card_number = req.params.card_number;

    // If card number is invalid, send bad request
    if (!card_number || !/^\d+$/.test(card_number)) {
      return res.status(400).json({
        error: "failed",
        message: "Card number is invalid or missing !",
      });
    }

    // Convert string to integer
    card_number = parseInt(card_number);

    // Run query to get the 'card_store_id' for the 'card_store' table using 'card_number'
    database.all(
      queries.getCardStoreIdByCardNumber,
      [card_number],
      (err, rows) => {
        // Error handling if unable to get data from database
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ error: "failed", message: "Error querying database" });
        }

        const ids = rows.map((item) => item.id);

        const getItemsQuery =
          queries.deleteItemsByCardStoreId + "(" + ids.join(",") + ")";

        // Run query to delete the items list from the "items" table
        database.all(getItemsQuery, [], (err) => {
          // Error handling if unable to get data from database
          if (err) {
            console.log(err);
            return res
              .status(500)
              .json({ error: "failed", message: "Error querying database" });
          }

          // Send items list when the query is completed
          return res
            .status(200)
            .json({ status: "success", message: "Items deleted successfully" });
        });
      }
    );
  };

  return {
    addItem,
    addCardStore,
    getItemsByCardNumber,
    getItemsByLocation,
    getItemsByStore,
    getItemsByDate,
    getItemsByMonthYear,
    deleteItemsByCardNumber,
  };
};

module.exports = generateHandlers;
