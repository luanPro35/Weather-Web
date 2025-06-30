const express = require('express');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const config = require('./config');
const initializeDatabase = require('./models/init-db');
const emailService = require('./config/email');

// Hàm khởi tạo dịch vụ email
const initializeEmailService = async () => {
    try {
        const isConnected = await emailService.verifyEmailConnection();
        if (!isConnected) {
            throw new Error('Không thể kết nối đến dịch vụ email');
        }
        return true;
    } catch (error) {
        console.error('Lỗi khi khởi động dịch vụ email:', error);
        throw error;
    }
};

// Hàm lên lịch gửi email
const scheduleEmailNotifications = async () => {
    try {
        await emailService.scheduleEmailNotifications();
        return true;
    } catch (error) {
        console.error('Lỗi khi lên lịch thông báo email:', error);
        throw error;
    }
};

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
        if (process.env.NODE_ENV !== 'production') {
            console.log('Đã khởi tạo cơ sở dữ liệu thành công.');
        }
        
        // Khởi tạo dịch vụ email
        return initializeEmailService();
    })
    .then(() => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('Đã khởi động dịch vụ email thành công.');
        }
        
        // Lên lịch gửi email
        return scheduleEmailNotifications();
    })
    .then(() => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('Đã lên lịch tất cả các thông báo email thành công.');
        }
        
        // Khởi động server
        startServer();
    })
    .catch(err => {
        console.error('Lỗi khi khởi tạo ứng dụng:', err);
    });

// Thử lắng nghe trên cổng được cấu hình, nếu bị lỗi thì thử cổng khác
const startServer = () => {
    let portToUse = port;
    // Kiểm tra giới hạn cổng hợp lệ
    if (portToUse >= 65536) {
        console.error('Không thể tìm thấy cổng khả dụng trong phạm vi hợp lệ (0-65535).');
        return;
    }
    
    // Nếu cổng là 3000 và bị sử dụng, thử cổng 8080 thay vì tăng dần
    if (portToUse === 3000) {
        const nextPort = 8080;
        const server = app.listen(portToUse, () => {
            const url = `http://localhost:${portToUse}`;
            // Chỉ hiển thị thông báo server đang chạy
            console.log('\x1b[36m%s\x1b[0m', `Server đang chạy tại: ${url}`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Cổng ${portToUse} đã được sử dụng, đang thử cổng ${nextPort}...`);
                startServer(nextPort);
            } else {
                console.error('Lỗi khi khởi động server:', err);
            }
        });
    } else {
        // Nếu không phải cổng 3000, thử tăng thêm 1 nhưng không vượt quá 9999
        const nextPort = portToUse < 9999 ? portToUse + 1 : 3000;
        const server = app.listen(portToUse, () => {
            const url = `http://localhost:${portToUse}`;
            console.log('\x1b[36m%s\x1b[0m', `Server đang chạy tại: ${url}`);
            console.log('\x1b[32m%s\x1b[0m', `Bạn có thể truy cập ứng dụng tại: ${url}`);
            console.log('\x1b[33m%s\x1b[0m', `Mở trình duyệt và nhập địa chỉ: ${url}`);
            console.log('\x1b[35m%s\x1b[0m', `Trong PowerShell: Nhấn Ctrl và click vào URL để mở trình duyệt`);
            console.log('\x1b[35m%s\x1b[0m', `Trong CMD: Nhấp chuột phải vào URL và chọn "Open Hyperlink"`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Cổng ${portToUse} đã được sử dụng, đang thử cổng ${nextPort}...`);
                startServer(nextPort);
            } else {
                console.error('Lỗi khi khởi động server:', err);
            }
        });
    }
};

startServer(port);