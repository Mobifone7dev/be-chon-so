const express = require("express");
const router = express.Router();
const userRoleController = require("../controllers/UserRoleController");
router.post("/update-user-role", userRoleController.updateUserRole);
router.get("/web-user", userRoleController.getWebUser);
router.get("/get-user-role", userRoleController.getUserRole);

router.use("/", userRoleController.index);

module.exports = router;
