/**
 * User: puti.
 * Time: 2021/2/3 4:02 下午.
 */
module.exports = (req, res) => {
  res.json({
    body: req.body,
    query: req.query,
    cookies: req.cookies,
  })
}
