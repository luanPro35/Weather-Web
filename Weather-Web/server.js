const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from public directory
app.use(express.static('public'));

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'loading.html')); // Changed to loading.html
});

// Routes for other pages
app.get('/trangchu', (req, res) => {
    res.sendFile(path.join(__dirname, './public/html/trangchu.html'));
});
app.get('/dubao', (req, res) => {
    res.sendFile(path.join(__dirname, './public/html/dubao.html'));
});

app.get('/thongbao', (req, res) => {
    res.sendFile(path.join(__dirname, './public/html/thongbao.html'));
});

app.get('/thanhpho', (req, res) => {
    res.sendFile(path.join(__dirname, './public/html/thanhpho.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});