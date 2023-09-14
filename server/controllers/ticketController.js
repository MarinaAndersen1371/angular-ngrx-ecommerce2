import asyncHandler from "express-async-handler";
import Ticket from "../models/ticketModel.js";
import Mail from "../models/mailModel.js";
import User from "../models/userModel.js";

//Desc: Create a new ticket
//Route: POST/api/tickets
//Access: Private
const createTicket = asyncHandler(async (req, res) => {
  const { name, email, category, message } = req.body;

  const ticket = new Ticket({
    name,
    email,
    category,
    message,
    lastModified: Date.now(),
  });

  const teamEmail =
    category === "Maintenance"
      ? "support@web.de"
      : category === "Business"
      ? "manager@web.de"
      : null;
  const admin = await User.findOne({ email: "admin@web.de" });
  const team = teamEmail ? await User.findOne({ email: teamEmail }) : null;

  if (admin && team) {
    // Create a new mail for the team
    const mail = new Mail({
      user: admin._id,
      mailTarget: team.email,
      firstNameTarget: team.firstName,
      lastNameTarget: team.lastName,
      subject: "New ticket has been assigned to your team!",
      message: `Hello ${team.firstName}, Ticket ${ticket._id} has been assigned to your team.`,
    });
    await mail.save();
  }

  await ticket.save();
  res.status(201).json(ticket);
});

//Desc:Get ticket by Id
//Route: GET/api/tickets/:id
//Access: Private
const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (ticket) {
    res.json(ticket);
  } else {
    res.status(404);
    throw new Error("Ticket not found");
  }
});

//Desc:Get all tickets
//Route: GET/api/tickets
//Access: Private
const getTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({});

  const statistics = tickets.reduce(
    (acc, ticket) => {
      acc.qtyClosed += ticket.status === "Closed" ? 1 : 0;
      acc.qtyNew += ticket.status === "New" ? 1 : 0;
      acc.qtyOnHold += ticket.status === "On hold" ? 1 : 0;
      acc.qtyBusiness += ticket.category === "Business" ? 1 : 0;
      acc.qtyMaintenance += ticket.category === "Maintenance" ? 1 : 0;
      acc.qtyDevelopment += ticket.category === "Development" ? 1 : 0;
      acc.qtyAdmin += ticket.modifiedBy === "Admin" ? 1 : 0;
      acc.qtyManager += ticket.modifiedBy === "Manager" ? 1 : 0;
      acc.qtySupport += ticket.modifiedBy === "Support" ? 1 : 0;
      acc.qtyCustomer += ticket.modifiedBy === "Customer" ? 1 : 0;
      acc.timeAdmin += +ticket.timeAdmin;
      acc.timeManager += +ticket.timeManager;
      acc.timeSupport += +ticket.timeSupport;
      return acc;
    },
    {
      qtyClosed: 0,
      qtyNew: 0,
      qtyOnHold: 0,
      qtyBusiness: 0,
      qtyMaintenance: 0,
      qtyDevelopment: 0,
      qtyAdmin: 0,
      qtyManager: 0,
      qtySupport: 0,
      qtyCustomer: 0,
      timeAdmin: 0,
      timeManager: 0,
      timeSupport: 0,
    }
  );
  res.json({ tickets, statistics });
});

//Desc: Delete ticket
//Route: DELETE/api/tickets/:id
//Access: Private / Admin
const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (ticket) {
    await ticket.remove();
    res.json({ message: "Ticket has been deleted" });
  } else {
    res.status(404);
    throw new Error("Ticket not found");
  }
});

//Desc: Open ticket
//Route: PUT/api/tickets/:id/open
//Access: Private / Admin
const openTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (ticket) {
    ticket.open = true;
    await ticket.save();
    res.json(ticket);
  } else {
    res.status(404);
    throw new Error("Ticket not found");
  }
});

//Desc: Update ticket
//Route: PUT/api/tickets/:id
//Access: Private / Admin
const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  ticket.commentAdmin = req.body.commentAdmin || ticket.commentAdmin;
  ticket.timeAdmin = +ticket.timeAdmin + (+req.body.timeAdmin || 0);
  ticket.status = req.body.status || ticket.status;
  ticket.open = false;
  ticket.lastModified = Date.now();
  ticket.modifiedBy = "Admin";

  await ticket.save();
  res.json(ticket);
});

//Desc: Update Manager ticket
//Route: PUT/api/tickets/:id/manager
//Access: Private / Manager
const updateManagerTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  ticket.commentManager = req.body.commentManager || ticket.commentManager;
  ticket.timeManager = +ticket.timeManager + (+req.body.timeManager || 0);
  ticket.status = req.body.status || ticket.status;
  ticket.open = false;
  ticket.lastModified = Date.now();
  ticket.modifiedBy = "Manager";

  await ticket.save();
  res.json(ticket);
});

//Desc: Update Support ticket
//Route: PUT/api/tickets/:id/support
//Access: Private / Support
const updateSupportTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  ticket.commentSupport = req.body.commentSupport || ticket.commentSupport;
  ticket.timeSupport = +ticket.timeSupport + (+req.body.timeSupport || 0);
  ticket.status = req.body.status || ticket.status;
  ticket.open = false;
  ticket.lastModified = Date.now();
  ticket.modifiedBy = "Support";

  await ticket.save();
  res.json(ticket);
});

export {
  createTicket,
  getTicketById,
  getTickets,
  deleteTicket,
  openTicket,
  updateTicket,
  updateManagerTicket,
  updateSupportTicket,
};
