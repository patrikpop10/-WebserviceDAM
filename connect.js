let obj ={

    connect(database){

        let mysql = require('mysql');
        let con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: database,
            multipleStatements: true
        });

        con.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
            
        });

    return con;
},


}
module.exports = obj;