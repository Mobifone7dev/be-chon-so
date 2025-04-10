require("dotenv").config();
const jwt = require("jsonwebtoken");
const ldap = require("ldapjs");
const DbConnection = require("../../DbConnection");
const { sequelize } = require('../models'); // Import s

class Authenticate_Controller {
  async index(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const user = { name: username };
    if (username && password) {
      var client = ldap.createClient({
        url: process.env.LDAP_URI,
        timeout: 5000,
        connectTimeout: 10000,
      });
      client.bind(username, password, async (err) => {
        client.unbind();
        if (err) {
          console.log(err);
          res.sendStatus(401);
        } else {
          const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "10d",
          });
          try {
            const existingUserEmail = await sequelize.query(
              `SELECT * FROM web_user where 
              user_email = :username
             `,
              {
                replacements: { username: username },
                type: sequelize.QueryTypes.SELECT,
              });
            if (existingUserEmail.length == 0) {
              const userNamePrefix = username.split("@")[0];
              await sequelize.query(
                `insert into web_user (user_email, user_name, status) 
                     values(
                    :username,
                    :userNamePrefix,
                    1
                     ) 
                     `,
                {
                  replacements: { username: username, userNamePrefix: userNamePrefix },
                  type: sequelize.QueryTypes.INSERT,
                });
            }



            const queryRoles = await sequelize.query(
              `select a.*, b.* from web_user_email a 
            left join web_user b on a.user_email =  b.user_email  where a.user_email =:username `,
              {
                replacements: { username: username },
                type: sequelize.QueryTypes.SELECT,
              });

            res.json({
              accessToken: accessToken,
              username: username,
              roles: queryRoles
            });
          } catch (error) {
            console.log("error", error)
            res.status(401).json({ error: "có lỗi xảy ra" }); // This runs as well.
          }
        }
      });
    } else {
      res.json({ message: "Please Provide User And Password" });
    }
  }
}

module.exports = new Authenticate_Controller();
