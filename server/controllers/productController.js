import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";

//Desc: Fetch all products
//Route: GET/api/products
//Access: Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ deleted: false });
  const topProducts = await Product.find({ deleted: false })
    .sort({ rating: -1 })
    .limit(5);

  const statistics = products.reduce(
    (acc, product) => {
      acc.qtyStock += +product.quantity;
      acc.qtyExtra += product.extra ? 1 : 0;
      acc.qtyExtraStock += product.extra ? +product.quantity : 0;
      acc.qtyAudio += product.category === "Audio" ? 1 : 0;
      acc.qtyAudioStock += product.category === "Audio" ? +product.quantity : 0;
      acc.qtyElectronics += product.category === "Electronics" ? 1 : 0;
      acc.qtyElectronicsStock +=
        product.category === "Electronics" ? +product.quantity : 0;
      acc.qtySmartHome += product.category === "Smart Home" ? 1 : 0;
      acc.qtySmartHomeStock +=
        product.category === "Smart Home" ? +product.quantity : 0;
      return acc;
    },
    {
      qtyStock: 0,
      qtyExtra: 0,
      qtyExtraStock: 0,
      qtyAudio: 0,
      qtyAudioStock: 0,
      qtyElectronics: 0,
      qtyElectronicsStock: 0,
      qtySmartHome: 0,
      qtySmartHomeStock: 0,
    }
  );
  res.json({ products, topProducts, statistics });
});

//Desc:Get product by Id
//Route: GET/api/products/:id
//Access: Private
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product && !product.deleted) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

//Desc: Create product
//Route: POST/api/products
//Access: Private / Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    brand,
    category,
    description,
    pricePurchase,
    price,
    quantity,
    extra,
    imageUrl,
    modifiedBy,
  } = req.body;
  const product = await Product.create({
    name,
    brand,
    category,
    description,
    pricePurchase,
    price,
    quantity,
    extra,
    imageUrl,
    modifiedBy,
    lastModified: Date.now(),
  });

  if (product) {
    res.json({
      _id: product._id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
      pricePurchase: product.pricePurchase,
      price: product.price,
      quantity: product.quantity,
      extra: product.extra,
      imageUrl: product.imageUrl,
      modifiedBy: product.modifiedBy,
      lastModified: product.lastModified,
    });
  } else {
    res.status(400);
    throw new Error("Invalid data");
  }
});

//Desc: Update product
//Route: PUT/api/products/:id
//Access: Private / Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product && !product.deleted) {
    product.name = req.body.name || product.name;
    product.brand = req.body.brand || product.brand;
    product.category = req.body.category || product.category;
    product.description = req.body.description || product.description;
    product.pricePurchase = req.body.pricePurchase || product.pricePurchase;
    product.price = req.body.price || product.price;
    product.quantity = req.body.quantity || product.quantity;
    product.extra = req.body.extra ?? product.extra;
    product.imageUrl = req.body.imageUrl || product.imageUrl;
    product.modifiedBy = req.body.modifiedBy;
    product.lastModified = Date.now();

    await product.save();
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

//Desc: Delete product
//Route: PUT/api/products/:id/deleted
//Access: Private / Admin / Manager
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product && !product.deleted) {
    product.deleted = true;
    await product.save();
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { userName, userId, rating, comment } = req.body;

  if (comment.trim() === "") {
    res.status(400);
    throw new Error("No comment to submit");
  }

  const product = await Product.findById(req.params.id);

  if (product && !product.deleted) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.userId.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }

    const review = {
      userName,
      userId,
      rating: +rating,
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => +item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
};
