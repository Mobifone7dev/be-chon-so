const express = require("express");
const router = express.Router();
const chonsoController = require("../controllers/Chonso_Controller"); // Đảm bảo đường dẫn chính xác

// Định nghĩa route cho Chonso
router.get("/", chonsoController.Chonso); // Route lấy dữ liệu từ v_kho_so_all
router.post("/permission", chonsoController.getValidEmails)
router.post("/insertChonSo",chonsoController.insertChonso)
module.exports = router;
