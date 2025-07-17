const { Association } = require("sequelize");
var Sequelize = require("sequelize");
const DbWebsiteConnection = require("../../DbWebsiteConnection");
const db = require("../models");
const { sequelize } = require('../models'); // Import sequelize từ nơi đã cấu hình
const { Client } = require('@elastic/elasticsearch');
require('dotenv').config(); // Đọc biến môi trường từ .env
const client = new Client({
  node: process.env.ELASTIC_NODE,
  auth: {
    username: process.env.ELASTIC_USER,
    password: process.env.ELASTIC_PASSWORD
  },
  tls: {
    rejectUnauthorized: false  // Bỏ kiểm tra SSL nếu dùng self-signed cert
  }
});
class ChonsoController {
  async index(req, res) {
    res.send({ result: "hello world" });
  }
  async checkConnection() {
    try {
      const response = await client.info();
      console.dir(response, { depth: null });
      console.log("BODY:", response);
    } catch (err) {
      console.error("Lỗi kết nối:", err.meta?.body || err);
    }
  }

  async getValidEmails(req, res) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    console.log("Checking email:", email);

    try {
      const [result] = await db.sequelize.query(
        `SELECT email 
         FROM user_access 
         WHERE LOWER(email) = LOWER(:email) 
         AND ROWNUM = 1`,  // Dùng ROWNUM cho Oracle để giới hạn kết quả
        {
          replacements: { email },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      console.log("SQL Result:", result);

      if (result) {
        return res.send({ allowed: true });
      } else {
        return res.send({ allowed: false });
      }
    } catch (error) {
      console.error("Error checking email permission:", error);
      res.status(500).send({ error: "Internal Server Error", details: error.message });
    }
  }

  async searchCondition(req, res) {
    const limit = parseInt(req.query.limit) || 10; // Số bản ghi trên mỗi trang
    let search = req.query.search || ""; // Lấy từ khóa tìm kiếm từ query string
    const type = req.query.type || null; // Lấy giá trị SPE_NUMBER_TYPE từ query string

    console.log('search', search);
    console.log('typeNumber', type);
    if (search.length == 0) {
      // Nếu có từ khóa tìm kiếm, thay thế dấu '*' thành '%'
      search = '*';
    }

    const mustQuery = [
      {
        wildcard: {
          'tel_number_key.keyword': {
            value: search
          }
        }
      }
    ];

    if (type) {
      mustQuery.push({
        term: {
          'spe_number_type.keyword': type
        }
      });
    }
    try {
      const result = await client.search({
        index: "chonso7",
        query: {
          bool: {
            must: mustQuery
          }
        },
        size: limit  // Số lượng kết quả trả về (mặc định chỉ là 10)
      });

      // console.log('📦 Kết quả:', result.hits.hits);
      if (result.hits.hits.length > 0) {
        res.send({ result: result.hits.hits, limit: limit });

      } else {
        res.status(200).send({ message: "No data found.", result: [] }); // Trả về lỗi nếu không có dữ liệu
      }
    } catch (err) {
      console.error('❌ Lỗi khi query:', err);
      res.status(500).send({ error: "Internal Server Error" }); // Trả về lỗi server

    }
  }


  async chonso(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10; // Số bản ghi trên mỗi trang
      let search = req.query.search || ""; // Lấy từ khóa tìm kiếm từ query string
      const type = req.query.type || ""; // Lấy giá trị SPE_NUMBER_TYPE từ query string

      // Nếu có từ khóa tìm kiếm, thay thế dấu '*' thành '%'
      if (search) {
        search = search.replace(/\*/g, "%");
      }

      // Thêm điều kiện LIKE vào SQL nếu có từ khóa tìm kiếm
      let whereCondition = search ? `and a.TEL_NUMBER LIKE '${search}'` : "";


      // Thêm điều kiện SPE_NUMBER_TYPE nếu có giá trị 'type'
      if (type) {
        if (type === '10') {
          whereCondition += ` AND a.SPE_NUMBER_TYPE = 'Tự do'`; // Tu do
        } else if (type >= '1' && type <= '9') {
          whereCondition += ` AND a.SPE_NUMBER_TYPE = '${type}'`; // Những giá trị từ 1 đến 9
        }
      }
      // Câu SQL lấy dữ liệu từ cơ sở dữ liệu
      // let sql = `
      //   SELECT v1.*, v2.name FROM (  
      //   SELECT a.TEL_NUMBER, a.HLR_EXISTS, a.SPE_NUMBER_TYPE,
      //     DECODE(spe_number_type, '1', 'CK1500', '2', 'CK1200', '3', 'CK1000', '4', 'CK800',
      //    '5', 'CK500', '6', 'CK400', '7', 'CK300', '8', 'CK250', '9', 'CK150', '10', 'Tự do', 'KXD') loai_ck, a.SHOP_CODE, a.CHANGE_DATETIME
      //     FROM v_kho_so_all a
      //     ${whereCondition}
      //     AND hlr_exists in (1,3) 
      //     AND ROWNUM <= ${limit} 
      //     ) v1 left join db01_owner.shop_tcqlkh v2 on v1.shop_code = v2.shop_code order by v1.tel_number asc
      //   `;

      let sql = `
        SELECT v1.tel_number, v1.SPE_NUMBER_TYPE, v1.loai_ck, v1.CHANGE_DATETIME, nvl(v2.is_hold,v1.is_hold) is_hold FROM (  
        SELECT a.TEL_NUMBER, a.SPE_NUMBER_TYPE,
          DECODE(spe_number_type, '1', 'CK1500', '2', 'CK1200', '3', 'CK1000', '4', 'CK800',
         '5', 'CK500', '6', 'CK400', '7', 'CK300', '8', 'CK250', '9', 'CK150', '10', 'Tự do', 'KXD') loai_ck, a.CHANGE_DATETIME, '0' is_hold
          FROM v_kho_so_all a
          where CHANGE_DATETIME < sysdate - 31
          ${whereCondition} 
          AND hlr_exists in (1,3) 
          and a.tel_number not like '12%'
          and a.tel_number not like '905000%'
          and a.tel_number not like '7826%'
          AND ROWNUM <= 100 order by SPE_NUMBER_TYPE desc, tel_number
          ) v1 left join ( select a.isdn tel_number, '1' is_hold from liennguyen1_owner.booking_number a where a.start_time >= sysdate - 1 ) v2 on v1.TEL_NUMBER = v2.TEL_NUMBER
          where not exists ( select 1 from db01_owner.forbiden_subscriber_tcqlkh b where v1.TEL_NUMBER = b.isdn )
          order by v1.SPE_NUMBER_TYPE, v1.TEL_NUMBER
        `;
      console.log("Generated SQL:", sql); // Debug câu SQL để kiểm tra

      // Thực thi câu SQL
      DbWebsiteConnection.getConnected(sql, {}, function (result) {
        if (result) {
          // Chuyển đổi CHANGE_DATETIME sang định dạng ngày tháng năm
          const formattedResult = result.map(item => {
            // Kiểm tra nếu có CHANGE_DATETIME và định dạng lại
            if (item.CHANGE_DATETIME) {
              const date = new Date(item.CHANGE_DATETIME);
              const day = date.getDate();
              const month = date.getMonth() + 1; // Lấy tháng (cộng thêm 1 vì tháng bắt đầu từ 0)
              const year = date.getFullYear();
              // Định dạng lại ngày tháng năm theo kiểu "dd/mm/yyyy"
              item.CHANGE_DATETIME = `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
            }
            return item;
          });

          res.send({ result: formattedResult, limit: limit });
        } else {
          res.status(404).send({ message: "No data found." }); // Trả về lỗi nếu không có dữ liệu
        }
      });
    } catch (error) {
      console.error("Database Query Error:", error); // Log lỗi nếu có
      res.status(500).send({ error: "Internal Server Error" }); // Trả về lỗi server
    }
  }

  async insertChonso(req, res) {
    const { in_hoten_kh, in_cccd_kh, in_tinh_kh, in_huyen_kh, in_diachi_kh, in_ip, in_shop_code, in_isdn, in_is_ha_ck, in_link_phieu } = req.body;
    console.log("Body nhận được:", req.body); // 👈 In thử ra
    if (in_hoten_kh && in_cccd_kh && in_tinh_kh && in_huyen_kh && in_diachi_kh && in_shop_code && in_isdn && in_ip) {

      const now = new Date();

      const seconds = String(now.getSeconds()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');

      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0'); // tháng bắt đầu từ 0
      const year = now.getFullYear();

      const formatted = `${seconds}${minutes}${hours}${day}${month}${year}`;
      const in_ma_gs = "GS" + formatted;
      try {
        const result = await DbWebsiteConnection.insertChonso(in_hoten_kh, in_cccd_kh, in_tinh_kh, in_huyen_kh, in_diachi_kh, in_shop_code, in_isdn, in_ip, in_ma_gs, in_is_ha_ck ? in_is_ha_ck : 0, in_link_phieu ? in_link_phieu : null);
        let message;
        let code = 0;
        switch (result) {
          case 1:
            message = "Insert thành công.";
            code = 1;
            break;
          case 2:
            message = "Số thuê bao đã có người chọn";
            code = 0;
            break;
          case 3:
            message = "CCCD/Passport này chỉ được giữ tối đa 3 thuê bao";
            code = 0;
            break;
          case 4:
            message = "Số thuê bao đang sử dụng";
            code = 0;
            break;
          case 5:
            message = "Cửa hàng không tồn tại";
            code = 0;
            break;
          case 6:
            message = "CCCD/Passport này đã giữ thuê bao này quá 3 lần";
            code = 0;
            break;
          case 7:
            message = "Không thể đấu nối thuê bao từ CK300 trở đi";
            code = 0;
            break;
          case 8:
            message = "Số Cam kết Tổng công ty - không được chọn";
            code = 0;
            break;
          default:
            message = "Đã xảy ra lỗi khi chọn số!";
            code = 0;
            break;
        }
        res.send({ result, message, code, codeGS: in_ma_gs });
      } catch (error) {
        console.error("Error:", error); // Log lỗi nếu có
        res.status(500).send({ error: "Internal Server Error" }); // Trả về lỗi server

      }

    } else {
      res.status(400).send({ result: null, message: "Thiếu tham số.", code: code, codeGS: in_ma_gs },);
    }
  }
  async updateIsHoldByTelNumber(req, res) {
    const { telNumberKey, newValue } = req.body;
    console.log("Cập nhật is_hold cho số:", telNumberKey, "với giá trị mới:", newValue);
    if (!telNumberKey || newValue === undefined) {
      return res.status(400).send({ error: "Thiếu tham số telNumberKey hoặc newValue" });
    }
    try {
      const result = await client.updateByQuery({
        index: 'chonso7',
        refresh: true,
        body: {
          script: {
            source: 'ctx._source.is_hold = params.newValue',
            lang: 'painless',
            params: {
              newValue: newValue
            }
          },
          query: {
            term: {
              'tel_number_key.keyword': telNumberKey
            }
          }
        }
      });
      res.status(200).send({ message: 'Cập nhật is_hold số thành công' });
      console.log('✅ Kết quả cập nhật:', result);
    } catch (err) {
      res.status(500).send({ error: 'Lỗi khi cập nhật is_hold số', error: err });
      console.error('❌ Lỗi khi cập nhật:', err);
    }
  }

  async getShopCodeByDistrict(req, res) {
    const { districtCode } = req.query;
    const { provinceCode } = req.query;

    try {
      // Kiểm tra xem districtCode và provinceCode có tồn tại trong yêu cầu không
      if (!districtCode || !provinceCode) {
        return res.status(400).send({ error: "District code and province code are required" });
      }
      const result = await db.sequelize.query(
        `SELECT * FROM db01_owner.shop_tcqlkh WHERE DISTRICT= :districtCode AND PROVINCE = :provinceCode`,
        {
          replacements: { districtCode, provinceCode },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      console.log("SQL Result:", result);

      if (result) {
        return res.send({ data: result });
      } else {
        res.status(500).send({ error: "Internal Server Error", details: error.message });
      }
    } catch (error) {
      console.error("Error checking email permission:", error);
      res.status(500).send({ error: "Internal Server Error", details: error.message });
    }
  }
  async uploadFile(req, res) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).send({ message: "No file uploaded" });
      }
      console.log("File uploaded:", file);
      res.send({ message: "File uploaded successfully", filePath: file.path });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  }

}


module.exports = new ChonsoController();
