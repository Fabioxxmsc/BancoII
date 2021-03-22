// Referência https://node-postgres.com/features/connecting

var MyPool  = require("./Pool.js")
var Util    = require("./Funcoes.js")
var Command = require("./InsertCsv.js")

async function Init(){
  //Util.Consulta(MyPool.getPool, 'SELECT * FROM PRODUCT P WHERE P.EID IN ($1, $2)', [1, 2])
  //Util.CausaErro(MyPool.getPool)
  //Util.InsertExplicito(MyPool.getPool, Command.GetCommand(26))
  Util.Delete(MyPool.getPool)  
  //Util.InsertExplicito(MyPool.getPool, await Command.GetCommand(25))
}

Init()