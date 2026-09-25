const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authentication");
const rateLimiter = require("../middleware/rateLimiter");
const {
  allNotifications,
  unreadCount,
  markRead,
  markAllRead,
} = require("../controllers/notifications");

//? All Notifications
router.get("/", rateLimiter, verifyToken, allNotifications);

//? Unread Count
router.get("/unread-count", rateLimiter, verifyToken, unreadCount);

//* Mark All Read
router.put("/read-all", rateLimiter, verifyToken, markAllRead);

//* Mark One Read
router.put("/:id/read", rateLimiter, verifyToken, markRead);

module.exports = router;
