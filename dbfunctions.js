let db = require('./connect.js');
db = db.connect("projetodam");
let dateformat = require("dateformat");
let moment = require("moment");
const { query } = require('express');

let getUserData = (req, res) =>{
       /*
         Create a promise to read the data that is being fetch asynchronously
         */
        
         let promise = new Promise((resolve, reject) =>{
 
            let query = `SELECT * FROM user WHERE EMAIL= "${req.params.email}"`;
            
            db.query(query ,function (err, result, fields) {
                
                if (err) return reject(err);
                resolve(result)
               
            })
        })
      
        promise.then(rows =>{
            /*
            send the data to the page 
            */
            res.send(rows);
          
           
        }).catch(err => setImmediate(()=>{throw err}))
}


let checkUserData = (req, res) =>{
         /*
        Create a promise to read the data that is being fetch asynchronously
        */
       
        let promise = new Promise((resolve, reject) =>{

            let query = `SELECT * FROM user WHERE EMAIL= "${req.params.email}" and palavra_passe = "${req.params.password}"`;
            
            db.query(query ,function (err, result, fields) {
                
                if (err) return reject(err);
                resolve(result)
               
            })
        })
      
        
        promise.then(rows =>{
            /*
            send the data to the page 
            */
           
            if(Object.keys(rows).length === 0){
                res.send([false]);
            }else{
                res.send([true,rows[0].EMAIL, rows[0].NOME]);
            }
        
            
           
        }).catch(err => setImmediate(()=>{throw err}))
}


let getLocation = (req, res) =>{
       /*
         Create a promise to read the data that is being fetch asynchronously
         */
 
         let promise = new Promise((resolve, reject) =>{
          
             let query = `SELECT * FROM localizacao where ID_LOCATION = ${req.params.id}`;
             db.query(query ,function (err, result, fields) {
     
                 if (err) return reject(err);
                 resolve(result)
             })
         })
         
         
    
    
         promise.then(rows =>{
             
             /*
             send the data to the page 
             */
             res.send(rows);
             
         }).catch(err => setImmediate(()=>{throw err}))

}



let getAllLocations = (req, res) =>{

         /*
         Create a promise to read the data that is being fetch asynchronously
         */
 
         let promise = new Promise((resolve, reject) =>{
          
             let query = `SELECT DISTRITO FROM localizacao`;
             db.query(query ,function (err, result, fields) {
     
                 if (err) return reject(err);
                 resolve(result)
             })
         })
         
    
    
        promise.then(rows =>{
             
             /*
             send the data to the page 
             */
            newRows = [];
            for(var i = 0; i< rows.length; i++){
                newRows.push(rows[i].DISTRITO)
             }
             
            res.send(newRows);
            
     
            }).catch(err => setImmediate(()=>{throw err}))
}


let register = (req, res) =>{
    let registered = true;
    
  

    let promise = new Promise((resolve, reject)=>{

        let query = `SELECT email FROM user where email = "${req.body.email}" `;
        db.query(query, (err, result, fields) =>{
                    
            if (err) return reject(err);
            resolve(result)

        });

    });

    promise.then( (rows) =>{

        if(Object.keys(rows).length === 0){
               
            registered = !registered;
            doRegisterUser(req, res);

        }
        else{
            res.send([false]);
            console.log("account already exists");
        }   
    }).catch(err => setImmediate(()=>{throw err}));

    

}

let doRegisterUser = (req, res) =>{

    let promise = new Promise((resolve, reject)=>{
        
        let date = moment(req.body.dataDeNascimento, "DD/MM/YYYY").toDate();
        req.body.dataDeNascimento = dateformat(date, "isoDate");

    

        let query = `Insert into user (email, nome, palavra_passe, local, data_de_nascimento) 
        values( "${req.body.email}" , "${req.body.name}" , "${req.body.password}", "${req.body.distrito}", "${req.body.dataDeNascimento}")`;
        db.query(query, (err, result, fields) =>{
                
            if (err) return reject(err);
            resolve(result);

        });

    });
    promise.then(rows =>{ 

        res.send([true, req.body.email, req.body.name]);
    
    }).catch(err => setImmediate(()=>{throw err}));
    

}

let getElections = (req, res)=>{

    let promise = new Promise((resolve, reject) =>{

            let query = `SELECT Local FROM user WHERE EMAIL = "${req.body.email}"`;
            
            db.query(query ,function (err, result, fields) {
                
                if (err) return reject(err);
                resolve(result)
               
            });

    });

    promise.then(rows =>{ 
        
       let local = rows[0].Local;
       getPossibleElections(local, req.body.email, res);
    
    }).catch(err => setImmediate(()=>{throw err}));


}


