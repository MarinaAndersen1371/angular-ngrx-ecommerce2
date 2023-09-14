import asyncHandler from "express-async-handler";
import generateToken from "../generateToken.js";
import User from "../models/userModel.js";
import Mail from "../models/mailModel.js";

//Desc: Login user
//Route: POST/api/users/login
//Access: Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && !user.deleted && (await user.matchPassword(password))) {
    user.lastLogin = Date.now();
    await user.save();
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin,
      isManager: user.isManager,
      isSupport: user.isSupport,
      isPrime: user.isPrime,
      isFranchise: user.isFranchise,
      testPaid: user.testPaid,
      coupon: user.coupon,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid data");
  }
});

//Desc: Register user
//Route: POST/api/users
//Access: Public
const registerUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    purpose,
    birthday,
    gender,
  } = req.body;

  // Check if user with the same email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("This email is already registered");
  }

  // Create the user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    purpose,
    birthday,
    gender,
    lastLogin: Date.now(),
    lastModified: Date.now(),
    modifiedBy: lastName,
  });

  if (user) {
    // Send welcome email
    await sendWelcomeEmail(user);

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin,
      isManager: user.isManager,
      isSupport: user.isSupport,
      isPrime: user.isPrime,
      isFranchise: user.isFranchise,
      coupon: user.coupon,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// Function to send a welcome email
async function sendWelcomeEmail(user) {
  const userAdmin = await User.findOne({ email: "admin@web.de" });

  if (userAdmin) {
    const mail = new Mail({
      user: userAdmin._id,
      mailTarget: user.email,
      firstNameTarget: user.firstName,
      lastNameTarget: user.lastName,
      subject: `Welcome to MarWeb Trade, ${user.firstName}!`,
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    });
    await mail.save();
  }
}

//Desc: Fetch all users
//Route: GET/api/users
//Access: Private / Admin
const getUsers = asyncHandler(async (req, res) => {
  const active = await User.find({ deleted: false });
  const removed = await User.find({ deleted: true });
  const users = { active, removed };

  if (!users) {
    res.json({ users: [], statistics: {} });
    return;
  }

  const statistics = active.reduce(
    (acc, active) => {
      acc.qtyFemale += active.gender === "Female" ? 1 : 0;
      acc.qtyMale += active.gender === "Male" ? 1 : 0;
      acc.qtyPrivateCustomer +=
        active.purpose === "Private Customer" || active.purpose === "Other"
          ? 1
          : 0;
      acc.qtyFranchiseMember += active.purpose === "Franchise Member" ? 1 : 0;
      acc.qtyWholesaleBusiness +=
        active.purpose === "Wholesale Business" ? 1 : 0;
      acc.qtyPrime += active.isPrime ? 1 : 0;
      acc.qtyFranchise += active.isFranchise ? 1 : 0;
      acc.qtyTestPaid += active.testPaid ? 1 : 0;
      acc.qtyTestCompleted += +active.testScore > 79 ? 1 : 0;
      acc.qtyTestFailed +=
        +active.testScore < 80 && +active.testScore > 0 ? 1 : 0;
      acc.qtyPrimeCoupon += active.coupon !== "00" ? 1 : 0;
      return acc;
    },
    {
      qtyFemale: 0,
      qtyMale: 0,
      qtyPrivateCustomer: 0,
      qtyFranchiseMember: 0,
      qtyWholesaleBusiness: 0,
      qtyPrime: 0,
      qtyFranchise: 0,
      qtyTestPaid: 0,
      qtyTestCompleted: 0,
      qtyTestFailed: 0,
      qtyPrimeCoupon: 0,
    }
  );
  res.json({ users, statistics });
});

//Desc: Get user by Id
//Route: GET/api/users/:id
//Access: Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user && !user.deleted) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//Desc: Add product to cart
//Route: PUT/api/users/:id
//Access: Private
const addToCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  const { item: product, qty, warranty, gift, extra1, extra2 } = req.body;

  if (user && !user.deleted && user.cart) {
    const existingItem = user.cart.find(
      (x) => x._id.toString() === product._id.toString()
    );

    if (existingItem) {
      const newQuantity = +existingItem.quantity + +qty;

      if (newQuantity <= +product.quantity) {
        existingItem.quantity = newQuantity;
        existingItem.discount = newQuantity > 2 ? 0.05 : 0;
        existingItem.warranty = warranty === "Yes" ? 0.02 : 0;
        existingItem.gift = gift === "Yes" ? 5 : 0;
        existingItem.extra1 = extra1 === "Yes" ? 4 : 0;
        existingItem.extra2 = extra2 === "Yes" ? 5 : 0;
      } else {
        throw new Error("Product is out of stock");
      }
    } else {
      product.quantity = qty;
      product.discount = +product.quantity > 2 ? 0.05 : 0;
      product.warranty = warranty === "Yes" ? 0.02 : 0;
      product.gift = gift === "Yes" ? 5 : 0;
      product.extra1 = extra1 === "Yes" ? 4 : 0;
      product.extra2 = extra2 === "Yes" ? 5 : 0;

      user.cart.push(product);
    }

    user.subtotal = calculateSubtotal(user.cart);

    await user.save();
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Function to calculate the subtotal of the cart
function calculateSubtotal(cart) {
  return cart
    .reduce((acc, product) => {
      const quantity = +product.quantity;
      const price = +product.price;
      const discount = +product.discount;
      const warranty = +product.warranty;
      const extra1 = +product.extra1;
      const extra2 = +product.extra2;
      const gift = +product.gift;

      const itemTotal =
        price * quantity -
        price * quantity * discount +
        price * quantity * warranty +
        (extra1 + extra2) * quantity +
        gift;

      return acc + itemTotal;
    }, 0)
    .toFixed(2);
}

//Desc: Remove item from cart
//Route: PUT/api/users/:id/remove
//Access: Private
const removeFromCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  const item = req.body.item;

  if (user && !user.deleted && user.cart && user.cart.length > 0) {
    const removedItem = user.cart.find(
      (x) => x._id.toString() === item._id.toString()
    );

    if (removedItem) {
      user.cart.remove(removedItem);
      user.subtotal = user.cart.reduce(
        (acc, product) =>
          acc +
          (+product.price * +product.quantity -
            +product.price * +product.quantity * +product.discount +
            +product.price * +product.quantity * +product.warranty +
            (+product.extra1 + +product.extra2) * +product.quantity +
            +product.gift),
        0
      );
      await user.save();
      res.json(user);
    } else {
      res.status(404);
      throw new Error("Item not found in cart");
    }
  } else {
    res.status(404);
    throw new Error("User not found or cart is empty");
  }
});

