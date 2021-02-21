/**
 * User: puti.
 * Time: 2021/2/21 11:00 上午.
 */

const request = require('request')
module.exports = async (req, res) => {
  const url = 'https://lanhu.oss-cn-beijing.aliyuncs.com/SketchPng60979add04c29b9a6c6ef368e09990f058e5b71d60130e9a85d7e0698bd22e93';
  const options = {
    url: url,
    encoding: null
  };
  
  function callback(error, response, body) {
    if (!error && response.statusCode === 200) {
      const contentType = response.headers['content-type'];
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end(body);
    }
  }
  
  request.get(options, callback);
}

