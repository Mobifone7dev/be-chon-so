// logger.js
const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');

// Đảm bảo thư mục logs tồn tại
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.simple()
    ),
    transports: [
        new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join(logDir, 'combined.log') }),
        new transports.Console()
    ]
});

module.exports = logger;
