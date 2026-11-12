# DNA API - Documentação Completa

## Informacoes Gerais

**Projeto:** Documentacao-DNA-API
**Versao Atual:** 25.12.A
**Base URL:** http://dominio:porta/api/v1
**Linguagem:** Node.js / Express
**Dependencias Principais:** express, cookie-parser

## Acesso a Documentacao

O acesso a propria documentacao e feito pela pagina de login em /auth/login.html.
Todas as paginas exigem login; sem sessao valida o usuario e redirecionado para o login.

### Configuracao (variaveis de ambiente)

- LOGIN_USER: usuario de acesso (obrigatorio).
- LOGIN_PASS: senha de acesso (obrigatorio). Sem LOGIN_USER/LOGIN_PASS ninguem consegue entrar.
- SESSION_SECRET: opcional. Chave para assinar o cookie de sessao. Se nao for definida, e derivada da senha (trocar a senha encerra todas as sessoes).
- SESSION_HOURS: opcional. Duracao da sessao em horas (padrao 1).

Rodar localmente: `npm install` e depois `npm start` com as variaveis definidas.
Na Vercel: o vercel.json direciona todas as requisicoes para o servidor (server/server.js), entao nenhuma pagina e servida sem passar pelo login. Definir as variaveis em Settings > Environment Variables.

### Acesso Publico

- /auth/login.html, /auth/login.css, /auth/login.js (pagina de login)
- POST /login e POST /logout

---

## Versao da API

### Consultar Versao Atual

**GET** - BaseRoute/version

Retorna a versao atual da API em execucao.

Resposta esperada:
```
{
  "version": "1.0.0"
}
```

---

## Veiculo

### Dados do Veiculo com Multiplos Filtros

**GET** - BaseRoute/consulta/veiculo/?page=:Pagina&limit=:Quantidade&filtro1=:filtro1&filtro2=:filtro2

Filtros disponveis:
- placa: Placa do veiculo
- codprop: Codigo do proprietario
- modelo: Modelo do veiculo

Exemplos:
- Busca por Placa: BaseRoute/consulta/veiculo/?page=1&limit=10&plate=xxx 1234
- Busca por Proprietario e Modelo: BaseRoute/consulta/veiculo/?page=1&limit=10&codprop=10&model=gol

### Marca e Modelo por Descricao

**GET** - BaseRoute/consulta/veiculomodelo/?page=:Pagina&limit=:Quantidade&descricao=:descricao

Filtros disponveis:
- descricao: Descricao do modelo

---

## Clientes

### Cliente + Contatos

**GET** - BaseRoute/consulta/cliente/?page=:pagina&limit=:quantidade&filtro1=:filtro1&filtro2=:filtro2

Filtros disponveis:
- nome: Nome do cliente
- codigo: Codigo do cliente
- razaosoc: Razao social
- data_inicio e data_fim + tipo_data (ABERTURA ou ATUALIZACAO): Filtro por intervalo de datas
- tipo_cliente: F (Fisica) ou J (Juridica)
- sexo: M (Masculino) ou F (Feminino)
- email: E-mail do cliente
- bairro: Bairro
- cidade: Cidade
- uf: Estado (UF)
- idadeinicial e idadefinal: Faixa de idade
- inativo: S ou N

Observacao: Buscar com 'ltda' no nome trara todos os clientes PESSOA JURIDICA.

Exemplo: BaseRoute/consulta/cliente/?page=1&limit=10&nome=Joao&cidade=Sao Paulo

---

## Fornecedores

### Todos Fornecedores ou por Razao Social

**GET** - BaseRoute/consulta/fornecedor/?page=:pagina&limit=:quantidade&filtro1=:filtro1&filtro2=:filtro2

Filtros disponveis:
- cidade: Cidade do fornecedor
- razao: Razao social
- nome: Nome fantasia

Exemplo: BaseRoute/consulta/fornecedor/?page=1&limit=10&razao=Autopecas&cidade=Caxias

---

## Produtos

### Produtos com Multipla Filtragem

**GET** - BaseRoute/consulta/produto/?page=:pagina&limit=:quantidade&filtro1=:filtro1&filtro2=:filtro2

