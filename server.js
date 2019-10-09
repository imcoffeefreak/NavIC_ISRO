//using express as a server so include express in the app
var express = require('express');

//creating an instance of the express app
var app = express();

var dgram = require('dgram');
var server = dgram.createSocket('udp6');
const sqlite3 = require('sqlite3').verbose();
var ts = Date.now();

var message;

var db = new sqlite3.Database('aerophilia.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            console.error("error " + err.message);
        }
        console.log('Connected to the aerophilia database.');
    });


// creating table

try {
    db.run('CREATE TABLE IF NOT EXISTS data(timestamp,value)');
} catch (e) {

}

server.on('message', (msg, rinfo) => {
    //console.log("hello boo");
    message = msg;
    db.run(`INSERT INTO data(timestamp,value) VALUES(?,?)`, [ts, msg], function (err) {
        if (err) {
            console.log(err);
        }
        console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    });
});

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
});

//app.set('port', 80);
server.bind(13000);

//if you are getting any data from html body enable/uncomment following lines that basically parses data from body
// var bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({
//     extended: true
// }));

//setup view engine as ejs
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', function (req, res) {
    res.render('index.html',{message:message,ts:ts});
});

//making server to listen at port 80
app.listen(80, function () { 
    console.log("server is running at localhost:80");
})
