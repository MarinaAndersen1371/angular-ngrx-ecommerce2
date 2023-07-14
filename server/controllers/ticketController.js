import asyncHandler from "express-async-handler";
import Ticket from "../models/ticketModel.js";

//Desc: Create new ticket
//Route: POST/api/tickets
//Access: Private
const createTicket = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  const ticket = new Ticket({
    name,
    email,
    message,
    lastModified: Date.now(),
  });
  const createdTicket = await ticket.save();
  res.status(201).json(createdTicket);
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
      acc.qtyAdmin += ticket.modifiedBy === "Admin" ? 1 : 0;
      acc.qtyManager += ticket.modifiedBy === "Manager" ? 1 : 0;
      acc.qtyCustomer += ticket.modifiedBy === "Customer" ? 1 : 0;
      acc.timeManager += +ticket.timeManager;
      acc.timeAdmin += +ticket.timeAdmin;
      return acc;
    },
    {
      qtyClosed: 0,
      qtyNew: 0,
      qtyOnHold: 0,
      qtyAdmin: 0,
      qtyManager: 0,
      qtyCustomer: 0,
      timeManager: 0,
      timeAdmin: 0,
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

export {
  createTicket,
  getTicketById,
  getTickets,
  deleteTicket,
  openTicket,
  updateTicket,
  updateManagerTicket,
};
