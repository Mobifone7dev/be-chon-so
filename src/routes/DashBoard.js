const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/DashboardControllers");
router.use("/dashboard-plan-kpi", dashboardController.getDashBoardPlanKpi);
router.use("/dashboard-exec-kpi", dashboardController.getDashBoardExecKpi);
router.post("/dashboard-create-manual-kpi", dashboardController.createManualKpi);
router.post("/dashboard-create-manual-list-kpi", dashboardController.createManualListKpi);
router.get("/dashboard-export-excel-exec-kpi", dashboardController.exportExcelExecKpi);


router.use("/", dashboardController.index);

module.exports = router;
