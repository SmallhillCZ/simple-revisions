var express = require("express");
var app = express();

var http = require("http");
var fs = require("fs");

var config = require("./config");

var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.get("/document",(req,res,next) => {
  res.sendFile("data/document.html", { root: __dirname + "/.." });
});

app.get("/style",(req,res,next) => {
  res.sendFile("data/style.css", { root: __dirname + "/.." });
});

app.get("/config",(req,res,next) => {
  res.sendFile("data/config.json", { root: __dirname + "/.." });
});

app.post("/revisions",(req,res,next) => {
  
  if(!req.body || !req.body.revisions || req.body.revisions.constructor !== Array) return next("Missing revisions to post");
  
  fs.readFile('data/revisions.json', "utf8", function read(err, data) {
    if (err) return next(err);
    
    var oldRevisions;
    
    try{
      oldRevisions = data ? JSON.parse(data) : [];
    }catch(e){
      return next(err);
    }
    var newRevisions = req.body.revisions.map(rev => {
      return {
        line: rev.line,
        text: rev.text,
        cat: rev.cat,
        catI: rev.catI,
        start: rev.start
      }
    });
    
    if(oldRevisions.constructor !== Array || newRevisions.constructor !== Array) return next(new Error("Revisions not an array"));
  
    var revisions = oldRevisions.concat(newRevisions);
    
    var revisionsString = JSON.stringify(revisions);

    fs.writeFile('./data/revisions.json', revisionsString, (err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
    
  });
  
});

/* SET UP SERVER */
let host = config.host || "127.0.0.1";
let port = config.port || 80;

http.createServer(app).listen(port, host, function () {
  console.log('Listening on ' + host + ':' + port + '!');
});