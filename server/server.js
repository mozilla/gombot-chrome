var redis = require("redis"),
    express = require('express'),
    http = require('http');
    
app = express();
server = http.createServer(app).listen(8000);
    
io = require('socket.io').listen(server);
 
app.configure(function () {
    var allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        res.header("Access-Control-Allow-Headers", "X-Requested-With");

        next();
    }
    
    app.use(allowCrossDomain);
    app.use('/public',express.static('public'));
});

app.listen();

app.get('/get_login/:host', function(req, res, next) {
    client.hget('me@paulsawaya.com', req.params.host, function(err, data) {
        res.send(JSON.stringify({
            data: JSON.parse(data)
        }));  
    });
});

var client = redis.createClient();

io.sockets.on('connection', function (socket) {
    socket.on('add_login', function(data) {
        console.log("Recv add_login. username: " + data.username + " on site: " + data.hostname);
        
        client.hset('me@paulsawaya.com',data.hostname,JSON.stringify(data));
    });
});

console.log('Started!');
