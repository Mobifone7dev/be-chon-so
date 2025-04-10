const DbConnection = require("../../DbConnection");
const DbSaleOwnerConnection = require("../../DbSaleOwnerConnection");
const lowerCaseKeys = require("../../src/utils/helper");
var moment = require("moment");
const oracledb = require("oracledb");
oracledb.autoCommit = true;
const db = require("../models");
const fs = require("fs");
const ManualKpi = db.manualKpi;
const { sequelize } = require('../models'); // Import s
const { query, validationResult } = require("express-validator");

class DashboardController {
  index(req, res) {
    res.send({ result: "hello wolrd" });

  }
  async getDashBoardPlanKpi(req, res) {
    let monthString = req.query.month;
    let province = req.query.province ? req.query.province : '';

    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    let sql;
    if (province && province.length > 0) {
      if (province == 'CTY7') {
        sql = `select * from db01_owner.chitieu_kpi_2025 where thang= to_date('${startOfMonth}','DD-MM-RRRR')`
      } else {
        sql = `select THANG, STT, TEN_CHI_TIEU, ${province}, DONVI from db01_owner.chitieu_kpi_2025 where thang= to_date('${startOfMonth}','DD-MM-RRRR')`
      }
    } else {
      sql = `select * from db01_owner.chitieu_kpi_2025 where thang= to_date('${startOfMonth}','DD-MM-RRRR')`;

    }



    if (monthString && startOfMonth) {
      DbConnection.getConnected(sql, {}, function (data) {

        if (data) {
          data.map((item, index) => { });
          res.status(200).json({ result: data }); // This runs as well.
        }
      });
    } else {
      res.status(401).json({ error: "có lỗi xảy ra" }); // This runs as well.

    }

  }

