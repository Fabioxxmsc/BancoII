const csv = require('csv-parser')
const fs  = require('fs')

function GetCommandInsert(idBegin){

  if(idBegin == 0)
    idBegin++

  let array = []

  fs.createReadStream('data.csv')
    .pipe(csv(['Product Name']))
    .on('data', (row) => array.push('INSERT INTO PRODUCT (EID, DESCRIPTION) VALUES (' + idBegin + ', ' + row['Product Name'] + ')'))
    .on('end', () => { return array })
}

exports.GetCommand = GetCommandInsert;