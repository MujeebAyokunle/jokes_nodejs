const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    res.setHeader('content-type', 'text/html');

    let path = './view/';

    switch(req.url) {
        case '/':
            path += 'index.html'
            res.statusCode = 200
            break;
        case 'about':
            path += 'about.html'
            res.statusCode = 200
            break;
        case 'about-us':
            res.statusCode = 301
            res.setHeader('Location', '/aboutus')
            res.end()
            break;
        default:
            path += '404.html'
            res.statusCode = 404
            break;
    }

    fs.readFile('./views/index.html', (err, data) => {
        if(err) {
            console.log(err);
            res.end();
        } else {
            res.write(data);
            res.end();
        }
    })
    
    
});

server.listen(3000, 'localhost', () => {
    console.log('listening')
})
