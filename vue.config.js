/**
 * User: puti.
 * Time: 2020-03-02 17:28.
 */

module.exports = {
  devServer: {
    proxy: {
      '/api/proxy': {
        target: 'https://html2rn.vercel.app/',
        ws: true,
        changeOrigin: true
      }
    }
  }
};
