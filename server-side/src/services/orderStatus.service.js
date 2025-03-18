const cron = require("node-cron");
const Order = require("../models/order.model");

const updateOrderStatuses = async () => {
  try {
    const orders = await Order.find({ status: { $ne: "Delivered" } });

    for (let order of orders) {
      let nextStatus;
      switch (order.status) {
        case "Pending":
          nextStatus = "Processing";
          break;
        case "Processing":
          nextStatus = "Shipped";
          break;
        case "Shipped":
          nextStatus = "Delivered";
          break;
        default:
          continue;
      }

      order.status = nextStatus;
      await order.save();
      console.log(`Order ${order.orderNumber} updated to ${nextStatus}`);
    }
  } catch (error) {
    console.error("Error updating order statuses:", error);
  }
};

cron.schedule("*/2 * * * *", updateOrderStatuses);

module.exports = updateOrderStatuses;
