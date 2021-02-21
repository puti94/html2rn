/**
 * User: puti.
 * Time: 2021/2/3 4:02 下午.
 */
import axios from 'axios'
import FileSave from 'file-saver'

const JSZip = require('jszip');

export default async function downloadZip({images = [], html = '', name = 'index'}) {
  try {
    const zip = new JSZip();
    const fold = zip.folder(name)
    const imagesFold = fold.folder('images')
    fold.file('index.js', html)
    const imageBlobs = await Promise.all(images.map(t => getFile(t.path)))
    imageBlobs.forEach((t, i) => imagesFold.file(`${images[i].name}.png`, t))
    const content = await zip.generateAsync({type: 'blob'})
    FileSave.saveAs(content, `${name}.zip`)
  } catch (e) {
    console.log('错误', e)
  }
}
const getFile = url => {
  return new Promise((resolve, reject) => {
    let obj = {
      method: 'get',
      url,
      responseType: 'blob'
    }
    axios(obj)
        .then(data => {
          resolve(data.data)
        })
        .catch(error => {
          reject(error.toString())
        })
  })
}
