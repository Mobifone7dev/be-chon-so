const express = require("express");
const router = express.Router();
const chonsoController = require("../controllers/Chonso_Controller"); // Đảm bảo đường dẫn chính xác

// Định nghĩa route cho Chonso
router.post("/permission", chonsoController.getValidEmails)
router.post("/insertChonSo", chonsoController.insertChonso)
router.get("/get-shopcode-by-district", chonsoController.getShopCodeByDistrict); // Route lấy mã shop theo quận huyện
router.get("/", chonsoController.Chonso); // Route lấy dữ liệu từ v_kho_so_all

module.exports = router;
