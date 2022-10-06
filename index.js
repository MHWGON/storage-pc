const http = require('http');
const url = require('url');
const path = require('path');
const { stat, readFile } = require('fs/promises');
const crypto = require('crypto');

http.createServer(async (req, res) => {
    let { pathname } = url.parse(req.url);
    let fileName = pathname === '/'
        ? path.join(__dirname, '../storage-pc', pathname, '/static/index.html')
        : path.join(__dirname, '../storage-pc', pathname);
    // 除了根文件index.html文件以外，其她文件的缓存时间（css、js....）;
    // 强制缓存设置的两种方式：Expire、Cache-Control
    // res.setHeader('Expires', new Date(new Date().getTime() + 1000 *10).toISOString());
    // res.setHeader('Cache-Control', 'max-age=10');
    try {
        const statObj = await stat(fileName);
        // 借助当前文件的修改时间(协商缓存)
        // 注意： 协商缓存对根文件index.html
        const ctime = statObj.ctime.toUTCString();
        res.setHeader('Last-Modified', ctime);
        if (req.headers['if-modified-since'] === ctime) {
            return (res.statusCode = 304) && res.end();
        }
        // Etag/if-none-match 借助当前文件的内容
        if (statObj.isFile()) {
            const result = await readFile(fileName);
            let hash = crypto.createHash('md5').update(result).digest('base64');
            res.setHeader('Etag', hash);
            if (req.headers['if-none-match'] === hash) {
                return (res.statusCode = 304) && res.end();
            }
            res.end(result);
        } else {
            res.statusCode = 404;
            res.end('NOT FOUND')
        }
    } catch (error) {
        res.statusCode = 404;
        res.end('NOT FOUND')
    }


}).listen(3001);
