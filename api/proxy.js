/**
 * User: puti.
 * Time: 2021/2/21 11:00 上午.
 */

const https = require('https')
module.exports = async (req, res) => {
  const request = https.request({
    host: "lanhu.oss-cn-beijing.aliyuncs.com",
    port: "443",
    path: '/SketchPng60979add04c29b9a6c6ef368e09990f058e5b71d60130e9a85d7e0698bd22e93',
    method: req.method,
    // headers: {}
  })
  res.pipe(request)
}

