import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Mail from "../models/mailModel.js";

//Desc:Update user test score
//Route: PUT/api/users/:id/testscore
//Access: Private / Manager
const updateTestScore = asyncHandler(async (req, res) => {
  const { testScore } = req.body;

  // Test score update only to 0
  if (+testScore !== 0) {
    res.status(400).json({ message: "Invalid test score" });
    return;
  }

  const user = await User.findById(req.params.id);

  if (!user || user.deleted) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  user.testScore = testScore || user.testScore;
  if (+user.testScore === 0) {
    user.test.test1 = "00";
    user.test.test2 = "00";
    user.test.test3 = "00";
    user.test.test4 = "00";
    user.test.test5 = "00";
  }
  user.modifiedBy = "Manager";
  user.lastModified = Date.now();

  await user.save();
  res.json(user);
});

//Desc:Update user coupon
//Route: PUT/api/users/:id/testscore
//Access: Private / Manager
const updatePrimeCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;

  const user = await User.findById(req.params.id);

  if (!user || user.deleted || !user.isPrime) {
    res
      .status(404)
      .json({ message: "User not found or not eligible for prime coupon" });
    return;
  }

  user.coupon = coupon || user.coupon;
  user.lastModified = Date.now();
  user.modifiedBy = "Manager";

  await user.save();
  res.json(user);
});

//Desc:Update user password
//Route: PUT/api/users/:id/passwordreset
//Access: Private / Manager
const updateUserPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user || user.deleted) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  user.password = "123456"; //Password is hardcoded to keep the same password for all test accounts//
  user.lastModified = Date.now();
  user.modifiedBy = "Manager";

  await sendPassword(user);

  await user.save();
  res.json(user);
});

// Function to send a password to user
async function sendPassword(user) {
  const userManager = await User.findOne({ email: "manager@web.de" });

  if (userManager && user.email !== "manager@web.de") {
    const mail = new Mail({
      user: userManager._id,
      mailTarget: user.email,
      firstNameTarget: user.firstName,
      lastNameTarget: user.lastName,
      subject: `Password has been reset, ${user.firstName}!`,
      message: `Password has been reset to: ${user.password}`,
    });
    await mail.save();
  }
}

export { updateTestScore, updatePrimeCoupon, updateUserPassword };