  getDashBoardExecKpi(req, res) {
    var monthString = req.query.month;
    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    let province = req.query.province ? req.query.province : '';

    if (monthString && startOfMonth) {
      let sql;
      if (province && province.length > 0) {
        if (province == 'CTY7') {
          sql = `
          select v1.*, (v1.KHO + v1.DLA + v1.GLA + v1.PYE + v1.DNO + v1.KON) CTY7 from (
          SELECT * FROM
          (
              select ten_chi_tieu,province_code,sum(THUC_HIEN) th, max(last_date) last_date
              from db01_owner.thuc_hien_kpi_2025 
              where thang = to_date('${startOfMonth}','DD-MM-RRRR')
              and ten_chi_tieu not in ( 'TILE_MNP','TI_LE_N_1_DAIKY','TILE_N_1_DONKY',
              'TILE_N_1_GOI','TB_PLAT_TT','TI_LE_DN_SU_DUNG_GP_MBF','TYLE_GD_C2C' )
              group by ten_chi_tieu,province_code,last_date
          )
          PIVOT
          (
            sum(th)
            FOR province_code IN ('KHO' KHO, 'DLA' DLA, 'GLA' GLA, 'PYE' PYE, 'DNO' DNO, 'KON' KON)
          )
          ) v1
          union all
          SELECT * FROM
          (
              select ten_chi_tieu,province_code,sum(THUC_HIEN) th, max(last_date) last_date
              from db01_owner.thuc_hien_kpi_2025 
              where thang = to_date('${startOfMonth}','DD-MM-RRRR')
              and ten_chi_tieu  in ( 'TILE_MNP','TI_LE_N_1_DAIKY','TILE_N_1_DONKY',
              'TILE_N_1_GOI','TB_PLAT_TT','TI_LE_DN_SU_DUNG_GP_MBF','TYLE_GD_C2C' )
              group by ten_chi_tieu,province_code, last_date
          )
          PIVOT
          (
            sum(th)
            FOR province_code IN ('KHO' KHO, 'DLA' DLA, 'GLA' GLA, 'PYE' PYE, 'DNO' DNO, 'KON' KON, 'CTY7' CTY7)
          )
        `;
        } else {
          sql = `
          select v1.* from (
          SELECT * FROM
          (
              select ten_chi_tieu,province_code,sum(THUC_HIEN) th, max(last_date) last_date
              from db01_owner.thuc_hien_kpi_2025 
              where thang = to_date('${startOfMonth}','DD-MM-RRRR')
              and ten_chi_tieu not in ( 'TILE_MNP','TI_LE_N_1_DAIKY','TILE_N_1_DONKY',
              'TILE_N_1_GOI','TB_PLAT_TT','TI_LE_DN_SU_DUNG_GP_MBF','TYLE_GD_C2C' )
              group by ten_chi_tieu,province_code,last_date
          )
          PIVOT
          (
            sum(th)
            FOR province_code IN ('${province}' ${province})
          )
          ) v1
          union all
          SELECT * FROM
          (
              select ten_chi_tieu,province_code,sum(THUC_HIEN) th, max(last_date) last_date
              from db01_owner.thuc_hien_kpi_2025 
              where thang = to_date('${startOfMonth}','DD-MM-RRRR')
              and ten_chi_tieu  in ( 'TILE_MNP','TI_LE_N_1_DAIKY','TILE_N_1_DONKY',
              'TILE_N_1_GOI','TB_PLAT_TT','TI_LE_DN_SU_DUNG_GP_MBF','TYLE_GD_C2C' )
              group by ten_chi_tieu,province_code, last_date
          )
          PIVOT
          (
            sum(th)
            FOR province_code IN ('${province}' ${province})
          )
        `;
        }
        console.log("sql", sql)
      } else {
        sql = `
          select v1.*, (v1.KHO + v1.DLA + v1.GLA + v1.PYE + v1.DNO + v1.KON) CTY7 from (
          SELECT * FROM
          (
              select ten_chi_tieu,province_code,sum(THUC_HIEN) th, max(last_date) last_date
              from db01_owner.thuc_hien_kpi_2025 
              where thang = to_date('${startOfMonth}','DD-MM-RRRR')
              and ten_chi_tieu not in ( 'TILE_MNP','TI_LE_N_1_DAIKY','TILE_N_1_DONKY',
              'TILE_N_1_GOI','TB_PLAT_TT','TI_LE_DN_SU_DUNG_GP_MBF','TYLE_GD_C2C' )
              group by ten_chi_tieu,province_code,last_date
          )
          PIVOT
          (
            sum(th)
            FOR province_code IN ('KHO' KHO, 'DLA' DLA, 'GLA' GLA, 'PYE' PYE, 'DNO' DNO, 'KON' KON)
          )
          ) v1
          union all
          SELECT * FROM
          (
              select ten_chi_tieu,province_code,sum(THUC_HIEN) th, max(last_date) last_date
              from db01_owner.thuc_hien_kpi_2025 
              where thang = to_date('${startOfMonth}','DD-MM-RRRR')
              and ten_chi_tieu  in ( 'TILE_MNP','TI_LE_N_1_DAIKY','TILE_N_1_DONKY',
              'TILE_N_1_GOI','TB_PLAT_TT','TI_LE_DN_SU_DUNG_GP_MBF','TYLE_GD_C2C' )
              group by ten_chi_tieu,province_code, last_date
          )
          PIVOT
          (
            sum(th)
            FOR province_code IN ('KHO' KHO, 'DLA' DLA, 'GLA' GLA, 'PYE' PYE, 'DNO' DNO, 'KON' KON, 'CTY7' CTY7)
          )
        `;

      }

      DbConnection.getConnected(sql, {}, function (result) {
        if (result) {
          res.send({ result: result });
        }
      });
    } else {
      res.send({ error: "Có lỗi xảy ra" });
    }
  }
  async createManualKpi(req, res) {
    const result = validationResult(req);
    if (result.isEmpty()) {
      var monthString = req.body.month;
      const myDate = moment(monthString, "DD-MM-YYYY");
      const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
      let info = {
        nameKpi: req.body.nameKpi,
        kpi: req.body.kpi,
        month: startOfMonth,
        province: req.body.province

      }
      let orderNumber = returnOrderNumber(info.nameKpi);


      try {

        const existingKpi = await sequelize.query(
          `SELECT * FROM db01_owner.thuc_hien_kpi_2025 WHERE ten_chi_tieu = :nameKpi
           and thang = to_date(:month,'dd-mm-rrrr')
           and province_code = :provinceCode
           `,
          {
            replacements: { nameKpi: info.nameKpi, month: info.month, provinceCode: info.province },
            type: sequelize.QueryTypes.SELECT,
          }
        );
        if (existingKpi.length > 0) {
          const result = await sequelize.query(
            `update db01_owner.thuc_hien_kpi_2025 
            set ten_chi_tieu =:nameKpi,
            thang = to_date(:month,'dd-mm-rrrr'),
            last_date =:lastDate,
            province_code =:provinceCode,
            thuc_hien =:kpi,
            order_number =:orderNumber
            WHERE ten_chi_tieu = :nameKpi and thang = to_date(:month,'dd-mm-rrrr')
            `,
            {
              replacements: {
                nameKpi: info.nameKpi,
                month: info.month,
                lastDate: new Date(),
                provinceCode: info.province,
                kpi: info.kpi,
                orderNumber: orderNumber
              },
              type: sequelize.QueryTypes.UPDATE,
            }
          );
          res.send({ data: result })

        } else {
          const result = await sequelize.query(
            `insert into  db01_owner.thuc_hien_kpi_2025 
          (ten_chi_tieu, thang, last_date, province_code, district_code,thuc_hien, order_number)
          values
          (
          :nameKpi,
           to_date(:month,'dd-mm-rrrr'),
          :lastDate,
          :provinceCode,
          '',
          :kpi,
          :orderNumber
          )
            `,
            {
              replacements: {
                nameKpi: info.nameKpi,
                month: info.month,
                lastDate: new Date(),
                provinceCode: info.province,
                kpi: info.kpi,
                orderNumber: orderNumber
              },
              type: sequelize.QueryTypes.INSERT,
            }
          );
          res.send({ data: result })


        }


      } catch (error) {
        throw new Error(`Có lỗi xảy ra:  ${error}`)

      }
    }
  }