let getPossibleElections = (local, email, res)=>{

    let promise = new Promise((resolve, reject) =>{
        let day = new Date();
        let today = moment(day, "DD-MM-YYYY").toDate();
        today = dateformat(today, "isoDate");


            let query = `SELECT DISTINCT el.ID 
            FROM eleicao el 
            LEFT OUTER JOIN voto vo 
                ON el.id = vo.ELEICAO 
            LEFT OUTER JOIN user us 
                ON vo.EMAIL = us.EMAIL 
            WHERE (el.ID_LOCATION = "${local}" OR el.ID_LOCATION = "Nacional") 
                and el.DATA_INICIO < "${today}" and el.DATA_FIM > "${today}" 
                and EL.ID not in (SELECT DISTINCT EL.ID 
                                  FROM ELEICAO el 
                                  LEFT JOIN voto v 
                                    ON el.id = v.ELEICAO 
                                  where v.EMAIL like "${email}" 
                                  UNION 
                                  SELECT DISTINCT EL.ID 
                                  FROM ELEICAO el 
                                  RIGHT JOIN voto v 
                                    ON el.id = v.ELEICAO 
                                  where v.EMAIL like "${email}") 
                or vo.EMAIL is null`;
            
       
        
        db.query(query ,function (err, result, fields) {
            
            if (err) return reject(err);
            resolve(result)
           
        });
 

        });

        promise.then(rows =>{ 
        console.log(rows);
        selectCandidates(rows, res);

       // res.send(rows);


    }).catch(err => setImmediate(()=>{throw err}));
}

let selectCandidates = (rows, res) =>{
    
    
     let promise = new Promise((resolve, reject) =>{
        
        let idList = []

         let q = `SELECT * FROM candidato_eleicao ce, candidato c
        WHERE ce.ID_CANDIDATO = c.ID_CANDIDATO and ce.ID_ELEICAO = ?;`
        
        let finalQuerry = "";
        
        

        for(let i = 0; i < rows.length; i++){
        
            finalQuerry += q;
            idList.push(rows[i].ID);
        
        }
        

        db.query(finalQuerry, idList ,function (err, result, fields) {
            if (err) return reject(err);
            resolve(result);
           
        });
    });

        
        promise.then(rows =>{ 
            console.log(rows);
            res.send(rows);

    }).catch(err => setImmediate(()=>{res.send([0])}));

}



let getPastElections = (req, res)=>{
    let promise = new Promise((resolve, reject) =>{

        let query = `SELECT Local FROM user WHERE EMAIL = "${req.body.email}"`;
        
        db.query(query ,function (err, result, fields) {
            
            if (err) return reject(err);
            resolve(result)
           
        });

});

    promise.then(rows =>{ 
    
        let local = rows[0].Local;
        getPossiblePast(local, req.body.email, res);

    }).catch(err => setImmediate(()=>{throw err}));

}

let getPossiblePast = (local, email, res) =>{

    
    let promise = new Promise((resolve, reject) =>{
        let day = new Date();
        let today = moment(day, "DD-MM-YYYY").toDate();
        today = dateformat(today, "isoDate");

    
         let query = `SELECT DISTINCT el.ID
                      FROM eleicao el 
                        LEFT OUTER JOIN voto vo 
                            ON el.id = vo.ELEICAO 
                        LEFT OUTER JOIN user us 
                            ON vo.EMAIL = us.EMAIL
                     WHERE (el.ID_LOCATION = "${local}" OR el.ID_LOCATION = "Nacional") 
                        and el.DATA_FIM < "${today}"
                        `;
        console.log(query);
        db.query(query ,function (err, result, fields) {
            
            if (err) return reject(err);
            resolve(result)
           
        });
 

        });

        promise.then(rows =>{ 
        console.log(rows);
        selectCandidates(rows, res);

       // res.send(rows);


    }).catch(err => setImmediate(()=>{throw err}));
}



let getElectionData = (req, res)=>{

    let idList = req.body;
    
     let promise = new Promise((resolve, reject) =>{

         let q = `SELECT * FROM eleicao e
        WHERE e.ID = ?;`
        let finalQuerry = "";
        
        

        for(let i = 0; i < req.body.length; i++){
        
            finalQuerry += q;
            
        
        }
        
        

        db.query(finalQuerry, idList ,function (err, result, fields) {
            if (err) return reject(err);
            resolve(result);
           
        });
    });

        
        promise.then(rows =>{ 
            console.log(rows);
            res.send(rows);

    }).catch(err => setImmediate(()=>{throw err}));
    

   
}

