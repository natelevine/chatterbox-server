/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var url = require('url');
var fs = require('fs');
var path = require('path');
var qs = require('querystring');
var objectId = 0;

var storage = {results: []};

fs.readFile('./storage', function(err, data) {
  if (err) {
    console.log("error retrieving old messages");
  } else {
    oldMsgs = JSON.parse(data);
    storage.results.concat(oldMsgs.results);
  }
});

exports.requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.

  // The outgoing status.
  var statusCode = 200;
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "text/plain";

  // CONSOLE
  // console.log(request.url);
  // console.log(request.method);


  console.log("Serving request type " + request.method + " for url " + request.url);

  if (request.method === 'POST') {
    console.log("POSTING A MESSAGE");
    var body = '';
    request.on('data', function(data) {
      body+=data;
      console.log(data);
    });
    request.on('end', function() {
      var message = JSON.parse(body);
      message.createdAt = Date.now();
      message.objectId = ++objectId;
      storage.results.push(message);
      statusCode = 201;
      response.writeHead(statusCode, headers);
      response.end();

      //Write the new message to a local file using fs
      fs.writeFile("./storage", JSON.stringify(storage), function(err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!!");
      });
    });
  }
  
  else if (request.method === 'GET') {
    var url = request.url;

    var potentialFile = '../client/client' + url;

    if (url === '/') {
      potentialFile += 'index.html';  
    }

    console.log(potentialFile);

    fs.readFile(potentialFile, function(err, data) {
      if (err) {

        if (url === '/classes/messages') {
          statusCode = 200;
          response.writeHead(statusCode, headers);
          response.end(JSON.stringify(storage));
        } else if (url === '/log'){
          statusCode = 200;
          response.writeHead(statusCode, headers);
          response.end();
        } else if (url === '/classes/room1' || url === '/classes/room' ){
          statusCode = 200;
          response.writeHead(statusCode, headers);
          response.end(JSON.stringify(storage));
        } else if (url === '/chatterbox'){
          statusCode = 200;
          response.writeHead(statusCode, headers);
          response.end(JSON.stringify(storage));
        } else {
          statusCode = 404;
          response.writeHead(statusCode, headers);
          response.end();
        }
      }
      //No error, read the file and send it back
      var extension = path.extname(potentialFile);
      statusCode = 200;
      headers['Content-Type'] = "text/" + extension.slice(1);
      response.writeHead(statusCode, headers);
      response.end(data);
    });

  } 
  // See the note below about CORS headers.
  else if (request.method === "OPTIONS") {
    statusCode = 200;
    response.writeHead(statusCode, headers);
    response.end();
  }

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};
