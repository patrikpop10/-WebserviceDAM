/**
 * Required variables to run the API 
 */
let express = require("express");
let app = express();
let dbFunctions = require("./dbfunctions.js");
let bodyParser = require('body-parser');

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
      extended: true
}));
app.use(bodyParser.json());



/*
ROUTERS:
*/
let userData = `/getUserData/:email`;
app.get(userData, (req, res)=>{
        
   dbFunctions.getUserData(req, res);
});


let checkUserData = `/checkUserData/:email/:password`;
app.get(checkUserData, (req, res)=>{

    dbFunctions.checkUserData(req, res);      
});
     

let getLocation = '/getLocation/:id';
app.get(getLocation, (req, res)=>{

    dbFunctions.getLocation(req, res);
});


let getAllLocations = '/getAllLocations';
app.get(getAllLocations, (req, res)=>{

    dbFunctions.getAllLocations(req, res);
});


app.post("/register", (req, res)=>{
      
   dbFunctions.register(req, res);   
});


let getElections = "/getElections";
app.post(getElections, (req, res)=>{

    dbFunctions.getElections(req,res);

} );


let getPastElections = "/getPastElections";
app.post(getPastElections, (req, res) =>{

    dbFunctions.getPastElections(req,res);

});



let getElectionData ="/getElectionData";
app.post(getElectionData, (req, res)=>{
    
    dbFunctions.getElectionData(req, res);
})

let castVote = "/castVote";
app.post(castVote, (req, res)=>{
    dbFunctions.castVote(req, res);

    //see if works
    dbFunctions.updateVotes(req, res);
});

let getPastElectionData = "/getElectionResults";

app.post(getPastElectionData, (req, res)=>{

    dbFunctions.getPastElectionData(req,res);
} );


//update every hour;
dbFunctions.updateWinner();


let = getElectionVotesByArea ="/getElectionVotesByArea";
app.post(getElectionVotesByArea, (req,res) =>{
    dbFunctions.getElectionVotesByArea(req,res);
})



 /*
 * create a server at the port 8080
 */
  let server = app.listen(8080,() =>{
 
      let host = server.address().address;
      let port = server.address().port;

      console.log("Rest API demo listening at http://%s:%s", host, port);
 
  });