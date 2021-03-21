/*UNIVERSIDADE FEDERAL DA FRONTEIRA SUL
Banco de Dados II
Bárbara e Fabio
21/03/2020*/

let conn;

(async () => {
  /* Conectar no banco */
  connect();

  /* Iniciar o processo com tratamento de erro */
  try {

    await insertCorreto(); 
    console.log("Registro inserido. Commit executado.");
    await insertComErro(); 
    console.log("Registro inserido. Commit executado.");
    
  } catch(error){
    console.log("Houve um erro na transação. Rollback executado.")
  }
    
})();

/* Função para conectar no banco de dados */
function connect() {
  let { Client } = require('pg');
  conn = new Client({
    host    : "localhost",
    database: "bd2",
    user    : "postgres",
    password: "postgres",
    port    : 5432
  });
  conn.connect();
}

/* Função para inserir os dados corretamente */
async function insertCorreto() {
  console.log("Inserindo registro...");
  let { rows } = await conn.query(
    `insert into product (eid, description) values (1, 'Rivotril'), (2, 'Fluoxetina') returning *`
  );
}

/* Função para inserir os dados com o mesmo eid e forçar o erro */
async function insertComErro() {
  console.log("Inserindo registro...");
  let { rows } = await conn.query(
    `insert into product (eid, description) values (3, 'Carbolitium'), (3, 'Figatil') returning *`
  );
}