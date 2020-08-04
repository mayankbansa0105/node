const express = require('express');
const router = express.Router();
const controller = require('../controller/controller');
// const { poolPromise } = require('../models/db')

router.get('/search', controller.search)
router.get('/searchorder',  controller.getAll);
router.get('/orders/:id', controller.getById);
router.put('/orders', controller.update);
router.get('/getIntegrationList', controller.intgrationNames);


// router.get('/searchorder', async (req, res) => {
//     try {
//         const pool = await poolPromise
//         let queryStr = 'select * from Tbl_Leadership_Admin_Productivity'

//         const result = await pool.request()
//             .query(queryStr, function (err, profileset) {
//                 if (err) {
//                     console.log(err)
//                 }
//                 else {
//                     var send_data = profileset.recordset;
//                     res.json(send_data);
//                 }
//             })
//     } catch (err) {
//         res.status(500)
//         res.send(err.message)
//     }
// });

// router.get('/orders/:id', async (req, res) => {
//     try {
//         let queryStr = 'select * from Tbl_Leadership_Admin_Productivity where ID = ' + req.params.id
//         const pool = await poolPromise
//         const result = await pool.request().query(queryStr, function (error, results) {
//             if (error) {
//                 console.log(err)
//             }
//             else {
//                 var send_data = results.recordset;
//                 res.json(send_data);
//             }
//         })

//     }
//     catch (err) {
//         res.status(500)
//         res.send(err.message)
//     }
// })

// router.put('/orders/', function (req, res) {

//     try {
//         let queryStr = 'select * from Tbl_Leadership_Admin_Productivity where ID = ' + req.params.id
//         const pool = await poolPromise
//         const result = await pool.request().query(queryStr, function (error, results) {
//             if (error) {
//                 console.log(err)
//             }
//             else {
//                 var send_data = results.recordset;
//                 res.json(send_data);
//             }
//         })

//     }
//     catch (err) {
//         res.status(500)
//         res.send(err.message)
//     }
// })

module.exports = router;