import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Mail from "../models/mailModel.js";
import Product from "../models/productModel.js";

//Desc: Fetch all  orders
//Route: GET/api/orders
//Access: Private
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate(
    "user",
    "_id firstName lastName"
  );

  if (!orders) {
    res.json({ orders: [], statistics: {} });
    return;
  }

  const statistics = orders.reduce(
    (acc, order) => {
      acc.qtyPaid += order.isPaid ? 1 : 0;
      acc.qtyNotPaid += !order.isPaid ? 1 : 0;
      acc.costPaid += order.isPaid ? +order.totalCost : 0;
      acc.costNotPaid += !order.isPaid ? +order.totalCost : 0;
      acc.totalItemsPaid += order.isPaid ? +order.itemsPrice : 0;
      acc.totalItemsNotPaid += !order.isPaid ? +order.itemsPrice : 0;
      acc.totalPricePaid += order.isPaid ? +order.totalPrice : 0;
      acc.totalPriceNotPaid += !order.isPaid ? +order.totalPrice : 0;
      acc.taxPaid += order.isPaid ? +order.taxPrice : 0;
      acc.taxNotPaid += !order.isPaid ? +order.taxPrice : 0;
      acc.shippingPaid += order.isPaid ? +order.shippingPrice : 0;
      acc.shippingNotPaid += !order.isPaid ? +order.shippingPrice : 0;
      acc.qtyStandard += order.shippingPrice === 5 ? 1 : 0;
      acc.qtyFree += order.shippingPrice === 0 ? 1 : 0;
      acc.qtyFastest += order.shippingPrice === 10 ? 1 : 0;
      acc.qtySent += order.isSent ? 1 : 0;
      acc.qtyNotSent += !order.isSent ? 1 : 0;
      acc.qtyDelivered += order.isDelivered ? 1 : 0;
      acc.totalItemsReturn += +order.itemsPriceReturn;
      acc.totalReturnPaid += order.isPaid ? +order.totalPriceReturn : 0;
      acc.totalReturnNotPaid += !order.isPaid ? +order.totalPriceReturn : 0;
      acc.totalShippingReturn += +order.shippingPriceReturn;
      acc.totalTaxReturnPaid += order.isPaid ? +order.taxPriceReturn : 0;
      acc.totalTaxReturnNotPaid += !order.isPaid ? +order.taxPriceReturn : 0;
      acc.qtyReturn += order.returnActive ? 1 : 0;
      acc.qtyReturnReceived += order.returnReceived ? 1 : 0;
      acc.qtyReturnActive += order.returnActive && !order.returnClosed ? 1 : 0;
      acc.qtyReturnClosed += order.returnActive && order.returnClosed ? 1 : 0;
      acc.qtyGift += +order.giftPrice > 0 ? 1 : 0;
      acc.totalGiftPrice += +order.giftPrice;
      acc.qtyExtra += +order.extraPrice > 0 ? 1 : 0;
      acc.totalExtraPrice += +order.extraPrice;
      acc.qtyExtraActive += order.isExtra ? 1 : 0;
      acc.qtyExtraNotActive += +order.extraPrice > 0 && !order.isExtra ? 1 : 0;
      acc.qtyVoucher += order.voucher !== "00" ? 1 : 0;
      return acc;
    },
    {
      qtyPaid: 0,
      qtyNotPaid: 0,
      costPaid: 0,
      costNotPaid: 0,
      totalItemsPaid: 0,
      totalItemsNotPaid: 0,
      totalPricePaid: 0,
      totalPriceNotPaid: 0,
      taxPaid: 0,
      taxNotPaid: 0,
      shippingPaid: 0,
      shippingNotPaid: 0,
      qtyStandard: 0,
      qtyFree: 0,
      qtyFastest: 0,
      qtySent: 0,
      qtyNotSent: 0,
      qtyDelivered: 0,
      totalItemsReturn: 0,
      totalReturnPaid: 0,
      totalReturnNotPaid: 0,
      totalShippingReturn: 0,
      totalTaxReturnPaid: 0,
      totalTaxReturnNotPaid: 0,
      qtyReturn: 0,
      qtyReturnReceived: 0,
      qtyReturnActive: 0,
      qtyReturnClosed: 0,
      qtyGift: 0,
      totalGiftPrice: 0,
      qtyExtra: 0,
      totalExtraPrice: 0,
      qtyExtraActive: 0,
      qtyExtraNotActive: 0,
      qtyVoucher: 0,
    }
  );

  res.json({ orders, statistics });
});

//Desc:Get order By Id
//Route: GET/api/orders/:id
//Access: Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "firstName lastName"
  );
  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

