const http = require('http');
const url = require('url');
const path = require('path');
const { stat, readFile } = require('fs/promises');

http.createServer(async (req, res) => {
    let { pathname } = url.parse(req.url);
    console.log(pathname);
    let fileName = pathname === '/'
        ? path.join(__dirname, '../', pathname, 'static/index.html')
        : path.join(__dirname, '../', pathname);

    try {
        const statObj = await stat(fileName);

    } catch (e) {
        res.statusCode = 404;
        res.end('NOT FOUND')
    }


}).listen(3001);
