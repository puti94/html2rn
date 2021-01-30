/**
 * User: puti.
 * Time: 2021/1/29 1:55 下午.
 */
export default function exportFile(text,fileName) {
  const uri = new Blob([text], { type: 'text/javascript' })
  if (window.navigator && window.navigator.msSaveOrOpenBlob) { // for IE
    window.navigator.msSaveOrOpenBlob(text, fileName)
  } else { // for Non-IE（chrome、firefox etc.）
    const link = document.createElement('a')
    link.href = URL.createObjectURL(uri)
    
    link.style = 'visibility:hidden'
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
