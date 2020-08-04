const sql = require('mssql');
const configData = require('../config/config')
const config = {
    user: configData.USERNAME,
    password: configData.PASSWORD,
    database: configData.DATABASE,
    server: configData.SERVER,
    port: configData.PORT,
    "options": {
        "enableArithAbort": true
    },
}
let poolPromise;
// const poolPromise = new sql.ConnectionPool(config).connect()
//     .then(pool => {
//         console.log('Connected to MSSQL')
//         return pool
//     })
//     .catch(err => console.log('Database Connection Failed! Bad Config: ', err))

    module.exports = {
    sql, poolPromise
} 