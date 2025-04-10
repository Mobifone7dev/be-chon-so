const oracledb = require("oracledb");
oracledb.autoCommit = true;
require("dotenv").config();
var getConnected = function (sql, params, callback) {
  oracledb.getConnection(
    {
      user: process.env.USER_SALE,
      password: process.env.PASSWORD_SALE,
      connectString: process.env.CONNECT_STRING_SALE,
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
          outFormat: oracledb.OBJECT,
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
      user: process.env.USER_SALE,
      password: process.env.PASSWORD_SALE,
      connectString: process.env.CONNECT_STRING_SALE,
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

function doRelease(connection) {
  connection.close(function (err) {
    if (err) {
      console.error(err.message);
    }
  });
}
module.exports.getConnected = getConnected;
module.exports.execute = execute;
