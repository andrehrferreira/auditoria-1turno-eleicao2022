/**
 * Cruzamento de dados do IBGE e BUs 1 turno
 * 
 * @autor Andre Ferreira <andrehrf@gmail.com>
 * @see https://servicodados.ibge.gov.br/api/docs/agregados?versao=3#api-bq
 * @see https://resultados.tse.jus.br/oficial/app/index.html
 * @see https://dadosabertos.tse.jus.br/dataset/
 */

import * as fs from "fs";
import fg from "fast-glob";
import * as cliProgress from "cli-progress";
const municipios = JSON.parse(fs.readFileSync("municipios.json", "utf8"));
const municipiosIBGE = JSON.parse(fs.readFileSync("IBGEDataParsed.json", "utf8"));
const municipiosIBGECenso = JSON.parse(fs.readFileSync("IBGEDataParsedCenso.json", "utf8"));
const margemCortePorIdade = JSON.parse(fs.readFileSync("margemCortePorIdade.json", "utf8"));

(async () => {
    const files = await fg("./DataParsed/**/*json");
    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar1.start(files.length, 0);

    let votos = {};

    fs.appendFileSync("municipiosInvalidos.csv", `MUNICIPIO,ESTADO,POPULACAOESTIMADA,TOTALCOMPARECIMENTOS,VOTOSLULA,VOTOSBOLSONARO\n`);
    fs.appendFileSync("municipiosInvalidosCenso.csv", `MUNICIPIO,ESTADO,POPULACAOESTIMADA,TOTALCOMPARECIMENTOS,VOTOSLULA,VOTOSBOLSONARO\n`);
    fs.appendFileSync("municipiosInvalidosCorteIdade.csv", `MUNICIPIO,ESTADO,POPULACAOESTIMADA,MARGEMDECORTE,POPULACAOAPTA,TOTALCOMPARECIMENTOS,VOTOSLULA,VOTOSBOLSONARO\n`);
    fs.appendFileSync("municipiosValidos.csv", `MUNICIPIO,ESTADO,POPULACAOESTIMADA,TOTALCOMPARECIMENTOS,VOTOSLULA,VOTOSBOLSONARO\n`);
    fs.appendFileSync("municipiosValidosCenso.csv", `MUNICIPIO,ESTADO,POPULACAOESTIMADA,TOTALCOMPARECIMENTOS,VOTOSLULA,VOTOSBOLSONARO\n`);
    fs.appendFileSync("municipiosValidosCorteIdade.csv", `MUNICIPIO,ESTADO,POPULACAOESTIMADA,MARGEMDECORTE,POPULACAOAPTA,TOTALCOMPARECIMENTOS,VOTOSLULA,VOTOSBOLSONARO\n`);
  
    for(let fileBU of files){
        bar1.increment();  
        const buData = JSON.parse(fs.readFileSync(fileBU, "utf8"));
        const id = `${buData.municipio}-${buData.zona}`;
        const municipio = municipios[id];

        if(municipio){
            if(!votos[`${municipio?.municipio} - ${municipio?.estadoSingla}`])
                votos[`${municipio?.municipio} - ${municipio?.estadoSingla}`] = { bolsonaro: 0, lula: 0, totalComparecimentos: 0 };

            if(!isNaN(parseInt(buData.votos["22"]?.quantidadeVotos)))
                votos[`${municipio?.municipio} - ${municipio?.estadoSingla}`].bolsonaro += parseInt(buData.votos["22"]?.quantidadeVotos);

            if(!isNaN(parseInt(buData.votos["13"]?.quantidadeVotos)))
                votos[`${municipio?.municipio} - ${municipio?.estadoSingla}`].lula += parseInt(buData.votos["13"]?.quantidadeVotos);
            
            if(!isNaN(parseInt(buData.qtdComparecimento)))
                votos[`${municipio?.municipio} - ${municipio?.estadoSingla}`].totalComparecimentos += parseInt(buData.qtdComparecimento);
        }
        else{
            console.log(`Municipio ${id} não encontrado`);
        }
    }

    fs.writeFileSync("votosPorMunicipio.json", JSON.stringify(votos, null, 4));

    for(let key in votos){
        const municipioIBGE = municipiosIBGE[key];
        let [municipio, estadoSingla] = key.split(" - ");

        const municipioIBGECenso = municipiosIBGECenso[key];
        let [municipioCenso, estadoSinglaCenso] = key.split(" - ");
        
        try {
            //Dados estimados de 2021
            if(municipioIBGE){
                if(municipioIBGE.populacaoEstimada <= votos[key].totalComparecimentos)
                    fs.appendFileSync("municipiosInvalidos.csv", `${municipio},${estadoSingla},${municipioIBGE.populacaoEstimada},${votos[key].totalComparecimentos},${votos[key].lula},${votos[key].bolsonaro}\n`);
                else
                    fs.appendFileSync("municipiosValidos.csv", `${municipio},${estadoSingla},${municipioIBGE.populacaoEstimada},${votos[key].totalComparecimentos},${votos[key].lula},${votos[key].bolsonaro}\n`);
            }
            else{
                fs.appendFileSync("municipiosSemIBGE.txt", `${municipio} - ${estadoSingla}\n`);
            }

            //Dados do censo 2007
            if(municipioIBGECenso){
                if(municipioIBGECenso.populacaoEstimada <= votos[key].totalComparecimentos)
                    fs.appendFileSync("municipiosInvalidosCenso.csv", `${municipioCenso},${estadoSinglaCenso},${municipioIBGECenso.populacaoEstimada},${votos[key].totalComparecimentos},${votos[key].lula},${votos[key].bolsonaro}\n`);
                else
                    fs.appendFileSync("municipiosValidosCenso.csv", `${municipioCenso},${estadoSinglaCenso},${municipioIBGECenso.populacaoEstimada},${votos[key].totalComparecimentos},${votos[key].lula},${votos[key].bolsonaro}\n`);
            }
            else{
                fs.appendFileSync("municipiosSemIBGECenso.txt", `${municipioCenso} - ${estadoSinglaCenso}\n`);
            }

            //Dados de 2021 com corte por idade
            if(municipioIBGE){
                const margemDeCorte = margemCortePorIdade[estadoSingla];
                let populacao = municipioIBGECenso.populacaoEstimada;

                if(margemDeCorte > 0){
                    populacao = populacao - (populacao * (margemDeCorte / 100));
                    populacao = parseInt(populacao.toFixed(0));

                    if(municipioIBGECenso.populacaoEstimada <= votos[key].totalComparecimentos)
                        fs.appendFileSync("municipiosInvalidosCorteIdade.csv", `${municipio},${estadoSingla},${municipioIBGECenso.populacaoEstimada},${margemDeCorte},${populacao},${votos[key].totalComparecimentos},${votos[key].lula},${votos[key].bolsonaro}\n`);
                    else
                        fs.appendFileSync("municipiosValidosCorteIdade.csv", `${municipio},${estadoSingla},${municipioIBGECenso.populacaoEstimada},${margemDeCorte},${populacao},${votos[key].totalComparecimentos},${votos[key].lula},${votos[key].bolsonaro}\n`);
                }
            }
        }
        catch(e){} 
    }
    
    process.exit(1);
})();