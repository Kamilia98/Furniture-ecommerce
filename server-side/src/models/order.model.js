const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        color: {
          name: { type: String, required: true },
          hex: { type: String, required: true },
        },
      },
    ],
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      companyName: { type: String },
      additionalInfo: { type: String },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      // province: {type: String, required: true},
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'bank', 'Direct Bank Transfer', 'Cash on Delivery'],
      required: true,
    },
    orderNumber: { type: String, unique: true },

    transactionId: { type: String },
  },
  { timestamps: true }
);

OrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    try {
      const lastOrder = await mongoose
        .model('Order')
        .findOne()
        .sort({ createdAt: -1 });
      let newOrderNumber = 1000;
      let prefix = 'A';

      if (lastOrder && lastOrder.orderNumber) {
        const match = lastOrder.orderNumber.match(/^([A-Z])(\d+)$/);
        if (match) {
          let lastPrefix = match[1];
          let lastNumber = parseInt(match[2], 10);

          if (!isNaN(lastNumber) && lastNumber >= 1000 && lastNumber < 9999) {
            newOrderNumber = lastNumber + 1;
            prefix = lastPrefix;
          } else if (lastNumber >= 9999) {
            prefix = String.fromCharCode(lastPrefix.charCodeAt(0) + 1);
            newOrderNumber = 1000;
          }
        }
      }
      this.orderNumber = `${prefix}${newOrderNumber}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
