const moment = require('moment');

function InsertImplicito(pool, sql){
  (async () => {
    const begin  = moment(new Date())
    const client = await pool.connect()
    const idT    = Math.floor(Math.random() * 100 + 1) + '_' + begin.millisecond();

    try {
      for (let command of sql)
        res = await client.query(command)

      const end  = moment(new Date())
      const diff = moment.duration(end.diff(begin)).asSeconds()

      console.log('T' + idT + ' Duration ' + diff + ' second(s)\n')

    } catch (e) {
      throw e
    } finally {
      client.release()
    }

  }) ().catch(e => console.error(e.stack))
}

function InsertExplicito(pool, sql){
  (async () => {
    const begin  = moment(new Date())
    const client = await pool.connect()
    const idT    = Math.floor(Math.random() * 100 + 1) + '_' + begin.millisecond();
    let param    = []

    try {
      let res = await client.query('BEGIN')
      console.log('\n' + res.command + ' T' + idT + '\n')

      for (let command of sql)
        res = await client.query(command)

      res = await client.query('COMMIT')
      console.log('\n' + res.command + ' T' + idT + '\n')

      const end  = moment(new Date())
      const diff = moment.duration(end.diff(begin)).asSeconds()

      console.log('T' + idT + ' Duration ' + diff + ' second(s)\n')

    } catch (e) {

      res = await client.query('ROLLBACK')
      console.log('\n', res.command, ' T', idT, '\nQuery: ', sql, '\nParam: ', param, '\n')

      throw e
    } finally {
      client.release()
    }

  }) ().catch(e => console.error(e.stack))
}

function CausaErro(pool){
  Consulta(pool, 'UPDATE PRODUCT SET DESCRIPTION = NULL WHERE EID = $1', [10]);
}

function Consulta(pool, sql, param, readOnly = true){
  (async () => {
    const begin  = moment(new Date())
    const client = await pool.connect()
    const idT    = Math.floor(Math.random() * 100 + 1) + '_' + begin.millisecond();
    let begincmd = readOnly ? 'BEGIN READ ONLY' : 'BEGIN';

    try {
      let res = await client.query(begincmd)
      console.log('\n' + res.command + ' T' + idT + '\n')      

      res = await client.query(sql, param)
      console.log('\nQuery T' + idT + ': ' + sql + '\nParam: ' + param + '\nRow Count: ' + res.rowCount + '\n')
      for(const row of res.rows)
        console.log(row)

      res = await client.query('COMMIT')
      console.log('\n' + res.command + ' T' + idT + '\n')

      const end  = moment(new Date())
      const diff = moment.duration(end.diff(begin)).asSeconds()

      console.log('T' + idT + ' Duration ' + diff + ' second(s)\n')

    } catch (e) {

      res = await client.query('ROLLBACK')
      console.log('\n' + res.command + ' T' + idT + '\nQuery: ' + sql + '\nParam: ' + param + '\n')

      throw e
    } finally {
      client.release()
    }

  }) ().catch(e => console.error(e.stack))
}

function DeleteProduct(pool){
  (async () => {
    const begin  = moment(new Date())
    const client = await pool.connect()
    const idT    = Math.floor(Math.random() * 100 + 1) + '_' + begin.millisecond()
    let sql      = 'DELETE FROM PRODUCT P WHERE P.EID >= 25'
    let param    = []

    try {
      let res = await client.query('BEGIN')
      console.log('\n' + res.command + ' T' + idT + '\n')      

      res = await client.query(sql, param)
      console.log('\nQuery T' + idT + ': ' + sql + '\nParam: ' + param + '\nRow Count: ' + res.rowCount + '\n')
      for(const row of res.rows)
        console.log(row)

      res = await client.query('COMMIT')
      console.log('\n' + res.command + ' T' + idT + '\n')

      const end  = moment(new Date())
      const diff = moment.duration(end.diff(begin)).asSeconds()

      console.log('T' + idT + ' Duration ' + diff + ' second(s)\n')

    } catch (e) {

      res = await client.query('ROLLBACK')
      console.log('\n' + res.command + ' T' + idT + '\nQuery: ' + sql + '\nParam: ' + param + '\n')

      throw e
    } finally {
      client.release()
    }

  })().catch(e => console.error(e.stack))
}

exports.InsertImplicito = InsertImplicito;
exports.InsertExplicito = InsertExplicito;
exports.CausaErro       = CausaErro;
exports.Consulta        = Consulta;
exports.Delete          = DeleteProduct;