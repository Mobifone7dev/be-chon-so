const crypto = require('crypto');

function lowerCaseKeys(obj) {
  return Object.keys(obj).reduce((accumulator, key) => {
    accumulator[key.toLowerCase()] = obj[key];
    return accumulator;
  }, {});
}

function checkIfEmailInString(text) {
  var re =
    /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
  return re.test(text);
}

function customEncode(input) {
  // 1. Băm SHA1, xuất ra dưới dạng hex
  const sha1HashHex = crypto.createHash('sha1').update(input).digest('hex');

  // 2. Tách mỗi 2 ký tự (hex) -> byte -> push vào Buffer
  const byteArray = [];
  for (let i = 0; i < sha1HashHex.length; i += 2) {
    byteArray.push(parseInt(sha1HashHex.substr(i, 2), 16));
  }

  // 3. Chuyển về Buffer và encode base64
  const result = Buffer.from(byteArray).toString('base64');
  return result;
}
module.exports = { customEncode, checkIfEmailInString, lowerCaseKeys };