  async createManualListKpi(req, res) {
    const result = validationResult(req);
    if (result.isEmpty()) {
      var monthString = req.body.month;
      const myDate = moment(monthString, "DD-MM-YYYY");
      const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
      const kpiList = req.body.kpiList;
      if (kpiList && kpiList.length > 0) {
        try {
          console.log("kpiList", kpiList);
          for (const object of kpiList) {
            let info = {
              nameKpi: object.id,
              kpi: object.value,
              month: startOfMonth,
              province: object.province

            }
            let orderNumber = returnOrderNumber(info.nameKpi);
            let lastDate = new Date();
            lastDate = returnLastDate(info.nameKpi, req.body)


            const existingKpi = await sequelize.query(
              `SELECT * FROM db01_owner.thuc_hien_kpi_2025 WHERE ten_chi_tieu = :nameKpi
               and thang = to_date(:month,'dd-mm-rrrr')
               and province_code = :provinceCode
               `,
              {
                replacements: { nameKpi: info.nameKpi, month: info.month, provinceCode: info.province },
                type: sequelize.QueryTypes.SELECT,
              }
            );
            if (existingKpi.length > 0) {
              const resultDelete = await sequelize.query(
                `delete from db01_owner.thuc_hien_kpi_2025 
                WHERE ten_chi_tieu = :nameKpi and thang = to_date(:month,'dd-mm-rrrr')
                and province_code =:provinceCode
                `,
                {
                  replacements: {
                    nameKpi: info.nameKpi,
                    month: info.month,
                    provinceCode: info.province,
                  },
                  type: sequelize.QueryTypes.DELETE,
                }
              );
              await sequelize.query(
                `insert into  db01_owner.thuc_hien_kpi_2025 
                (ten_chi_tieu, thang, last_date, province_code, district_code,thuc_hien, order_number)
                values
                (
                :nameKpi,
                 to_date(:month,'dd-mm-rrrr'),
                :lastDate,
                :provinceCode,
                '',
                :kpi,
                :orderNumber
                )
                  `,
                {
                  replacements: {
                    nameKpi: info.nameKpi,
                    month: info.month,
                    lastDate: lastDate,
                    provinceCode: info.province,
                    kpi: info.kpi,
                    orderNumber: orderNumber
                  },
                  type: sequelize.QueryTypes.INSERT,
                }
              );

              console.log("check ne", result);

            } else {
              const result = await sequelize.query(
                `insert into  db01_owner.thuc_hien_kpi_2025 
              (ten_chi_tieu, thang, last_date, province_code, district_code,thuc_hien, order_number)
              values
              (
              :nameKpi,
               to_date(:month,'dd-mm-rrrr'),
              :lastDate,
              :provinceCode,
              '',
              :kpi,
              :orderNumber
              )
                `,
                {
                  replacements: {
                    nameKpi: info.nameKpi,
                    month: info.month,
                    lastDate: new Date(),
                    provinceCode: info.province,
                    kpi: info.kpi,
                    orderNumber: orderNumber
                  },
                  type: sequelize.QueryTypes.INSERT,
                }
              );

            }
            console.log("check ne", result);
          };
          res.send({ data: { sussess: true } })
        } catch (error) {
          throw new Error(`Có lỗi xảy ra:  ${error}`)


        }

      }

    }
  }



