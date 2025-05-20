const express = require("express");
const router = express.Router();
const chonsoController = require("../controllers/Chonso_Controller"); // Đảm bảo đường dẫn chính xác
const multer = require("multer");
const path = require("path");
const fs = require("fs");
// Định nghĩa route cho Chonso
router.post("/update-is-hold", chonsoController.updateIsHoldByTelNumber)
router.post("/permission", chonsoController.getValidEmails)
router.post("/insertChonSo", chonsoController.insertChonso)
router.get("/get-shopcode-by-district", chonsoController.getShopCodeByDistrict); // Route lấy mã shop theo quận huyện
router.get("/get-chon-so", chonsoController.chonso); // Route lấy dữ liệu từ v_kho_so_all
router.get("/search-condition", chonsoController.searchCondition); // Route lấy dữ liệu từ v_kho_so_all theo elastic
router.get("/", chonsoController.index); // Route lấy dữ liệu từ v_kho_so_all
// upload file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = "./public/upload-file-camket";
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const name = file.originalname.split(".")[0];
        const extension = path.extname(file.originalname);
        const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
        cb(null, `${name}-$${randomName}${extension}`);
    },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    },
    limit: {
        files: 10,
        fileSize: (1024 * 1024) / 20, //500k
    },
});
const upload = multer({ storage: storage });
router.post("/upload-file", upload.single("file"),
    chonsoController.uploadFile); // Route upload file

module.exports = router;
