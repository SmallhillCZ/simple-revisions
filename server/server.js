var express = require("express");
var app = express();

var http = require("http");
var fs = require("fs");
var iconv = require('iconv-lite');

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

app.get("/revisions",(req,res,next) => res.donwload('data/revisions.json'));

app.get("/revisions/json",(req,res,next) => res.donwload('data/revisions.json'));

app.get("/revisions/csv",(req,res,next) => {
  fs.readFile('data/revisions.json', function read(err, data) {
    if (err) return next(err);
    data = JSON.parse(data);
    
    var output = [config.csv.header];
    
    data.forEach(comment => {
      output.push([comment.catI[0],comment.cat[0],comment.catI[1],comment.cat[1],comment.catI[2],comment.cat[2],comment.catI[3],comment.cat[3],comment.catI[4],comment.cat[4] + "...",comment.text]);
    });
    
    
    var csv = output.map(line => line.map(value => "\"" + (typeof value === "string" ? value.replace(/\r?\n/g," | ") : value) + "\"").join(config.csv.delimiter)).join(config.csv.newline);
    
    var buff = iconv.encode(csv, config.csv.encoding);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-disposition', 'attachment; filename=revisions.csv');
    res.setHeader('Content-Type', "text/csv;charset=utf-8");
    res.send(buff);
  });
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
      res.json(newRevisions);
    });
    
  });
  
});

/* SET UP SERVER */
let host = config.host || "127.0.0.1";
let port = config.port || 80;

http.createServer(app).listen(port, host, function () {
  console.log('Listening on ' + host + ':' + port + '!');
});