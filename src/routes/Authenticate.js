const express = require("express");
const router = express.Router();
const authenticateController = require("../controllers/AuthenticateController");
router.use("/", authenticateController.index);

module.exports = router;
