const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        color: {
          name: { type: String, required: true },
          hex: { type: String, required: true },
        },
        quantity: { type: Number, required: true, min: 1 },
        subtotal: { type: Number },
      },
    ],
    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CartSchema.pre('save', async function (next) {
  try {
    console.log('Cart pre-save hook triggered.');

    await this.populate('products.id');
    console.log('Populated product details.');

    this.totalPrice = this.products.reduce((acc, product, index) => {
      if (!product.id) {
        console.warn(`Product at index ${index} not populated correctly.`);
        return acc;
      }

      const price = (
        product.id.sale
          ? product.id.price * (1 - product.id.sale / 100)
          : product.id.price
      ).toFixed(2);

      product.subtotal = product.quantity * parseFloat(price);

      console.log(
        `Product ${index}:`,
        `Name: ${product.id.name},`,
        `Color: ${JSON.stringify(product.color)},`,
        `Quantity: ${product.quantity},`,
        `Unit Price: ${price},`,
        `Subtotal: ${product.subtotal}`
      );

      return acc + product.subtotal;
    }, 0);

    console.log('Total price calculated:', this.totalPrice);

    next();
  } catch (err) {
    console.error('Error in Cart pre-save hook:', err);
    next(err);
  }
});

module.exports = mongoose.model('Cart', CartSchema);
