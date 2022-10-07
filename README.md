# Auditoria independente 1 turno das eleições 2022

## Instalação de dependências 

Os scripts utilizam a linguagem Javascript, utilizando Node.JS para interpretação, e analise dos dados, para conferencia dos resultados execute os comandos abaixo para instalação das dependências do projeto  

```
npm install
```

## Coleta de dados

Como o TSE não possui uma API publica com os dados e os arquivo CSV disponíveis no portal não contem todos os dados necessário, a coleta foi feita por meio de Web Crawler direto no site https://resultados.tse.jus.br/ utilizando Puppeteer, aonde são coletados dos arquivos .BU, os dados em formato JSON ja processadores pelo próprio sistema do TSE e armazenado uma screenshot da página por meio do script "crawler.js"

```
node crawler.js
```

Este procedimento demora alguns dias já que são mais de 400mil urnas logo o sistema precisa baixa individualmente cada BU e os arquivos auxiliares.

## Sumarização 

Para simplificar a exportação dos dados os arquivos JSON importados pelo crawler são analisados e geram um arquivo de sumario no diretório /DataParsed esses arquivos contem a contabilização dos votos por numero do candidato e informações como sessão, zona, id da urna, código de barra, entre outros.

```
node leituraBU.js
```

### Relatório

Após a importação dos BUs e a sumarização e possível criar um relatório final em formato CSV contendo o resultado final de todas as urnas da eleição:

```
node relatorio.js
```