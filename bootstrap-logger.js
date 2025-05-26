// bootstrap-logger.js
const logger = require('./logger');

// Ghi đè console toàn cục
console.log = (...args) => logger.info(args.join(' '));
console.info = (...args) => logger.info(args.join(' '));
console.warn = (...args) => logger.warn(args.join(' '));
console.error = (...args) => logger.error(args.join(' '));

// Bắt các lỗi không bắt được
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION:', err);
    process.exit(1); // hoặc tùy logic
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('UNHANDLED REJECTION:', { reason, promise });
});