  exportExcelExecKpi(req, res) {
    console.log("==== API exportRawDashBoardExecKpi ĐÃ ĐƯỢC GỌI ====");

    const { month, kpiType, provincePt } = req.query;

    console.log("📌 Tham số nhận được từ FE:", { month, kpiType, provincePt });

    console.log("Tham số nhận được:", { month, kpiType, provincePt });

    if (!month || !kpiType) {
      console.log("Thiếu tham số đầu vào!");
      return res.status(400).json({ error: "Thiếu tham số đầu vào" });
    }

    const formattedMonth = moment(month, "DD-MM-YYYY").format("MM/YYYY");

    // Xây dựng câu lệnh SQL tùy vào điều kiện có provincePt hay không
    let sql = `
        SELECT to_char(MONTH, 'dd-mm-yyyy') MONTH, to_char(FILE_DATE, 'dd-mm-yyyy') FILE_DATE, LOAITB, ISDN, SUB_ID, to_char(ACTIVE_DATE, 'dd-mm-yyyy') ACTIVE_DATE, 
STATUS, ACT_STATUS, SUB_TYPE, CUS_TYPE, REG_TYPE, REG_REASON_ID, PROVINCE_PT, DISTRICT_PT, SHOP_CODE_PT, NV_PT, LOAI_HINH_TB, 
    KPI_PTM_HTS, KPI_PTM_TBTS_THOAI, KPI_PTM_NDS, KPI_PTM_M2M, KPI_PTM_SAYMEE, GOI_CUOC_KPI, to_char(NGAY_DKY_GOI_KPI, 'dd-mm-yyyy') NGAY_DKY_GOI_KPI
        FROM db01_owner.th_tb_ptm_kpi_2025
        WHERE TO_CHAR(MONTH, 'MM/YYYY') = '${formattedMonth}'
          AND ${kpiType} = '1'
    `;

    if (provincePt) {
      sql += ` AND province_pt = '${provincePt}'`;
    }

    console.log("Executing SQL:", sql);

    DbConnection.getConnected(sql, {}, function (result) {
      if (result) {
        console.log("Query thành công, số bản ghi:", result.length);
        res.json({ result });
      } else {
        console.log("Lỗi truy vấn dữ liệu!");
        res.status(500).json({ error: "Lỗi truy vấn dữ liệu" });
      }
    });
  }

  show(req, res) {
    res.send("detail");
  }
}
const returnOrderNumber = (nameKpi) => {
  switch (nameKpi) {
    case 'DTHU_FIBER':
      return '2';
    case 'DTHU_MASS':
      return '3.1';
    case 'DTHU_DUAN':
      return '3.2';
    case 'DTHU_GPS':
      return '6';
    case 'TB_PLAT_TT':
      return '8.2';
    case 'SL_C2C':
      return '7.1';
    case 'TYLE_GD_C2C':
      return '7.3';
    case 'TI_LE_DN_SU_DUNG_GP_MBF':
      return '8.2';
    default: return '0';

  }
}

const returnLastDate = (nameKpi, object) => {
  switch (nameKpi) {
    case 'DTHU_FIBER':
      return object.dateUpdateFiber ? new Date(object.dateUpdateFiber) : new Date();
    case 'DTHU_CLOUD_DC':
      return object.dateUpdateCloudDC ? new Date(object.dateUpdateCloudDC) : new Date();
    case 'DTHU_MASS':
      return object.dateUpdateDthuMass ? new Date(object.dateUpdateDthuMass) : new Date();
    case 'DTHU_DUAN':
      return object.dateUpdateDthuDuan ? new Date(object.dateUpdateDthuDuan) : new Date();
    case 'DTHU_GPS':
      return object.dateUpdateDthuGps ? new Date(object.dateUpdateDthuGps) : new Date();
    case 'TB_PLAT_TT':
      return object.dateUpdateTbPlatTT ? new Date(object.dateUpdateTbPlatTT) : new Date();
    case 'SL_C2C':
      return object.dateUpdateSLC2C ? new Date(object.dateUpdateSLC2C) : new Date();
    case 'TYLE_GD_C2C':
      return object.dateUpdateTYLEGDC2C ? new Date(object.dateUpdateTYLEGDC2C) : new Date();
    case 'TI_LE_DN_SU_DUNG_GP_MBF':
      return object.dateUpdateGpMbf ? new Date(object.dateUpdateGpMbf) : new Date();
      case 'SL_HD_GPS_KHDN':
        return object.dateUpdate_SL_HD_GPS_KHDN ? new Date(object.dateUpdate_SL_HD_GPS_KHDN) : new Date();
    default: return new Date();

  }
}
module.exports = new DashboardController();
