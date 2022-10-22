/**
 * Parseamento de dados do IBGE
 * 
 * @autor Andre Ferreira <andrehrf@gmail.com>
 * @see https://servicodados.ibge.gov.br/api/docs/agregados?versao=3#api-bq
 * @see https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/2021/variaveis/9324?localidades=N6[all]
 * @see https://servicodados.ibge.gov.br/api/v3/agregados/793/periodos/2007/variaveis/93?localidades=N6[all]
 */

 import * as fs from "fs";
 const municipiosIBGE = JSON.parse(fs.readFileSync("IBGEPopulacaoEstimadoPorMunicipio.json", "utf8"));
 const municipiosIBGECenso = JSON.parse(fs.readFileSync("IBGEPopulacaoCenso2007PorMunicipio.json", "utf8"));
 
 (async () => {
     let IBGEData = {}
 
     //Indexando dados do IBGE
     for(let item of municipiosIBGE[0].resultados[0].series){
         IBGEData[item.localidade.nome.toUpperCase()] = {
             id: item.localidade.id,
             nome: item.localidade.nome,
             populacaoEstimada: parseInt(item.serie["2021"]),
         }
     }
 
     fs.writeFileSync("IBGEDataParsed.json", JSON.stringify(IBGEData, null, 4));

     //Censo 2007
     let IBGEDataCenso = {}
 
     //Indexando dados do IBGE
     for(let item of municipiosIBGECenso[0].resultados[0].series){
        IBGEDataCenso[item.localidade.nome.toUpperCase()] = {
             id: item.localidade.id,
             nome: item.localidade.nome,
             populacaoEstimada: parseInt(item.serie["2007"]),
         }
     }
 
     fs.writeFileSync("IBGEDataParsedCenso.json", JSON.stringify(IBGEDataCenso, null, 4));
 })();