Filtros disponveis:
- descricao: Descricao do produto
- inativo: S ou N
- codalternativo: Codigo alternativo
- codigo: Codigo do produto
- codbarras: Codigo de barras
- ncm: Codigo NCM
- cest: Codigo CEST
- estoque: Quantidade em estoque
- cimportado: S ou N (Importado)
- tipo: "mao de obra" ou "peca"
- imposto: Descricao do imposto
- fornecedor: Razao social do fornecedor
- grupo: Descricao do grupo
- subgrupo: Descricao do subgrupo
- marca: Descricao da marca
- codnum: Codigo numerico

Exemplo: BaseRoute/consulta/produto/?page=1&limit=10&descricao=chicote

### Produtos Similares

**GET** - BaseRoute/consulta/similares/?page=:pagina&limit=:quantidade&codigo=:codigo_peca

Parametros:
- codigo: Codigo da peca para buscar similares

Exemplo: BaseRoute/consulta/similares/?page=1&limit=10&codigo=12345

---

## Ordem de Servico

### OS com Multiplos Filtros

**GET** - BaseRoute/consulta/os/capa/?page=:pagina&limit=:quantidade&filtro1=:filtro1&filtro2=:filtro2

Filtros disponveis:
- mecanico: Nome do mecanico
- placa: Placa do veiculo
- numos: Numero da OS
- situacao_inicio e situacao_fim + tipo_data (ABERTURA ou SITUACAO): Filtro por intervalo de datas
- situacao: Situacao da OS
- tipoos: Tipo da OS
- modelo: Modelo do veiculo
- tipo_cliente: F (Fisica) ou J (Juridica)
- proprietario: Nome do cliente
- dinamico: Parte do modelo e/ou placa

Exemplo: BaseRoute/consulta/os/capa/?page=1&limit=20&plate=XXX 1234&mechanic=Rogerio

### Cadastro de OS Completa (CAPA + ITENS)

**POST** - BaseRoute/cadastro/os/completa

Observacao: Esta rota é utilizada apenas para O.S feita do "zero". O body deve conter a `capa` (array com UM objeto) e o array `itens` (pode ser vazio). Capa, itens, estoque e totais sao gravados numa unica transacao.

Campos da capa:
- placa ou veiculo: OBRIGATORIO (um dos dois). `veiculo` e o codigo do veiculo e tem prioridade. Placa aceita com espaco, hifen ou sem separador.
- mecanico: opcional. Codigo ou nome do mecanico (ativo e habilitado para O.S).
- tipoos: opcional. Codigo ou descricao do tipo de O.S. Padrao: GERAL.
- situacao: opcional. No momento a API so cadastra O.S como "Orçamento" (valor assumido).
- demais campos da O.S (kms, assunto, problema_relatado, aexecutar, obs1...): opcionais.

Preenchidos pela API (nao enviar):
- codprop, proprietario e carro: sempre vem do cadastro do veiculo (proprietario atual e modelo). Se enviados, sao ignorados.
- codigo: proximo numero livre (mesma sequencia do sistema principal). Enviar gera erro.
- abertura, dtsituacao, hrsituacao: data/hora atual quando nao informados.
- totais da capa (valorpeca, valormo, valormost, descitens*, custoitens*): recalculados a partir dos itens.

Campos de cada item:
- descricao: OBRIGATORIO.
- quant: OBRIGATORIO, maior que zero.
- pecamo: OBRIGATORIO. A = peca, B = mao de obra.
- unidade: ex. PC. Mao de obra (B) usa MO ou ST; peca (A) nao pode usar MO nem ST.
- valunit: valor unitario.
- pecacod: codigo da peca/servico. Omitir ou 0 para item avulso.
- descval: desconto do item (opcional).
- nao enviar id, numos, item, dtestoque nem usuario (preenchidos pela API).

Exemplo de JSON:
```json
{
  "capa": [
    {
      "placa": "IKJ 3847",
      "mecanico": 1,
      "tipoos": 1
    }
  ],
  "itens": [
    {
      "pecacod": 100,
      "descricao": "FILTRO DE OLEO",
      "pecamo": "A",
      "unidade": "PC",
      "quant": 2,
      "valunit": 50.00
    },
    {
      "descricao": "TROCA DE OLEO",
      "pecamo": "B",
      "unidade": "MO",
      "quant": 1,
      "valunit": 80.00
    }
  ]
}
```

