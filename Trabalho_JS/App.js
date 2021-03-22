// Referência https://node-postgres.com/features/connecting

var MyPool  = require("./Pool.js")
var Util    = require("./Funcoes.js")
var Command = require("./InsertCsv.js")
let select  = `SELECT * FROM PRODUCT P WHERE P.EID IN ($1, $2) ORDER BY P.EID`

async function Init(){
  //Util.Delete(MyPool.getPool)                                                              // Delete tabela produto com id >= 25
  //Util.Consulta(MyPool.getPool, select, [1, 2])                                            // Consulta filtrada
  //Util.CausaErro(MyPool.getPool)                                                           // Update em transação read only, causando erro de dando rollback na transação  
  //Util.InsertBlock(MyPool.getPool, await Command.GetCommand(25))                           // Insert em bloco anonimo
  //Util.InsertExplicito(MyPool.getPool, await Command.GetCommand(10028))                    // Insert Explicito
  //Util.InsertImplicito(MyPool.getPool, await Command.GetCommand(20031))                    // Insert Implicito
  //Util.Consulta(MyPool.getPool, 'SELECT * FROM PRODUCT P ORDER BY P.EID', [])              // Consulta sem filtro  
}

Init()