//Desc: Update user
//Route: PUT/api/users/:id
//Access: Private
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user && !user.deleted) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.purpose = req.body.purpose || user.purpose;
    user.birthday = req.body.birthday || user.birthday;
    user.gender = req.body.gender || user.gender;
    user.testScore = +req.body.testScore === 0 ? 0 : user.testScore;
    user.coupon = req.body.coupon || user.coupon;
    user.isManager = req.body.isManager ?? user.isManager;
    user.isSupport = req.body.isSupport ?? user.isSupport;
    user.lastModified = Date.now();
    user.modifiedBy = "Admin";

    if (+user.testScore === 0) {
      user.test.test1 = "00";
      user.test.test2 = "00";
      user.test.test3 = "00";
      user.test.test4 = "00";
      user.test.test5 = "00";
    }

    await user.save();
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//Desc: Delete user
//Route: DELETE/api/users/:id
//Access: Private Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user && !user.deleted) {
    user.deleted = true;
    await user.save();
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//Desc: Update user profile
//Route: PUT/api/users/:id/profile
//Access: Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user && !user.deleted) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.purpose = req.body.purpose || user.purpose;
    user.birthday = req.body.birthday || user.birthday;
    user.gender = req.body.gender || user.gender;
    req.body.password && (user.password = req.body.password);
    user.lastModified = Date.now();
    user.modifiedBy = user.lastName;

    await user.save();
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//Desc: User test completion
//Route: PUT/api/users/:id/test
//Access: Private
const userTest = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user && !user.deleted) {
    user.test.test1 = req.body.test1 || user.test.test1;
    user.test.test2 = req.body.test2 || user.test.test2;
    user.test.test3 = req.body.test3 || user.test.test3;
    user.test.test4 = req.body.test4 || user.test.test4;
    user.test.test5 = req.body.test5 || user.test.test5;

    var answer1, answer2, answer3, answer4, answer5;
    user.test.test1 === "A" ? (answer1 = 20) : (answer1 = 1);
    user.test.test2 === "B" ? (answer2 = 20) : (answer2 = 1);
    user.test.test3 === "C" ? (answer3 = 20) : (answer3 = 1);
    user.test.test4 === "D" ? (answer4 = 20) : (answer4 = 1);
    user.test.test5 === "A" ? (answer5 = 20) : (answer5 = 1);

    user.testScore = +answer1 + +answer2 + +answer3 + +answer4 + +answer5;
    if (+user.testScore > 79) {
      user.isFranchise = true;
      user.franchiseFrom = Date.now();
    }

    await user.save();
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  getUsers,
  registerUser,
  loginUser,
  deleteUser,
  updateUser,
  getUserById,
  addToCart,
  removeFromCart,
  updateProfile,
  userTest,
};