let castVote = (req, res) =>{
    

    let promise = new Promise((resolve, reject)=>{

        let Insertquery = `INSERT INTO voto(eleicao, ID_CANDIDATO, EMAIL) values(${req.body.election}, ${req.body.vote}, "${req.body.email}");`;
        let candidateVotesQuery = `UPDATE candidato_eleicao 
                               SET NUMERO_VOTOS = (SELECT COUNT(*) 
                                                  FROM VOTO 
                                                  WHERE ID_CANDIDATO = ${req.body.vote} and eleicao = ${req.body.election}) 
                                WHERE ID_CANDIDATO = ${req.body.vote} and ID_ELEICAO = ${req.body.election};`;
        let finalQuerry = Insertquery + candidateVotesQuery;

       db.query(finalQuerry, (err, result, fields)=>{
        if (err) return reject(err);
        resolve(result);

       });
    });
    promise.then(rows =>{ 
       res.send([1]);

    }).catch(err => setImmediate(()=>{throw err}));
    
    
}

let updateVotes = (req,res)=>{
    let promise = new Promise((resolve, reject)=>{

        
        let candidateVotesQuery = `UPDATE candidato_eleicao 
                                        SET NUMERO_VOTOS = (SELECT COUNT(*) 
                                                  FROM VOTO 
                                                  WHERE ID_CANDIDATO = ${req.body.vote} and eleicao = ${req.body.election}) 
                                WHERE ID_CANDIDATO = ${req.body.vote} and ID_ELEICAO = ${req.body.election};`;
        
        

       db.query(candidateVotesQuery, (err, result, fields)=>{
        if (err) return reject(err);
        resolve(result);

       });
    });
    promise.then(rows =>{ 
    

    }).catch(err => setImmediate(()=>{throw err}));
}

let updateWinner = () =>{

    let promise = new Promise((resolve, reject)=>{

        let day = new Date();
        let today = moment(day, "DD-MM-YYYY").toDate();
        today = dateformat(today, "isoDate");
        
        let updateTotalVotes = `UPDATE eleicao SET NUMERO_DE_VOTOS = (SELECT COUNT(*) from voto v where v.eleicao = eleicao.id );`;
        let updateWinner = `UPDATE eleicao
        SET VENCEDOR =(SELECT ID_CANDIDATO FROM VOTO v where v.ELEICAO = eleicao.ID having count(*) ORDER BY COUNT(*) DESC LIMIT 1)
        WHERE data_fim < "${today}"`;
        
        let finalQuerry = updateTotalVotes + updateWinner; 
        console.log(finalQuerry);

       db.query(finalQuerry, (err, result, fields)=>{
        if (err) return reject(err);
        resolve(result);

       });
    });
    promise.then(rows =>{ 
        

    }).catch(err => setImmediate(()=>{throw err}));


}
let getPastElectionData = (req, res)=>{
   

    let promise = new Promise((resolve, reject)=>{

     
        
        let q = `SElECT ce.ID_CANDIDATO, ce.NUMERO_VOTOS, c.NOME, c.PARTIDO
        FROM candidato_eleicao ce, candidato c
        where ce.ID_CANDIDATO = c.ID_CANDIDATO and ce.ID_ELEICAO = ${req.body.id}
        ORDER BY NUMERO_VOTOS DESC`;
        
       

       db.query(q, (err, result, fields)=>{
        if (err) return reject(err);
        resolve(result);

       });
    });
    promise.then(rows =>{ 
        res.send(rows);

    }).catch(err => setImmediate(()=>{throw err}));
}


let getElectionVotesByArea =(req, res)=>{

   

    let promise = new Promise((resolve, reject)=>{

     
         let query = `SELECT v.eleicao, c.NOME, u.Local, count(*) as NumberOfVotesPerLocal
         FROM voto v, user u, candidato c
         where v.email = u.EMAIL and v.eleicao = ${req.body.id} and c.ID_CANDIDATO = v.ID_CANDIDATO
         GROUP BY LOCAL, v.ID_CANDIDATO`;
        
       db.query(query, (err, result, fields)=>{
        if (err) return reject(err);
        resolve(result);

       });
    });
    promise.then(rows =>{ 
        res.send(rows);

    }).catch(err => setImmediate(()=>{throw err}));

}







exports.getUserData = getUserData;
exports.checkUserData = checkUserData;
exports.getLocation = getLocation;
exports.getAllLocations = getAllLocations;
exports.register = register;
exports.getElections = getElections;
exports.getPastElections = getPastElections;
exports.getElectionData = getElectionData;
exports.castVote = castVote;
exports.updateWinner = updateWinner;
exports.getPastElectionData = getPastElectionData;
exports.getElectionVotesByArea = getElectionVotesByArea;
exports.updateVotes = updateVotes;