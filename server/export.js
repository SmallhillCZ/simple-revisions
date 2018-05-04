var fs = require("fs");
var config = require("./config");
var iconv = require('iconv-lite');

fs.readFile('data/revisions.json', function read(err, data) {
  if (err) return next(err);
  data = JSON.parse(data);

  var output = [config.csv.header];

  data.forEach(comment => {
    output.push([comment.catI[0],comment.cat[0],comment.catI[1],comment.cat[1],comment.catI[2],comment.cat[2],comment.catI[3],comment.cat[3],comment.catI[4],comment.cat[4] + "...",comment.text]);
  });


  var csv = output.map(line => line.map(value => "\"" + (typeof value === "string" ? value.replace(/\r?\n/g," | ") : value) + "\"").join(config.csv.delimiter)).join(config.csv.newline);

  var buff = iconv.encode(csv, config.csv.encoding);
  
  fs.writeFile('data/revisions.csv', buff, (err) => {
    if (err) throw err;
    console.log('Revisions have been saved!');
    process.exit();
  });
});