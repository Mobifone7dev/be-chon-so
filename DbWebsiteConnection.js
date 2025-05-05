var async = require("async");

const oracledb = require("oracledb");
oracledb.autoCommit = true;
require("dotenv").config();
var getConnected = function (sql, params, callback) {
  oracledb.getConnection(
    {
      user: process.env.USER_WEBSITE,
      password: process.env.PASSWORD_WEBSITE,
      connectString: process.env.CONNECT_STRING_WEBSITE,
    },
    function (err, connection) {
      if (err) {
        console.error(err.message);
        callback(null);
        return;
      }
      connection.execute(
        sql,
        params,
        {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        },
        function (err, result) {
          if (err) {
            console.error(err.message);
            doRelease(connection);
            callback(null);
            return;
          }

          rows = result.rows;
          doRelease(connection);
          callback(rows);
          return;
        }
      );
    }
  );
};

async function execute(sql, params) {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.USER_WEBSITE,
      password: process.env.PASSWORD_WEBSITE,
      connectString: process.env.CONNECT_STRING_WEBSITE,
    });

    let queryResult;
    queryResult = await connection.execute(sql, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    return queryResult.rows;
  } catch (err) {
    console.log(err);
    return null;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

async function execute(isdn) {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.USER_WEBSITE,
      password: process.env.PASSWORD_WEBSITE,
      connectString: process.env.CONNECT_STRING_WEBSITE,
    });
    // Khai báo biến để nhận kết quả trả về từ function
    let bindvars = {
      result: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32767 },
    };
    console.log(connection);
    const result = await connection.execute(
      `BEGIN :result := F_call_soap_api_flowone(${isdn}); END;`,
      bindvars
    );
    console.log("Result:", result);
    return result.outBinds.result;
  } catch (err) {
    console.log(err);
    return null;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}
async function insertChonso(in_hoten_kh, in_cccd_kh, in_tinh_kh, in_huyen_kh, in_diachi_kh, in_shop_code, in_isdn, in_ip, in_ma_gs, in_is_ha_ck = 0, in_link_phieu = null) {
  // Kiểm tra xem các biến có giá trị hợp lệ không
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.USER_WEBSITE,
      password: process.env.PASSWORD_WEBSITE,
      connectString: process.env.CONNECT_STRING_WEBSITE,
    });

    let bindvars = {
      in_hoten_kh: in_hoten_kh,
      in_cccd_kh: in_cccd_kh,
      in_tinh_kh: in_tinh_kh,
      in_huyen_kh: in_huyen_kh,
      in_diachi_kh: in_diachi_kh,
      in_shop_code: in_shop_code,
      in_isdn: in_isdn,
      in_ip: in_ip,
      in_ma_gs: in_ma_gs,
      in_is_ha_ck: in_is_ha_ck,
      in_link_phieu: in_link_phieu,
      result: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await connection.execute(
      `BEGIN :result := liennguyen1_owner.f_insert_chonso_alter(:in_hoten_kh, :in_cccd_kh, :in_tinh_kh, :in_huyen_kh, :in_diachi_kh,:in_shop_code,:in_isdn, :in_ip,:in_ma_gs, :in_is_ha_ck, :in_link_phieu ); END;`,
      bindvars
    );

    return result.outBinds.result;
  } catch (err) {
    console.error(err);
    return null;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

async function checkType(isdn) {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: process.env.USER_WEBSITE,
      password: process.env.PASSWORD_WEBSITE,
      connectString: process.env.CONNECT_STRING_WEBSITE,
    });
    // Khai báo biến để nhận kết quả trả về từ function
    let bindvars = {
      result: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32767 },
    };
    console.log(connection);
    const result = await connection.execute(
      `BEGIN :result := db01_owner.LOAI_SO_KHUYEN_KHICH_CTY7_NEW(${isdn}); END;`,
      bindvars
    );
    console.log("Result:", result);
    return result.outBinds.result;
  } catch (err) {
    console.log(err);
    return null;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}
function doRelease(connection) {
  connection.close(function (err) {
    if (err) {
      console.error(err.message);
    }
  });
}
module.exports.getConnected = getConnected;
module.exports.insertChonso = insertChonso;
module.exports.execute = execute;
module.exports.checkType = checkType;
