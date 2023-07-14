import asyncHandler from "express-async-handler";
import Mail from "../models/mailModel.js";
import User from "../models/userModel.js";

//Desc: Create new mail
//Route: POST/api/mails
//Access: Private
const createMail = asyncHandler(async (req, res) => {
  const { mailTarget, subject, message, userId } = req.body;
  const user = await User.findById(req.body.userId);

  const userEmail = await User.findOne(
    { email: mailTarget },
    { username: 1, firstName: 1 }
  );

  const { username: lastNameTarget, firstName: firstNameTarget } =
    userEmail || {};

  if (!user || user.deleted || !userEmail) {
    res.status(404).json({ message: "Invalid Data" });
    return;
  }

  const mail = new Mail({
    user: userId,
    mailTarget,
    firstNameTarget,
    lastNameTarget,
    subject,
    message,
  });

  await mail.save();
  res.status(201).json(mail);
});

//Desc:Get Mail by Id
//Route: GET/api/mails/:id
//Access: Private
const getMailById = asyncHandler(async (req, res) => {
  const mail = await Mail.findById(req.params.id).populate(
    "user",
    "firstName username email"
  );
  if (!mail || mail.deletedIn || mail.deletedOut) {
    res.status(404);
    return res.json({ message: "Mail not found" });
  }

  res.json(mail);
});

//Desc:Get all Mails
//Route: GET/api/mails
//Access: Private
const getMails = asyncHandler(async (req, res) => {
  const mails = await Mail.find({}).populate(
    "user",
    "firstName username email"
  );
  res.json(mails);
});

//Desc: Delete Incoming Mail
//Route: put/api/mails/:id/in
//Access: Private
const deleteIn = asyncHandler(async (req, res) => {
  const mail = await Mail.findById(req.params.id);

  if (!mail || mail.deletedIn || mail.deletedOut) {
    res.status(404);
    return res.json({ message: "Mail not found" });
  }

  mail.deletedIn = true;
  await mail.save();
  res.json(mail);
});

//Desc: Delete Incoming Mail
//Route: put/api/mails/:id/out
//Access: Private
const deleteOut = asyncHandler(async (req, res) => {
  const mail = await Mail.findById(req.params.id);

  if (!mail || mail.deletedIn || mail.deletedOut) {
    res.status(404);
    return res.json({ message: "Mail not found" });
  }

  mail.deletedOut = true;
  await mail.save();
  res.json(mail);
});

//Desc: Update Mail Status
//Route: PUT/api/mails/:id
//Access: Private
const updateMail = asyncHandler(async (req, res) => {
  const mail = await Mail.findById(req.params.id);

  if (!mail || mail.deletedIn || mail.deletedOut) {
    res.status(404);
    return res.json({ message: "Mail not found" });
  }

  mail.status = !mail.status;
  await mail.save();
  res.json(mail);
});

//Desc: Update Mail to Open
//Route: PUT/api/mails/:id/open
//Access: Private
const openMail = asyncHandler(async (req, res) => {
  const mail = await Mail.findById(req.params.id);

  if (!mail || mail.deletedIn || mail.deletedOut) {
    res.status(404);
    return res.json({ message: "Mail not found" });
  }

  mail.open = true;
  await mail.save();
  res.json(mail);
});

export {
  createMail,
  getMailById,
  getMails,
  deleteOut,
  deleteIn,
  updateMail,
  openMail,
};
