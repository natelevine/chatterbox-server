/* Import node's http module: */
var express = require("express");
var app = express();

// var handleRequest = require("./request-handler.js")
var storage = {results: []}; 
var objectId = 0;

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;
});


var allowCrossDomain = function(req, res, next) {
	res.header("access-control-allow-origin", "*");
  res.header("access-control-allow-methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("access-control-allow-headers", "content-type, accept");
  res.header("access-control-max-age", 10);
	next();
};
// var __dirname = "../client/client/";
app.use(express.static(__dirname + "/client"));
app.use(allowCrossDomain);

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/client/index.html');
});

app.get('/cloudmouth', function(req, res) {
	res.send(storage);
})

app.post('/cloudmouth', function(req, res){
	console.log(req.body);
	req.body.objectId = ++objectId;
	storage.results.push(req.body);
	res.send('got a POST request');
});