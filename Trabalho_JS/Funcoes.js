const moment = require("moment");

function InsertImplicito(pool){

}

function InsertExplicito(pool){

}

function CausaErro(pool){
  Consulta(pool, 'SELECT * FROM ERRO', []);
}

function Consulta(pool, sql, param){
  (async () => {
    const begin  = moment(new Date())
    const client = await pool.connect()
    const idT    = Math.floor(Math.random() * 100 + 1) + '_' + begin.millisecond();

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

  }) ().catch(e => console.error(e.stack))
}

exports.InsertImplicito = InsertImplicito;
exports.InsertExplicito = InsertExplicito;
exports.CausaErro       = CausaErro;
exports.Consulta        = Consulta;