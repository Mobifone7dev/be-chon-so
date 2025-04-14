require("dotenv").config();
const jwt = require("jsonwebtoken");
const ldap = require("ldapjs");
const { sequelize } = require('../models'); // Import s
const { customEncode } = require("../utils/helper");
class Authenticate_Controller {


  async index(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const user = { name: username };
    var re =
      /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    if (!re.test(username)) {
      try {
        const existingUser = await sequelize.query(
          `SELECT * FROM db01_owner.v_c7_admin_user 
         where  user_name = :username
         `,
          {
            replacements: { username: username },
            type: sequelize.QueryTypes.SELECT,
          });
        console.log("existingUser", existingUser[0].PASSWORD, customEncode(password))
        if (existingUser && existingUser[0] && existingUser[0].PASSWORD) {
          if (customEncode(password) == existingUser[0].PASSWORD) {
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
              expiresIn: "1d",
            });
            res.json({
              accessToken: accessToken,
              username: username,
              roles: []
            });
          } else {
            res.status(401).json({ error: "sai mat khau" }); // This runs as well.

          }
        } else {
          res.status(401).json({ error: "Invalid user" }); // This runs as well.

        }
      } catch (error) {
        console.log("error", error)
        res.status(401).json({ error: "có lỗi xảy ra" }); // This runs as well.
      }

    } else if (username && password) {
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
            res.json({
              accessToken: accessToken,
              username: username,
              roles: []
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
