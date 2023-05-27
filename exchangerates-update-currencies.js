const fs = require('fs');
const axios = require('axios');
let mysql= require('mysql');
const DB_HOST=process.env.DB_HOST
const DB_NAME=process.env.DB_NAME
const DB_USER=process.env.DB_USER
const DB_PWD=process.env.DB_PWD
const APIKEY=process.env.APIKEY;
// set default to local host if not set
if (typeof DB_HOST === 'undefined'){
    console.log(Date.now(),"[Error] the environment variable DB_HOST is not set.");
    process.exit(1);
}
if (typeof DB_NAME === 'undefined'){
    console.log(Date.now(),"[Error] the environment variable DB_NAME is not set.");
    process.exit(1);
}
// DB_USER is mandatory
if (typeof DB_USER  === 'undefined'){
    console.log(Date.now(),"[Error] the environment variable DB_USER is not set.");
    process.exit(1);
}
// DB_PWD is mandatory
if (typeof DB_PWD === 'undefined'){
    console.log(Date.now(),"[Error] the environment variable DB_PWD is not set.");
    process.exit(1);
}

mainloop();
// main loop in async
async function mainloop(){
    let connection = mysql.createConnection({
        host     : DB_HOST,
        user     : DB_USER,
        password : DB_PWD,
        database : DB_NAME,
        multipleStatements : true
    });
    axios({
      url: 'http://api.exchangeratesapi.io/v1/symbols?access_key='+APIKEY,
      method: 'get',headers:{'Accept-Encoding': 'application/json'}}
      ).then(response=>{
        let symbols = response.data.symbols;
        //console.log(symbols);
        let currencies = Object.keys(symbols);
        //console.log(currencies);
        let names = Object.values(symbols);
        //console.log(names);
        let sqlquery="";
        for (i in currencies) {
            sqlquery=sqlquery+"insert into currencies set id='"+currencies[i]+"',name='"+names[i]+"';"            
        }
        //console.log(sqlquery);
        connection.query(
            {
                sql: sqlquery,
                values: []
            },
            function (error, results, fields) {
                if (error){
                    console.log("[Error]"+error);
                    throw error;
                }
                connection.end();
                process.exit(0)
                return;
            }
        );
      });
    
}