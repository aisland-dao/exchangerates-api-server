// Exchange Rates Api Server
let express = require('express');
let mysql = require('mysql');
const DB_HOST = process.env.DB_HOST
const DB_NAME = process.env.DB_NAME
const DB_USER = process.env.DB_USER
const DB_PWD = process.env.DB_PWD
// set default to local host if not set
if (typeof DB_HOST === 'undefined') {
    console.log(Date.now(), "[Error] the environment variable DB_HOST is not set.");
    process.exit(1);
}
if (typeof DB_NAME === 'undefined') {
    console.log(Date.now(), "[Error] the environment variable DB_NAME is not set.");
    process.exit(1);
}
// DB_USER is mandatory
if (typeof DB_USER === 'undefined') {
    console.log(Date.now(), "[Error] the environment variable DB_USER is not set.");
    process.exit(1);
}
// DB_PWD is mandatory
if (typeof DB_PWD === 'undefined') {
    console.log(Date.now(), "[Error] the environment variable DB_PWD is not set.");
    process.exit(1);
}
let app = express();
console.log("Exchange Rates Api Server ver. 1.00");
console.log("Listening on port tcp/3000 ....");
mainloop();
//main function body
async function mainloop(){
    let connection = mysql.createConnection({
        host     : DB_HOST,
        user     : DB_USER,
        password : DB_PWD,
        database : DB_NAME,
        multipleStatements : true
    });
    // compatibile with ratesexchanges.eu
    // returns the available currencies
    app.get('/client/currencies', async function (req, res) {
        let sqlquery="select id as symbol,name as description from currencies order by id asc";
        connection.query(
            {
                sql: sqlquery,
                values: []
            },
            function (error, results, fields) {
                if (error) {

                    throw error;
                }
                let answer = JSON.stringify(results);
                res.send(answer)
            }
        )
    });
    // compatibile with ratesexchanges.eu
    // returns the latest exchange rates
    app.get('/client/latest', async function (req, res) {
        let refcurrency=req.query.base_currency;
        let currencies=req.query.currencies;
        if( typeof refcurrency === 'undefined' || typeof currencies=='undefined'){
            res.send('{"code":"0100","messsage":"parameters not received"}');
            return;
        }
        let sqlquery="select * from exchangerates where currency=? or currency=?";
        connection.query(
            {
                sql: sqlquery,
                values: [refcurrency,currencies]
            },
            function (error, results, fields) {
                if (error) {
                    throw error;
                }
                let c1=results[0].exchangerate;
                let c2=results[1].exchangerate;
                if(typeof c1==='undefined')
                    c1=1;
                if(typeof c2==='undefined')
                    c2=1;
                let er=0;
                if(results[0]['currency']==refcurrency)
                    er=1/c1*c2;
                else
                    er=1/c2*c1;
                er= er.toFixed(2);
                let dt=results[0].dtupdate.getFullYear()+'-'+("0" + (results[0].dtupdate.getMonth() + 1)).slice(-2)+'-'+("0" + results[0].dtupdate.getDate()).slice(-2);;
                let answer='{"base":"'+refcurrency+'","date":"'+dt+'"';
                answer=answer+',"rates":{"'+currencies+'":'+er+'}}';
                res.send(answer)
            }
        )
    
    
    });
    //app.use(express.static('html'));
    let server = app.listen(3000, function () { });

}