//Desc: Create new order
//Route: POST/api/orders
//Access: Private
const addOrderItems = asyncHandler(async (req, res) => {
  const user = await User.findById(req.body._id);
  var cartItems = [];

  if (user && !user.deleted && user.cart.length > 0) {
    cartItems = [...user.cart];

    if (cartItems.length === 0) {
      res.status(400);
      throw new Error("No Order Items");
    }

    const order = new Order({
      orderItems: cartItems,
      user: req.body._id,
      shippingAddress: {
        name: req.body.name,
        address: req.body.address,
        city: req.body.city,
        postalCode: req.body.postalCode,
        country: req.body.country,
      },
      invoiceAddress: {
        name: req.body.nameInvoice,
        address: req.body.addressInvoice,
        city: req.body.cityInvoice,
        postalCode: req.body.postalCodeInvoice,
        country: req.body.countryInvoice,
      },
      payment: {
        method: req.body.method,
        account: req.body.account,
      },
    });

    if (order && order.orderItems) {
      order.orderItems.forEach(async (item) => {
        const product = await Product.findById(item._id);
        if (product) {
          product.quantity -= +item.quantity;
          if (+product.quantity < 0) {
            throw new Error("One of the Items is out of stock");
          } else {
            await product.save();
          }
        }
      });

      order.itemsCost = order.orderItems
        .reduce((acc, item) => acc + +item.quantity * +item.pricePurchase, 0)
        .toFixed(2);

      order.itemsPrice = order.orderItems
        .reduce(
          (acc, item) =>
            acc +
            +item.quantity * +item.price -
            +item.quantity * +item.price * +item.discount +
            +item.quantity * +item.price * +item.warranty +
            +item.quantity * (+item.extra1 + +item.extra2) +
            +item.gift,
          0
        )
        .toFixed(2);

      order.extraPrice = order.orderItems
        .reduce(
          (acc, item) =>
            acc + +item.quantity * +item.extra1 + +item.quantity * +item.extra2,
          0
        )
        .toFixed(2);

      order.giftPrice = order.orderItems
        .reduce((acc, item) => acc + +item.gift, 0)
        .toFixed(2);

      order.primePrice = req.body.prime === "Yes" && !user.isPrime ? 70 : 0;

      order.franchisePrice =
        req.body.franchise === "Yes" && !user.testPaid ? 500 : 0;

      order.shippingPrice =
        +req.body.delivery === 10
          ? 10
          : +order.itemsPrice > 800 || +order.primePrice > 0 || user.isPrime
          ? 0
          : 5;

      order.taxPrice = (
        (+order.itemsPrice +
          +order.shippingPrice +
          +order.primePrice +
          +order.franchisePrice) *
        0.15
      ).toFixed(2);

      //Cost: gift= 10%, prime=10%, franchise=30%
      order.totalCost = (
        +order.itemsCost +
        +order.giftPrice * 0.1 +
        +order.primePrice * 0.1 +
        +order.franchisePrice * 0.3
      ).toFixed(2);

      order.totalPrice = (
        +order.itemsPrice +
        +order.taxPrice +
        +order.primePrice +
        +order.franchisePrice +
        +order.shippingPrice
      ).toFixed(2);

      user.cart = [];
      user.subtotal = 0;
      await user.save();

      await order.save();
      res.status(201).json(order);
    }
  }
});

//Desc:Update order to paid
//Route: PUT/api/order/:id/paid
//Access: Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  const user = await User.findById(order.user._id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  if (user && !user.deleted && +order.primePrice === 70) {
    user.isPrime = true;
    user.primeFrom = Date.now();
  }
  if (user && !user.deleted && +order.franchisePrice === 500) {
    user.testPaid = true;
  }
  await user.save();

  const userManager = await User.findOne({ email: "manager@web.de" });
  if (
    user &&
    !user.deleted &&
    userManager &&
    +order.primePrice === 70 &&
    userManager.email !== user.email
  ) {
    const mail = new Mail({
      user: userManager._id,
      mailTarget: user.email,
      firstNameTarget: user.firstName,
      lastNameTarget: user.lastName,
      subject: `Your Premium Membership, ${user.firstName}!`,
      message: `Hello, ${user.firstName}!
      Thank you for the subscription! Your Premium Membership has started from ${user.primeFrom}`,
    });
    await mail.save();
  }

  if (
    user &&
    !user.deleted &&
    userManager &&
    +order.franchisePrice === 500 &&
    userManager.email !== user.email
  ) {
    const mail = new Mail({
      user: userManager._id,
      mailTarget: user.email,
      firstNameTarget: user.firstName,
      lastNameTarget: user.lastName,
      subject: `Your Franchise Association Membership, ${user.firstName}!`,
      message: `Hello, ${user.firstName}! Thank you for the subscription!
      In order to become a Member of the Franchise Association you need to complete the training.`,
    });
    await mail.save();
  }

  await order.save();
  res.json(order);
});

