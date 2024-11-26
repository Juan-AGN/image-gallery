const http = require('http');
const fs = require('fs');
const port = 3000;

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        loader('index.html', res, 'text/html');
    } else if (req.url === '/styles/') {
        loader('css/styles.css', res, 'text/css');
    } else if (req.url === '/main_script/') {
        loader('javascript/main.js', res, 'application/javascript');
    } else {
        loader('index.html', res, 'text/html');
    }
});

function loader(file, res, type) {
    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end('Error loading ' + file);
        } else {
            res.writeHead(200, { 'Content-Type': type });
            res.end(data);
        }
    });
}


server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});