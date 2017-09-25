// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var ObjectId = require('mongodb').ObjectID;

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
//app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
var MongoClient = require("mongodb").MongoClient;
var mongodbUrl = "mongodb://louis719:deathbrand@ds133211.mlab.com:33211/freecodecamp_pratice";

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/:shortUrl", function(request, response, next){
  var url = request.params.shortUrl
  console.log( "url :" + url )
  try {
    var mongoDbId = ObjectId(url)
  } catch (err) {
    response.end( "invalid shorten url: " + url )
  }
  
  MongoClient.connect(mongodbUrl, function (err, db){
      console.log("connect ok")
      if( err ){
        console.log('Unable to connect to the mongoDB server. Error:', err);
        response.end( "Connect to db fail" );
        next()
      }
      else{
        db.collection('shortUrl').findOne( {"_id":mongoDbId}, function(err, document ){
            console.dir(document)
            if( document ){
              console.log("find shorten Url... redirect to " + document.originUrl)
              response.writeHead( 302, {Location: document.originUrl} )
              response.end()
            }
            else{
              next()
            }
        })
      }
  })
})

app.get("/shortenUrl", function (request, response) {
  var url = request.query.url    
  var returnObj = {}
  returnObj.original_url = url
  
  MongoClient.connect(mongodbUrl, function (err, db) {        
    var urlExist = false
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
      response.end( "Connect to db fail" );
      return
    } 
    else {
      db.collection('shortUrl').findOne( { "originUrl": url }, function(err, document){
        if( document ){
          console.dir( document );
          returnObj.shorten_url = document._id
          console.log( JSON.stringify(returnObj) )
          response.end( JSON.stringify(returnObj) )
          db.close();
        }
        else{
            db.collection("shortUrl").insert( { originUrl: url }, function(err, result){
              if( err ){
                console.error( err );
              }
              else{
                console.dir(result)
                returnObj.shorten_url = result.insertedIds[0]
                response.end( JSON.stringify(returnObj) )
              }
              db.close();
            } );
        }
      } );
    }          
    
  });
  
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});