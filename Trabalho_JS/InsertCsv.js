const csv = require('csv-parser')
const fs = require('fs')

function GetCommandInsert(idBegin) {
  return new Promise((resolve, reject) => {
    if (idBegin == 0)
      idBegin++

    let array = []

    fs.createReadStream('data.csv')
      .pipe(csv(['Product Name']))
      .on('data', (row) => array.push(`INSERT INTO PRODUCT (EID, DESCRIPTION) VALUES (${idBegin++}, '${row['Product Name'].replace(/"|'/g, "")}');`))
      .on('error', () => { reject([]) })
      .on('end', () => { resolve(array.slice(1)) })
  })
}

exports.GetCommand = GetCommandInsert;