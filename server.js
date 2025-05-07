

const fs = require("fs");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const https = require('https')
const hsts = require('hsts')
const helmet = require('helmet');
const app = express();
const PORT = 8106;

app.use(cors());
app.use(morgan("combined"));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
console.log(
  "check", process.env.DB, process.env.USER_WEBSITE, process.env.PASSWORD_WEBSITE
)
const route = require("./src/routes");
app.use("/public", express.static(path.join(__dirname, "public")));
route(app);

// -----production-----
var certificate = fs.readFileSync('/usr/local/ssl/certificate/tracuu7/cert_tracuu7_161024.crt');
var privateKey = fs.readFileSync('/usr/local/ssl/certificate/tracuu7/private_tracuu7.key');
require('dotenv').config();
app.use(hsts({
  maxAge: 15552000  // 180 days in seconds
}))

app.use((req, res, next) => {
  const allowedOrigins =
    ['https://tracuu7.mobifone.vn',
      'https://tracuu7.mobifone.vn:8101',
      'https://tracuu7.mobifone.vn:443',
      'https://tracuu7.mobifone.vn:8111',
      'https://tracuu7.mobifone.vn:8103',
      'https://tracuu7.mobifone.vn:8106',
      'https://chonso7.mobifone.vn:8107',
      'https://chonso7.mobifone.vn:8112',
      'http://localhost:8111',
      'http://localhost:8112',

    ];
  if (allowedOrigins.indexOf(req.headers.origin) !== -1) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.header('Access-Control-Allow-Credentials', true);
  }
  return next();
});

app.use(function (req, res, next) {
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
})

const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "ajax.googleapis.com"],
    styleSrc: ["'self'", "maxcdn.bootstrapcdn.com"],
    imgSrc: ["'self'", "tracuu7.mobifone.vn"],
    connectSrc: ["'self'", "tracuu7.mobifone.vn"],
    imgSrc: ["'self'", "chonso7.mobifone.vn"],
    connectSrc: ["'self'", "chonso7.mobifone.vn"],
    fontSrc: ["'self'", "fonts.gstatic.com"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  },
};
app.use(helmet.contentSecurityPolicy(cspConfig));



process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
https.createServer({
  key: privateKey,
  cert: certificate
}, app).listen(PORT)

console.log("Server is running on port: ", PORT);
// -----development-----
// app.listen(PORT);

