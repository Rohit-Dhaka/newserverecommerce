import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";



const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const currency = "INR";



const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    if (
      !userId ||
      !items ||
      items.length === 0 ||
      !amount ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const newOrder = await orderModel.create({
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    });

    
    await userModel.findByIdAndUpdate(userId, {
      cartData: {},
    });

    return res.json({
      success: true,
      message: "Order Placed",
      orderId: newOrder._id,
    });

  } catch (error) {
    console.log("COD ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const placeOrderRazorpay = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    if (
      !userId ||
      !items ||
      items.length === 0 ||
      !amount ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }



    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100),
      currency: currency,
      receipt: `receipt_${Date.now()}`,
    });



    const newOrder = await orderModel.create({
      userId,
      items,
      address,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      razorpayOrderId: razorpayOrder.id,
      date: Date.now(),
    });

    return res.json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
      mongoOrderId: newOrder._id,
    });

  } catch (error) {
    console.log("RAZORPAY ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const verifyRazorpay = async (req, res) => {
  try {
    const {
      userId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !userId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment data",
      });
    }



    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");



    const signatureMatch = crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpay_signature)
    );

    if (!signatureMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }



    const payment = await razorpayInstance.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }



    const order = await orderModel.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }


    if (order.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized order",
      });
    }



    if (order.payment) {
      return res.json({
        success: true,
        message: "Already verified",
      });
    }

   

    if (
      Math.round(order.amount * 100) !== payment.amount
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount mismatch",
      });
    }

 

    order.payment = true;

    order.razorpayOrderId =
      razorpay_order_id;

    order.razorpayPaymentId =
      razorpay_payment_id;

    order.razorpaySignature =
      razorpay_signature;

    await order.save();



    await userModel.findByIdAndUpdate(userId, {
      cartData: {},
    });

    return res.json({
      success: true,
      message: "Payment Successful",
    });

  } catch (error) {
    console.log("VERIFY RAZORPAY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});

    return res.json({
      success: true,
      orders,
    });

  } catch (error) {
    console.log("ALL ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;

    const orders = await orderModel.find({
      userId,
    });

    return res.json({
      success: true,
      orders,
    });

  } catch (error) {
    console.log("USER ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    await orderModel.findByIdAndUpdate(
      orderId,
      {
        status,
      }
    );

    return res.json({
      success: true,
      message: "Status Updated",
    });

  } catch (error) {
    console.log("UPDATE STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export {
  placeOrder,
  placeOrderRazorpay,
  verifyRazorpay,
  allOrders,
  userOrders,
  updateStatus,
};