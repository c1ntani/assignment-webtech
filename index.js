const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const sql = require("./sql");

// Main function to start the express server
const StartServer = () => {
  // Creating express app
  const app = express();

  // Cross origin resource sharing enabling
  app.use(cors());
  app.use(express.json());

  // Connecting database
  const database = sql();

  // Registring routes
  app.use("/", routes(database));

  // Starting express app
  app.listen("8888", (err) => {
    if (err) {
      console.error("Error starting server : ", err);
    } else {
      console.log("Server started on port : 8888");
    }
  });
};

// Calling main function
StartServer();
