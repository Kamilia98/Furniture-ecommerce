const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    productImages: [{ type: String }],
    productPrice: { type: Number, required: true },
    productQuantity: { type: Number, required: true },
    productDate: { type: Date, default: Date.now }, /// is it important?
    productSale: { type: Number, default: 0 },
    productCategories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    ],
    productDescription: { type: String },

    // stockStatus: { type: String, enum: ["in stock", "out of stock"], default: "in stock" }, // better performance to be calculated in code

    dimensions: { width: Number, height: Number, depth: Number },
    material: { type: String },
    color: { type: String }, /// Should we put fixed colors?
    brand: { type: String },

    // eliminated for now //

    // ratings: { average: Number, totalReviews: Number },
    // reviews: [
    //   {
    //     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    //     review: { type: String },
    //     rating: { type: Number },
    //   },
    // ],

    /// FOR COMPARISON
    additionalInformation: {
      general: {
        salesPackage: { type: String },
        modelNumber: { type: String },
        secondaryMaterial: { type: String },
        configuration: { type: String },
        upholsteryMaterial: { type: String },
        upholsteryColor: { type: String },
      },

      productDetails: {
        fillingMaterial: { type: String },
        finishType: { type: String },
        adjustableHeadrest: { type: Boolean },
        maximumLoadCapacity: { type: Number },
        originOfManufacture: { type: String },
      },

      dimensions: {
        width: { type: Number },
        height: { type: Number },
        depth: { type: Number },
        seatHeight: { type: Number },
        legHeight: { type: Number },
      },

      materials: {
        primaryMaterial: { type: String },
        upholsteryMaterial: { type: String },
        upholsteryColor: { type: String },
        fillingMaterial: { type: String },
        finishType: { type: String },
      },

      specifications: {
        adjustableHeadrest: { type: Boolean },
        maximumLoadCapacity: { type: Number },
        originOfManufacture: { type: String },
        weight: { type: Number },
        brand: { type: String },
      },

      warranty: {
        summary: { type: String },
        serviceType: { type: String },
        covered: { type: String },
        notCovered: { type: String },
        domesticWarranty: { type: String },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
