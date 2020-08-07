const { poolPromise } = require('../models/db');
exports.search = (req,res)=>{
   res.json({'message':' working fine now!'});
}
exports.intgrationNames = async(req,res)=>{
  try {
    const pool = await poolPromise
    let queryStr = 'SELECT * FROM CEH.INTEGRATION_LISTS B'

    const result = await pool.request()
      .query(queryStr, function (err, profileset) {
        if (err) {
          console.log(err)
        }
        else {
          var send_data = profileset.recordset;
          res.json(send_data);
        }
      })
  } catch (err) {
    res.status(500)
    res.send(err.message)
  }
}
exports.getAll = async (req, res) => {
  try {
    const pool = await poolPromise
    let queryStr = 'select * from Tbl_Leadership_Admin_Productivity'
                  //  'SELECT * FROM CEH.INTEGRATION_SUMMARY_V'
    const result = await pool.request()
      .query(queryStr, function (err, profileset) {
        if (err) {
          console.log(err)
        }
        else {
          var send_data = profileset.recordset;
          res.json(send_data);
        }
      })
  } catch (err) {
    res.status(500)
    res.send(err.message)
  }
}

exports.getById = async (req, res) => {
  try {
    // SELECT * FROM CEH.INTEGRATION_DTLS_V
    let queryStr = 'select * from Tbl_Leadership_Admin_Productivity where ID = ' + req.params.id
    const pool = await poolPromise;
    const result = await pool.request().query(queryStr, function (error, results) {
      if (error) {
        console.log(err)
      }
      else {
        var send_data = results.recordset;
        res.json(send_data);
      }
    })

  }
  catch (err) {
    res.status(500)
    res.send(err.message)
  }
}

exports.update = async (req, res) => {
  try {
    let queryStr = 'update Tbl_Leadership_Admin_Productivity set MLO = 500,MLP =50 where ID = 22'
    const pool = await poolPromise;
    const result = await pool.request().query(queryStr, function (error, results) {
      if (error) {
        console.log(error)
      }
      else {
        var send_data = results.recordset;
        res.json(send_data);
      }
    })

  }
  catch (err) {
    res.status(500)
    res.send(err.message)
  }
}