Exemplo minimo:
```json
{
  "capa": [ { "placa": "IKJ 3847" } ],
  "itens": []
}
```

### Alteracao de OS Completa (CAPA + ITENS)

**PUT** - BaseRoute/cadastro/os/completa/:codigo_da_OS

Parametros:
- :codigo_da_OS: Codigo da OS a ser alterada

Header opcional:
- X-Device-Id: identificador da sessao/dispositivo do app (checagem de concorrencia).

Campos da capa:
- alterou: true para gravar as alteracoes da capa. Sem ele, so os itens sao processados.
- dtHrInicio: opcional (ISO 8601). Momento em que o app abriu a O.S. Se outro usuario alterou depois, retorna 409.
- situacao: Em Execução, Orçamento, Aguardando Peça, Concluída ou Cancelada. Faturada nao e aceita (so pelo faturamento). Mudando a situacao sem dtsituacao, a data da situacao vira hoje; ao concluir, a data de entrega e preenchida se vazia.
- mecanico e tipoos: codigo ou descricao (mesmas regras do cadastro).
- veiculo, placa, codprop, proprietario e carro nao mudam depois de aberta a O.S (ignorados se enviados).

Itens (cada um com `acao`):
- "post": inclui item novo (mesmos campos do cadastro).
- "put": altera o item do `id` informado (enviar so o que mudou).
- "delete": exclui o item do `id` informado.
- itens sem `acao` sao ignorados.

Exemplo de JSON:
```json
{
  "capa": [
    {
      "alterou": true,
      "dtHrInicio": "2026-11-12T14:30:00",
      "mecanico": 2,
      "situacao": "Em Execução"
    }
  ],
  "itens": [
    { "acao": "put", "id": 1534, "quant": 3, "valunit": 55.00 },
    { "acao": "post", "descricao": "ALINHAMENTO", "pecamo": "B", "unidade": "ST", "quant": 1, "valunit": 120.00 },
    { "acao": "delete", "id": 1535 }
  ]
}
```

Erros:
- 400: O.S faturada, situacao invalida, item de outra O.S, mecanico/tipo invalidos, datas invalidas.
- 404: O.S nao encontrada.
- 406: O.S aberta em outro dispositivo.
- 409: O.S alterada por outro usuario depois do dtHrInicio.

---

## Itens de OS

### Itens de OS com Multiplos Filtros

**GET** - BaseRoute/consulta/os/itens/?page=:pagina&limit=:quantidade&filtro1=:filtro1&filtro2=:filtro2

Filtros disponveis:
- placa: Placa do veiculo
- codprop: Codigo do proprietario
- numos: Numero da OS
- descricao: Descricao do item
- situacao_inicio e situacao_fim + tipo_data (ABERTURA ou SITUACAO): Filtro por intervalo de datas
- tipoos: Tipo da OS
- situacao: Situacao da OS
- mecanico: Nome do mecanico
- fornecedor: Razao social do fornecedor
- pecamo: PECA ou MO (Mao de Obra)
- proprietario: Nome do proprietario
- codigopeca: Codigo da peca
- codalternativo: Codigo alternativo
- grupo: Descricao do grupo
- subgrupo: Descricao do subgrupo
- marca: Descricao da marca
- cimportado: S ou N (Importado)
- ncm: Codigo NCM
- cest: Codigo CEST
- codbarras: Codigo de barras
- cfop: Codigo CFOP
- monofasicos: Monofasicos
- garantias: F, E ou C

Exemplo: BaseRoute/consulta/os/itens/?page=1&limit=10&plate=xxx 1234&descricao=ratinho metal

---

## Venda de Balcao

Tela em construcao...

---

## Itens da Venda

Tela em construcao...

---

## CRM

### Consulta de CRM Capa

**GET** - BaseRoute/consulta/crm?page=:pagina&limit=:quantidade&filtro1=:filtro1&filtro2=:filtro2

Filtros disponveis:
- razao: Razao social do cliente
- fantasia: Nome fantasia do cliente

Exemplo: BaseRoute/consulta/crm?page=1&limit=10&razao=Empresa LTDA

### Consulta de CRM Itens

**GET** - BaseRoute/consulta/itemcrm?page=:pagina&limit=:quantidade&filtro1=:filtro1

Filtros disponveis:
- codigo_crm: Codigo do CRM

