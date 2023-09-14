import express from "express";
const router = express.Router();
import {
  createTicket,
  getTicketById,
  getTickets,
  deleteTicket,
  openTicket,
  updateTicket,
  updateManagerTicket,
  updateSupportTicket,
} from "../controllers/ticketController.js";

router.route("/").post(createTicket).get(getTickets);
router.route("/:id").get(getTicketById).delete(deleteTicket).put(updateTicket);
router.route("/:id/open").put(openTicket);
router.route("/:id/manager").put(updateManagerTicket);
router.route("/:id/support").put(updateSupportTicket);

export default router;
