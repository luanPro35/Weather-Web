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
        // Bỏ qua việc kiểm tra kết nối email để có thể khởi động server
        console.log('Bỏ qua kiểm tra kết nối email để khởi động server');
        return true;
    } catch (error) {
        console.error('Lỗi khi khởi động dịch vụ email:', error);
        // Không ném lỗi để server có thể tiếp tục khởi động
        return true;
    }
};

// Hàm lên lịch gửi email
const scheduleEmailNotifications = async () => {
    try {
        // Bỏ qua việc lên lịch gửi email để có thể khởi động server
        console.log('Bỏ qua việc lên lịch gửi email để khởi động server');
        return true;
    } catch (error) {
        console.error('Lỗi khi lên lịch thông báo email:', error);
        // Không ném lỗi để server có thể tiếp tục khởi động
        return true;
    }
};

// Initialize Express app
const app = express();

// Lấy cổng từ biến môi trường hoặc cấu hình
const port = process.env.PORT || config.app.port || 3000;
console.log(`Cấu hình cổng: ${port}`);

// Xử lý tắt server đúng cách khi nhận tín hiệu
process.on('SIGTERM', () => {
  console.log('Nhận tín hiệu SIGTERM, đang đóng server...');
  server && server.close(() => {
    console.log('Server đã đóng.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Nhận tín hiệu SIGINT, đang đóng server...');
  server && server.close(() => {
    console.log('Server đã đóng.');
    process.exit(0);
  });
});

// Biến toàn cục để lưu trữ instance của server
let server;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure middleware
require('./config/middleware')(app);

// Configure session
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

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
        
        // Bỏ qua việc khởi tạo dịch vụ email và lên lịch gửi email
        console.log('Bỏ qua việc khởi tạo dịch vụ email và lên lịch gửi email để khởi động server');
        
        // Khởi động server ngay lập tức
        startServer();
    })
    .catch(err => {
        console.error('Lỗi khi khởi tạo ứng dụng:', err);
        // Khởi động server ngay cả khi có lỗi
        startServer();
    });

/**
 * Khởi động server trên cổng được chỉ định, nếu cổng đã được sử dụng thì thử cổng khác
 * @param {number} portToUse - Cổng để khởi động server
 * @param {number} maxAttempts - Số lần thử tối đa
 * @param {number} attempt - Số lần đã thử
 */
const startServer = (portToUse = port, maxAttempts = 10, attempt = 1) => {
    // Kiểm tra giới hạn cổng hợp lệ
    if (portToUse >= 65536) {
        console.error('Không thể tìm thấy cổng khả dụng trong phạm vi hợp lệ (0-65535).');
        process.exit(1);
        return;
    }
    
    // Kiểm tra số lần thử
    if (attempt > maxAttempts) {
        console.error(`Đã thử ${maxAttempts} cổng khác nhau nhưng không thành công. Vui lòng kiểm tra lại cấu hình mạng.`);
        process.exit(1);
        return;
    }
    
    // Xác định cổng tiếp theo nếu cổng hiện tại bị sử dụng
    let nextPort;
    if (portToUse === 3000) {
        // Nếu cổng là 3000 và bị sử dụng, thử cổng 8080 thay vì tăng dần
        nextPort = 8080;
    } else if (portToUse === 8080) {
        // Nếu cổng là 8080 và bị sử dụng, thử cổng 3001
        nextPort = 3001;
    } else if (portToUse >= 30000) {
        // Nếu cổng lớn hơn hoặc bằng 30000, thử cổng 3001
        nextPort = 3001;
    } else {
        // Nếu không phải các trường hợp trên, thử tăng thêm 1
        nextPort = portToUse + 1;
    }
    
    // Thử khởi động server trên cổng hiện tại
    try {
        server = app.listen(portToUse, () => {
            const url = `http://localhost:${portToUse}`;
            console.log('\x1b[36m%s\x1b[0m', `Server đang chạy tại: ${url}`);
            console.log('\x1b[32m%s\x1b[0m', `Bạn có thể truy cập ứng dụng tại: ${url}`);
            console.log('\x1b[33m%s\x1b[0m', `Mở trình duyệt và nhập địa chỉ: ${url}`);
            console.log('\x1b[35m%s\x1b[0m', `Trong PowerShell: Nhấn Ctrl và click vào URL để mở trình duyệt`);
            console.log('\x1b[35m%s\x1b[0m', `Trong CMD: Nhấp chuột phải vào URL và chọn "Open Hyperlink"`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Cổng ${portToUse} đã được sử dụng, đang thử cổng ${nextPort}... (Lần thử ${attempt}/${maxAttempts})`);
                startServer(nextPort, maxAttempts, attempt + 1);
            } else {
                console.error('Lỗi khi khởi động server:', err);
                process.exit(1);
            }
        });
        
        // Xử lý lỗi không bắt được
        server.on('error', (err) => {
            console.error('Lỗi server không mong đợi:', err);
        });
    } catch (err) {
        console.error('Lỗi không mong đợi khi khởi động server:', err);
        process.exit(1);
    }
};

// Chỉ gọi startServer một lần, không cần truyền tham số vì đã có giá trị mặc định
startServer();

// Định nghĩa lại route /auth/google/callback để xử lý đăng nhập bằng Google
app.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    failureFlash: true
  }),
  (req, res) => {
    // Log successful authentication
    console.log('User authenticated:', req.user);
    
    // Store user info in session
    req.session.user = {
      name: req.user.displayName,
      email: req.user.emails[0].value,
      picture: req.user.photos[0].value
    };
    
    res.redirect('/?login=success');
  }
);