require("dotenv").config();
const jwt = require("jsonwebtoken");
const authenticateRouter = require("./Authenticate");
const userRoleRouter = require("./UserRole");
const chonsoRouter = require("./Chonso");

function route(app) {
  app.get("/", function (req, res) {
    res.send("Hello World!"); // This will serve your request to '/'.
  });
  app.post("/login", authenticateRouter);
  app.use("/user-role", authenticateToken, userRoleRouter);
  app.use("/chonso", chonsoRouter);
}
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
module.exports = route;