//Desc: Submit customer voucher
//Route: PUT/api/order/:id/voucher
//Access: Private
const updateCustomerVoucher = asyncHandler(async (req, res) => {
  const voucherExists = await Order.findOne({
    voucher: req.body.voucher,
  });
  if (voucherExists) {
    res.status(400);
    throw new Error("This Voucher is already submitted!");
  }

  const order = await Order.findById(req.params.id);

  if (!order || order.returnActive) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.voucher = req.body.voucher;
  order.taxPrice = (
    (+order.itemsPrice +
      +order.shippingPrice +
      +order.primePrice +
      +order.franchisePrice -
      10) *
    0.15
  ).toFixed(2);

  order.totalPrice = (
    +order.itemsPrice +
    +order.taxPrice +
    +order.primePrice +
    +order.franchisePrice +
    +order.shippingPrice -
    10
  ).toFixed(2);

  await order.save();

  const user = await User.findById(req.body.userId);
  if (user && !user.deleted) {
    user.coupon = "00";
    await user.save();
  }

  res.json(order);
});

//Desc:Update Manager order to sent
//Route: PUT/api/orders/:id/sent
//Access: Private
const updateOrderToSent = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user");

  if (!order || !order.user || !order.isPaid || order.returnActive) {
    res.status(404);
    throw new Error("Order not found or invalid data");
  }

  order.isSent = true;
  order.sentAt = Date.now();
  await order.save();

  const userManager = await User.findOne({ email: "manager@web.de" });

  if (userManager && userManager.email !== order.user.email) {
    const mail = new Mail({
      user: userManager._id,
      mailTarget: order.user.email,
      firstNameTarget: order.user.firstName,
      lastNameTarget: order.user.lastName,
      subject: "Your Order has been sent!",
      message: `Hello, ${order.user.firstName}!
        Your Order ${order._id} has been sent on ${order.sentAt}`,
    });
    await mail.save();
  }

  res.json(order);
});

//Desc:Update Admin order to sent
//Route: PUT/api/orders/:id/senta/dmin
//Access: Private / Admin
const updateAdminOrderToSent = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user");

  if (!order || !order.user || !order.isPaid || order.returnActive) {
    res.status(404);
    throw new Error("Order not found or invalid data");
  }

  order.isSent = true;
  order.sentAt = Date.now();
  await order.save();

  const userAdmin = await User.findOne({ email: "admin@web.de" });

  if (userAdmin && userAdmin.email !== order.user.email) {
    const mail = new Mail({
      user: userAdmin._id,
      mailTarget: order.user.email,
      firstNameTarget: order.user.firstName,
      lastNameTarget: order.user.lastName,
      subject: "Your Order has been sent!",
      message: `Hello, ${order.user.firstName}!
        Your Order ${order._id} has been sent on ${order.sentAt}`,
    });
    await mail.save();
  }

  res.json(order);
});

//Desc:Update Manager invoice to sent
//Route: PUT/api/orders/:id/invoice
//Access: Private / Manager
const updateInvoiceToSent = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user");

  if (!order || !order.user || !order.isPaid || order.returnActive) {
    res.status(404);
    throw new Error("Order not found or invalid data");
  }

  order.invoiceSent = true;
  order.invoiceAt = Date.now();
  await order.save();

  const userManager = await User.findOne({ email: "manager@web.de" });

  if (userManager && userManager.email !== order.user.email) {
    const mail = new Mail({
      user: userManager._id,
      mailTarget: order.user.email,
      firstNameTarget: order.user.firstName,
      lastNameTarget: order.user.lastName,
      subject: `${order.user.firstName}, your Invoice has been sent!`,
      message: `Invoice ${order._id} has been sent to the client`,
      orderID: order._id,
    });
    await mail.save();
  }
  res.json(order);
});

//Desc:Update Admin invoice to sent
//Route: PUT/api/orders/:id/invoice/admin
//Access: Private / Admin
const updateAdminInvoiceToSent = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user");

  if (!order || !order.user || !order.isPaid || order.returnActive) {
    res.status(404);
    throw new Error("Order not found or invalid data");
  }

  order.invoiceSent = true;
  order.invoiceAt = Date.now();
  await order.save();

  const userAdmin = await User.findOne({ email: "admin@web.de" });

  if (userAdmin && userAdmin.email !== order.user.email) {
    const mail = new Mail({
      user: userAdmin._id,
      mailTarget: order.user.email,
      firstNameTarget: order.user.firstName,
      lastNameTarget: order.user.lastName,
      subject: `${order.user.firstName}, your Invoice has been sent!`,
      message: `Invoice ${order._id} has been sent to the client`,
      orderID: order._id,
    });
    await mail.save();
  }
  res.json(order);
});

