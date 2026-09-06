import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        size: {
          type: String,
          default: "",
        },
      },
    ],

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    address: {
      firstName: {
        type: String,
        required: true,
      },

      lastName: {
        type: String,
        default: "",
      },

      email: {
        type: String,
        required: true,
      },

      street: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      zipcode: {
        type: String,
        required: true,
      },

      country: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },
    },

    status: {
      type: String,
      enum: [
        "Order Placed",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Order Placed",
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Razorpay"],
      required: true,
    },

    payment: {
      type: Boolean,
      default: false,
    },

    razorpayOrderId: {
      type: String,
      default: null,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    razorpaySignature: {
      type: String,
      default: null,
    },

    date: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const orderModel =
  mongoose.models.order ||
  mongoose.model("order", orderSchema);

export default orderModel;