Exemplo: BaseRoute/consulta/itemcrm?page=1&limit=10&codigo_crm=123

---

## Notas Fiscais

### NFE - Nota Fiscal Eletronica

**GET** - BaseRoute/consulta/nfe/capa/?page=:pagina&limit=:quantidade

### NFSE - Nota Fiscal de Servico Eletronica

**GET** - BaseRoute/consulta/nfse/capa/?page=:pagina&limit=:quantidade

### NFCE - Nota Fiscal de Consumidor Eletronica

**GET** - BaseRoute/consulta/nfce/capa/?page=:pagina&limit=:quantidade

---

## APIs Terceiras

### Consulta de CNPJ

**GET** - BaseRoute/consulta/cnpj/:cnpj

Parametros:
- :cnpj: CNPJ a ser consultado

Observacao: Limite de 3 consultas por minuto.

Exemplo: BaseRoute/consulta/cnpj/12345678000199

### Consulta de CEP (Por CEP)

**GET** - BaseRoute/consulta/cep/:cep

Parametros:
- :cep: CEP a ser consultado

Exemplo: BaseRoute/consulta/cep/95020000

### Consulta de CEP (Sem CEP)

**POST** - BaseRoute/consulta/cep

Parametros do Body:
- tipologradouro: Tipo do logradouro (rua, avenida, etc.)
- logradouro: Nome do logradouro
- cidade: Nome da cidade
- uf: Estado (UF)
- bairro: Bairro (opcional)

Exemplo de Body JSON:
```json
{
  "tipologradouro": "rua",
  "logradouro": "julio",
  "cidade": "caxias",
  "uf": "rs",
  "bairro": "centro"
}
```

---

## IBGE

### Consulta de IBGE

**GET** - BaseRoute/consulta/ibge/?page=:pagina&limit=:quantidade&cidade=:cidade

Filtros disponveis:
- cidade: Nome da cidade
- ibge: Codigo IBGE (alternativo)

Exemplos:
- Busca por Cidade: BaseRoute/consulta/ibge/?page=1&limit=100&cidade=caxias
- Busca por Codigo IBGE: BaseRoute/consulta/ibge/?page=1&limit=100&ibge=4305108

Observacao: A consulta é feita no BANCO_PADRAO.FDB. Se tiver utilidade, é possvel pesquisar diretamente pelo codigo IBGE substituindo o parametro 'cidade' por 'ibge'.

---

## Galeria

### Cadastro de Arquivos

**POST** - BaseRoute/cadastro/galeria

Parametros do Body:
- nome_pasta: Nome da pasta
- id_pasta: ID do registro
- imagens: Array de imagens com extension e base64

Exemplo de Body JSON:
```json
{
  "nome_pasta": "veiculo",
  "id_pasta": "30",
  "imagens": [
    {
      "extension": "png",
      "base64": "base64 da foto1"
    },
    {
      "extension": "pdf",
      "base64": "base64 da foto2"
    }
  ]
}
```

### Consulta de Arquivos

**GET** - BaseRoute/consulta/galeria/:nome_pasta/:id_pasta

Parametros:
- :nome_pasta: Subpasta de Galeria que deseja entrar
- :id_pasta: Subpasta de nome_pasta

Exemplo: BaseRoute/consulta/galeria/veiculo/30

### Exclusao de Arquivos

**DELETE** - BaseRoute/consulta/galeria/?nome_pasta=:nome_pasta&id_pasta=:id_pasta&nome_arquivos=:nome_arquivos

Parametros:
- nome_pasta: Subpasta de Galeria que deseja entrar
- id_pasta: Subpasta de nome_pasta
- nome_arquivos: Nomes dos arquivos separados por virgula

Exemplo: BaseRoute/consulta/galeria/?nome_pasta=veiculo&id_pasta=30&nome_arquivos=arquivo1,arquivo2,arquivo3

Importante: NAO dar espaco entre as virgulas nos nomes dos arquivos.

---

## Update

### Verifica Requisicoes Recentes

**GET** - BaseRoute/usando

Descricao: Verifica se houveram requisicoes nos ultimos 60 segundos.

Resposta esperada:
```json
{
  "em_uso": true,
  "ultima_requisicao": "2024-01-15T10:30:00"
}
```

### Atualizar API

**GET** - BaseRoute/atualiza

