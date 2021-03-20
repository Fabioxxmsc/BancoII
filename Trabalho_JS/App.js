// Referência https://node-postgres.com/features/connecting

var MyPool = require("./Pool.js");
var Util   = require("./Funcoes.js");

Util.Consulta(MyPool.getPool, 'SELECT * FROM PRODUCT P WHERE P.EID IN ($1, $2)', [1, 2])
Util.CausaErro(MyPool.getPool)
Util.Consulta(MyPool.getPool, 'SELECT * FROM PRODUCT P WHERE P.EID IN ($1, $2)', [3, 4])
Util.CausaErro(MyPool.getPool)
Util.Consulta(MyPool.getPool, 'SELECT * FROM PRODUCT P WHERE P.EID IN ($1, $2)', [5, 6])
Util.CausaErro(MyPool.getPool)
Util.Consulta(MyPool.getPool, 'SELECT * FROM PRODUCT', [])