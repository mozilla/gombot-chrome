var redis = require("redis"),
    express = require('express'),
    http = require('http'),
    https = require('https'),
    browserid = require('express-browserid');
    
app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

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
    
    // Need to allow crossdomain access for bookmarklet to work
    app.use(allowCrossDomain);
    
    // Serve static files
    app.use('/public',express.static('public'));
    
    app.use(express.bodyParser());
    
    var MemoryStore = require('connect').session.MemoryStore;
    // TODO: Substitute actual session secret
    app.use(express.cookieParser("seeekrit string"));
    app.use(express.session());
    
    // Install express-browserid routes
    browserid.plugAll(app);
});

app.listen();


// Authenticate with Persona. 
app.get('/persona_auth', function(req, res) {
    res.render('auth');
});
app.get('/test_auth', function(req, res) {
    if (req.session.email) {
        res.send("Hello, " + req.session.email + "!");
    }
    else {
        res.send("I don't know who you are.");
    }
});
//////////////////////////////////////////////

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
