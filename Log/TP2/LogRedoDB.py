import re
import psycopg2
from psycopg2 import Error
import os

arquivo     = open('teste_final', 'r') # teste_final or novo
arquivolist = list(arquivo)

SQL         = "DO $$ BEGIN "
SQL_INS     = ""
columns     = []
variaveis   = {}  
UNDO        = []                       
REDO        = []
REDOIDX     = []
UNDOcheck   = []
REDOcheck   = []
ListaTX     = []
end         = 0

commit      = re.compile(r'commit', re.IGNORECASE) 
start       = re.compile(r'start', re.IGNORECASE)
startckpt   = re.compile(r'start ckpt', re.IGNORECASE)
endckpt     = re.compile(r'end ckpt', re.IGNORECASE)
extracT     = re.compile(r'(?!commit\b)(?!CKPT\b)(?!Start\b)\b\w+', re.IGNORECASE) 
words       = re.compile(r'\w+', re.IGNORECASE)  

valores = words.findall(arquivolist[0])
SQL     += "DROP TABLE IF EXISTS LOGTESTE; "
SQL     += "CREATE TABLE LOGTESTE(ID INTEGER"
SQL_INS =  "INSERT INTO LOGTESTE (ID"
SQL_VAL =  "(1"
limpar  =  "cls" if os.name == "nt" else "clear"

for i in range(0, len(valores), 2):
    variaveis[valores[i]] = valores[i + 1]
    SQL     += ", " + valores[i] + " INTEGER"
    SQL_INS += ", " + valores[i]
    SQL_VAL += ", " + valores[i + 1]

del valores

SQL +=  "); " + SQL_INS + ") VALUES " + SQL_VAL
SQL += "); END $$;"

try:    
    connection = psycopg2.connect(user="postgres", password="postgre", host="127.0.0.1", port="5432", database="postgres")
    cursor     = connection.cursor()

    os.system(limpar)
    print("\nMontando cenário base de dados...\n")
    print("SQL: " + SQL + "\n\n")
    cursor.execute("BEGIN;")
    cursor.execute(SQL)

    cursor.execute("SELECT * FROM LOGTESTE;")

    field_names = [i[0] for i in cursor.description]
    field_names.remove(field_names[0])

    print("Dados:")
    print(field_names)

    for record in cursor:
        for column in range(1, len(record)):
            columns.append(record[column])
        print(columns)

    print("\nCenário Montado...\n")

    print("Iniciando recovery")
    # Percorre o log em backward, montando a lista UNDO(Ignoradas) e REDO
    # Vai subir até chegar no start do checkpoint
    # Quando chegar vai avaliar as Tx do checkpoint
    # Se não foram adicionadas no REDO serão adicionadas no UNDO(Ignoradas)
    for linha in reversed(arquivolist): 
        if startckpt.search(linha):
            if end:
                Tx = extracT.findall(linha)
                # Quando chegar no start do checkpoint
                # Vai avaliar as Tx se add no UNDO(Ignoradas) ou REDO
                for Ax in Tx:
                    if Ax not in REDO:
                        UNDO.append(Ax)

                print("\nStart Checkpoint Txc", Tx)           
                break

        elif commit.search(linha):
            Tx = extracT.findall(linha)[0]
            REDO.append(Tx)

        elif start.search(linha):   
            Tx = extracT.findall(linha)[0]
            if Tx not in REDO:
                UNDO.append(Tx)

        elif endckpt.search(linha):
            print("\nEnd Checkpoint")
            end = 1

    print("\nIgnora:", UNDO)
    print("\nAplicar REDO:", REDO)

    # Percorre o log em backward aplicando o UNDO(Ignoradas)
    # nas Tx da lista, até acabar a lista UNDO(Ignoradas)
    for i in range(len(arquivolist) - 1, 0, -1): 
        linha = arquivolist[i]
        if start.search(linha) and (not startckpt.search(linha)):
            Tx = extracT.findall(linha)[0]

            if Tx in UNDO:
                UNDO.remove(Tx)
                UNDOcheck.append(Tx)
        
            if not len(UNDO):
                break

    REDOIDX = REDO.copy() # Posicionar o índice a partir do start das transações de Redo
    for i in range(len(arquivolist) - 1, 0, -1): 
        if not len(REDOIDX):
            break

        linha = arquivolist[i]

        if start.search(linha) and (not startckpt.search(linha)):
            Tx = extracT.findall(linha)[0]

            if Tx in REDOIDX:
                REDOIDX.remove(Tx)


    # Percorre o log em forward a partir do ponto
    # de parada do UNDO(Ignoradas), aplicando o REDO de acordo com a lista 
    SQL = "DO $$ BEGIN "
    for j in range(i, len(arquivolist) - 1, 1):
        linha = arquivolist[j]

        if not len(REDO):
            break

        # Aplicando REDO, trocando os valores        
        elif words.findall(linha)[0] in REDO:
            SQL += "UPDATE LOGTESTE SET " + words.findall(linha)[2] + " = " + words.findall(linha)[3] + " WHERE ID = " + words.findall(linha)[1] + "; "
            variaveis[words.findall(linha)[2]] = words.findall(linha)[3]

        elif commit.search(linha):
            Tx = extracT.findall(linha)[0]
            if Tx in REDO:
                REDOcheck.append(Tx)
                REDO.remove(Tx)

    SQL += "END $$;"
    cursor.execute(SQL)

    cursor.execute("SELECT * FROM LOGTESTE;")

    field_names = [i[0] for i in cursor.description]
    field_names.remove(field_names[0])

    print("\nDados após recovery:")
    print(field_names)

    columns.clear()
    for record in cursor:
        for column in range(1, len(record)):
            columns.append(record[column])
        print(columns)

    cursor.execute("COMMIT;")
    print("\nAplicado REDO:", REDOcheck)
    print("\nRecovery finalizado!")

except (Exception, Error) as error:
    cursor.execute("ROLLBACK;")
    print("Error: ", error, "\n")
finally:
    arquivo.close()
    if (connection):
        cursor.close()
        connection.close()
        print("PostgreSQL connection is closed")