Descricao: Executa o arquivo .bat para atualizar a API.

Observacao: É necessário ter o arquivo .bat configurado corretamente para que a atualizacao funcione.

---

## Firebase

CRUD completo para EMPRESA e USUARIO.

### Cadastro (Empresa ou Usuario)

**POST** - BaseRoute/cadastro/cloud/:tipo

Parametros:
- :tipo: "empresa" ou "usuario"

Body da requisicao EMPRESA:
```json
{
  "razaosoc": "RAZAO SOCIAL DA EMPRESA"
}
```

Body da requisicao USUARIO:
```json
{
  "nome": "NOME DO USUARIO",
  "cpf": "CPF DO USUARIO",
  "id_empresa": "ID_EMPRESA"
}
```

### Busca (Empresa ou Usuario)

**GET** - BaseRoute/cadastro/cloud/:tipo/:id

Parametros:
- :tipo: "empresa" ou "usuario"
- :id: ID_EMPRESA ou ID_USUARIO

Exemplo: BaseRoute/cadastro/cloud/empresa/abc123

### Remocao (Empresa ou Usuario)

**DELETE** - BaseRoute/cadastro/cloud/:tipo/:id

Parametros:
- :tipo: "empresa" ou "usuario"
- :id: ID_EMPRESA ou ID_USUARIO

Exemplo: BaseRoute/cadastro/cloud/usuario/xyz789

### Atualizacao (Empresa ou Usuario)

**PATCH** - BaseRoute/cadastro/cloud/:tipo

Parametros:
- :tipo: "empresa" ou "usuario"

Exemplo de Body (deve conter o ID do documento e os campos a editar):
```json
{
  "id": "abc123",
  "razaosoc": "NOVA RAZAO SOCIAL"
}
```

Observacao: O body da requisicao para AMBOS deve conter o ID do documento e os campos que deseja editar.

---

## CRUD Geral

### Alteracao de Registro (PUT)

**PUT** - BaseRoute/cadastro/:tabela/:id

Parametros:
- :tabela: Nome da tabela
- :id: ID do registro a ser alterado

Exemplo - Alterar Cliente:
- Rota: BaseRoute/cadastro/CLIENTE/1
- Body JSON:
```json
{
  "codigo": 2,
  "nome": "fulano das tantas",
  "cpf": "00000000000"
}
```

### Criacao de Registro (POST)

**POST** - BaseRoute/cadastro/:tabela

Parametros:
- :tabela: Nome da tabela

Exemplo - Criar Cliente:
- Rota: BaseRoute/cadastro/Cliente
- Body JSON:
```json
{
  "nome": "beltrano das quantas",
  "cpf": "11111111111",
  "rua": "av. do ping pong"
}
```

### Exclusao de Registro (DELETE)

**DELETE** - BaseRoute/cadastro/:tabela/:id

Parametros:
- :tabela: Nome da tabela
- :id: ID do registro a ser deletado

Observacao: Nao é necessário enviar nada no body da requisicao.

### Tabelas Disponveis para CRUD

- veiculo
- cilindrada
- marca
- veiculo_cambio
- modelo
- combustivel
- veiculo_motor
- veiculo_tracao
- veiculo_freio
- cor
- cliente
- cliente_contato
- licenca
- documento
- mecanico
- itos
- os
- genero
- familia
- similares
- usuario
- marcas
- agenda
- peca
- situacao
- tipoos
- crm_chamado
- crm_chamado_item
- patrimonial
- patrimonial_grupo
- patrimonial_marca

Importante:
- É necessário verificar no banco de dados quais campos são de preenchimento obrigatório
- Qualquer erro será retornado no response da API com os campos faltantes
- Os nomes dos campos para cadastro do CRUD são exatamente os mesmos do banco de dados

---

## Patrimonial

Tela em construcao...

---

## Observacoes Gerais

- Todas as rotas que retornam listas suportam paginacao com parametros 'page' e 'limit'
- A autenticacao utiliza cookies httpOnly por razoes de seguranca
- Variaveis de ambiente podem ser acessadas no cliente atraves de /env.js
- O servidor roda na porta 3000 por padrao, mas pode ser alterada atraves da variavel de ambiente PORT
- Expressoes dinamicas podem ser utilizadas em muitos filtros para buscas mais flexveis
