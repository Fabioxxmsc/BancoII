# Ajustado o log para que as variáveis 
# sofressem todas as alterações das operações.
# Ajustado o UNDO onde não adicionava na lista
# as Tx que estavam no Checkpoint
# Implementado o REDO.

# Aluno: Fabio Antonio Ribeiro Dos Santos

import re;

variaveis = {}  
UNDO = []                       
REDO = []
UNDOcheck = []
REDOcheck = []
ListaTX = []

end = 0

arquivo = open('teste03', 'r')
arquivolist = list(arquivo)  
  
commit = re.compile(r'commit', re.IGNORECASE) 
start = re.compile(r'start', re.IGNORECASE)
startckpt = re.compile(r'start ckpt', re.IGNORECASE)
endckpt = re.compile(r'end ckpt', re.IGNORECASE)
extracT = re.compile(r'(?!commit\b)(?!CKPT\b)(?!Start\b)\b\w+', re.IGNORECASE) 
words = re.compile(r'\w+', re.IGNORECASE)  

# Carrega a linha de valores iniciais
valores = words.findall(arquivolist[0])

# Atribui os valores iniciais para as variavies
for i in range(0, len(valores), 2): 
    variaveis[valores[i]] = valores[i + 1]

print("\nValores iniciais: ", variaveis)
print("\nRodando operações do banco...")

# Simular as operações do banco até a falha
for linha in arquivolist:
    if start.search(linha) and (not startckpt.search(linha)):
        Tx = extracT.findall(linha)[0]
        ListaTX.append(Tx)

    elif words.findall(linha)[0] in ListaTX:
        variaveis[words.findall(linha)[1]] = words.findall(linha)[3]

    elif commit.search(linha):
        Tx = extracT.findall(linha)[0]
        if Tx in ListaTX:
            ListaTX.remove(Tx)

print("Falha!!!")
if len(ListaTX):
    print("\nTransações ", ListaTX, " não fechadas!")
print("\nValores após operações: ", variaveis)

print("\nIniciando recovery")
# Percorre o log em backward, montando a lista UNDO e REDO
# Vai subir até chegar no start do checkpoint
# Quando chegar vai avaliar as Tx do checkpoint
# Se não foram adicionadas no REDO serão adicionadas no UNDO
for linha in reversed(arquivolist): 
    if startckpt.search(linha):
        if end:
            Tx = extracT.findall(linha)
            # Quando chegar no start do checkpoint
            # Vai avaliar as Tx se add no UNDO ou REDO
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

print("\nAplicar UNDO:", UNDO)

# Percorre o log em backward aplicando o UNDO
# nas Tx da lista, até acabar a lista UNDO
for i in range(len(arquivolist) - 1, 0, -1): 
    linha = arquivolist[i]
    if start.search(linha) and (not startckpt.search(linha)):
        Tx = extracT.findall(linha)[0]

        if Tx in UNDO:
            UNDO.remove(Tx)
            UNDOcheck.append(Tx)
     
        if not len(UNDO):
            break

    # Aplicando UNDO, trocando os valores
    elif words.findall(linha)[0] in UNDO:
        variaveis[words.findall(linha)[1]] = words.findall(linha)[2]

print("\nAplicado UNDO:", UNDOcheck)
print("\nAplicar REDO:", REDO)

# Percorre o log em forward a partir do ponto
# de parada do UNDO, aplicando o REDO de acordo com a lista 
for j in range(i, len(arquivolist) - 1, 1):
    linha = arquivolist[j]

    if not len(REDO):
        break

    # Aplicando REDO, trocando os valores
    elif words.findall(linha)[0] in REDO:
        variaveis[words.findall(linha)[1]] = words.findall(linha)[3]

    elif commit.search(linha):
        Tx = extracT.findall(linha)[0]
        if Tx in REDO:
            REDOcheck.append(Tx)
            REDO.remove(Tx)

print("\nAplicado REDO:", REDOcheck)
print("\nRecovery finalizado!")
print("\nResultado:", variaveis)
arquivo.close()

