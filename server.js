const express = require('express');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const config = require('./config');
const initializeDatabase = require('./models/init-db');

// Initialize Express app
const app = express();
const port = config.app.port || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure middleware
require('./config/middleware')(app);

// Configure session
app.use(session({
    secret: config.app.sessionSecret,
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')();

// Routes - Chỉ sử dụng các route cần thiết
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));

// Thêm route mặc định để chuyển hướng đến trangchu.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'loading.html'));
});

// Khởi tạo cơ sở dữ liệu
initializeDatabase()
    .then(() => {
        console.log('Đã khởi tạo cơ sở dữ liệu thành công.');
    })
    .catch(err => {
        console.error('Lỗi khi khởi tạo cơ sở dữ liệu:', err);
    });

// Thử lắng nghe trên cổng được cấu hình, nếu bị lỗi thì thử cổng khác
const startServer = (portToUse) => {
    const server = app.listen(portToUse, () => {
        console.log(`Server running at http://localhost:${portToUse}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Cổng ${portToUse} đã được sử dụng, đang thử cổng ${portToUse + 1}...`);
            startServer(portToUse + 1);
        } else {
            console.error('Lỗi khi khởi động server:', err);
        }
    });
};

startServer(port);