//Desc:Update Manager order to delivered
//Route: PUT/api/orders/:id/deliver
//Access: Private / Manager
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user");

  const userManager = await User.findOne({ email: "manager@web.de" });

  if (!order || !order.user || !order.isSent || order.returnActive) {
    res.status(404);
    throw new Error("Order not found or invalid data");
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  if (+order.extraPrice > 0) {
    order.isExtra = true;
  }
  await order.save();

  if (userManager && userManager.email !== order.user.email) {
    const mail = new Mail({
      user: userManager._id,
      mailTarget: order.user.email,
      firstNameTarget: order.user.firstName,
      lastNameTarget: order.user.lastName,
      subject: "Your Order has been delivered!",
      message: `Hello, ${order.user.firstName}!
        Your Order ${order._id} has been delivered on ${order.deliveredAt}`,
    });
    await mail.save();
  }

  res.json(order);
});

//Desc:Update Admin order to delivered
//Route: PUT/api/orders/:id/deliver/admin
//Access: Private / Admin
const updateAdminOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user");

  const userAdmin = await User.findOne({ email: "admin@web.de" });

  if (!order || !order.user || !order.isSent || order.returnActive) {
    res.status(404);
    throw new Error("Order not found or invalid data");
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  if (+order.extraPrice > 0) {
    order.isExtra = true;
  }
  await order.save();

  if (userAdmin && userAdmin.email !== order.user.email) {
    const mail = new Mail({
      user: userAdmin._id,
      mailTarget: order.user.email,
      firstNameTarget: order.user.firstName,
      lastNameTarget: order.user.lastName,
      subject: "Your Order has been delivered!",
      message: `Hello, ${order.user.firstName}!
        Your Order ${order._id} has been delivered on ${order.deliveredAt}`,
    });
    await mail.save();
  }

  res.json(order);
});

//Desc: Update Return to active
//Route: PUT/api/orders/:id/returnactive
//Access: Private
const updateReturnToActive = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || !order.orderItems) {
    res.status(404);
    throw new Error("Order not found");
  }
  order.returnActive = true;
  order.isExtra = false;

  order.itemsPriceReturn = order.orderItems
    .reduce(
      (acc, item) =>
        acc +
        (+item.quantity * +item.price -
          +item.quantity * +item.price * +item.discount +
          +item.quantity * +item.price * +item.warranty +
          +item.quantity * (+item.extra1 + +item.extra2)),
      0
    )
    .toFixed(2);
  order.itemsCostReturn = order.orderItems
    .reduce((acc, item) => acc + +item.quantity * +item.pricePurchase, 0)
    .toFixed(2);
  order.shippingPriceReturn = order.isSent ? 0 : order.shippingPrice;
  order.taxPriceReturn = (
    (+order.itemsPriceReturn +
      +order.shippingPriceReturn -
      (order.voucher !== "00" ? 10 : 0)) *
    0.15
  ).toFixed(2);
  order.totalPriceReturn = (
    +order.itemsPriceReturn +
    +order.taxPriceReturn +
    +order.shippingPriceReturn -
    (order.voucher !== "00" ? 10 : 0)
  ).toFixed(2);

  order.totalCost = (+order.totalCost - +order.itemsCostReturn).toFixed(2);

  for (const item of order.orderItems) {
    const product = await Product.findById(item._id);
    if (product && !product.deleted) {
      product.quantity += +item.quantity;
      await product.save();
    }
  }
  await order.save();
  res.json(order);
});

//Desc:Update return to received
//Route: PUT/api/orders/:id/returnreceived
//Access: Private / Manager
const updateReturnToReceived = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order && order.isSent && order.returnActive) {
    order.returnReceived = true;
    order.returnReceivedAt = Date.now();
    await order.save();
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

//Desc:Update refund to paid
//Route: PUT/api/orders/:id/refund
//Access: Private / Manager
const updateRefundToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order && order.isPaid && order.returnActive) {
    order.refund = true;
    order.refundAt = Date.now();
    await order.save();
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

//Desc:Update return to closed
//Route: PUT/api/orders/:id/returnclosed
//Access: Private / Manager
const updateReturnToClosed = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order && order.returnActive) {
    order.returnClosed = true;
    await order.save();
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

export {
  getOrders,
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToSent,
  updateOrderToDelivered,
  updateInvoiceToSent,
  updateAdminOrderToSent,
  updateAdminOrderToDelivered,
  updateAdminInvoiceToSent,
  updateCustomerVoucher,
  updateReturnToActive,
  updateReturnToReceived,
  updateRefundToPaid,
  updateReturnToClosed,
};
