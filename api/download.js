/**
 * User: puti.
 * Time: 2021/2/3 4:02 下午.
 */
const fs = require('fs')
const path = require('path')
const uuid = require('uuid/v4')
const request = require('request');
const JSZip = require('jszip');
module.exports = async (req, res) => {
  const {images = [], html = '', name = 'index'} = req.body
  const rootPath = path.resolve(__dirname, uuid());
  const filePath = path.resolve(rootPath, name)
  const imagePath = path.resolve(filePath, 'images')
  fs.mkdirSync(rootPath);
  fs.mkdirSync(filePath);
  fs.mkdirSync(imagePath);
  const indexPath = path.resolve(filePath, 'index.js');
  fs.writeFileSync(indexPath, html);
  const imagePaths = await Promise.all(images.map(t => downloadFile(t.path, path.resolve(imagePath, `${t.name}.png`))))
  const zip = new JSZip();
  const fold = zip.folder(name)
  const imagesFold = fold.folder('images')
  fold.file(indexPath)
  imagePaths.forEach(t => imagesFold.file(t))
  const content = await zip.generateAsync({type: 'uint8array'})
  const zipPath = path.resolve(rootPath, `${name}.zip`);
  fs.writeFileSync(zipPath, content)
  res.set({
    "Content-Type": "application/octet-stream",//告诉浏览器这是一个二进制文件
    "Content-Disposition": "attachment; filename=1.txt"//告诉浏览器这是一个需要下载的文件
  });
  fs.createReadStream(zipPath).pipe(res);
}

function downloadFile(imgPath, filepath) {
  return new Promise((resolve, reject) => {
    let fileDownloadPath = filepath;
    let exist = fs.existsSync(fileDownloadPath);
    if (!exist) {
      let writeStream = fs.createWriteStream(fileDownloadPath);
      let readStream = request(imgPath);
      readStream.pipe(writeStream);
      readStream.on('end', function () {
        readStream.end();
      });
      readStream.on('error', function (error) {
        writeStream.end();
        fs.unlinkSync(fileDownloadPath);
        readStream.end();
        reject(error)
      })
      writeStream.on("finish", function () {
        readStream.end();
        writeStream.end();
        resolve();
      })
          .on('error', function (err) {
            readStream.end();
            writeStream.end();
            reject(err);
          });
    } else {
      resolve(filepath)
    }
  });
}
