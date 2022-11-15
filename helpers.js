// Helper function to format the date
const formatDate = (date) => {
  const dateArr = date.split(".").map((dt) => parseInt(dt));

  return dateArr.join(".");
};

module.exports = {
  formatDate,
};
