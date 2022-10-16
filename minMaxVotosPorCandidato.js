import * as fs from "fs";
import fg from "fast-glob";
import * as cliProgress from "cli-progress";
const municipios = JSON.parse(fs.readFileSync("municipios.json", "utf8"));

(async () => {
    const files = await fg("./DataParsed/**/*json");

    let countBULula = 0;
    let countBUBolsonaro = 0;
    let maxVotosLula = 0;
    let maxVotosBolsonaro = 0;
    let urnasSemVotosLula = 0;
    let urnasSemVotosBolsonaro = 0;
    let mediaEleitoresAptos = 0;
    let totalUrnas = 0;
    let urnasComVotosAcimaDaMedia = {};

    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar1.start(files.length, 0);

    let reportCSVheader = "MUN,ZONA,SECAO,ESTADO,MUNICIPIO,LOCAL,URNA,SERIEFC,DHCARGA,CODCARGA,DHABERTURA,DHENCERRAMENTO,ELAPTOS,ELCOMPARECIMENTO,LULA,BOLSONARO\n";

    fs.appendFileSync(`./relatorio-lula-urnas-acima-250votos.csv`, `${reportCSVheader}\n`);
    fs.appendFileSync(`./relatorio-bolsonaro-urnas-acima-250votos.csv`, `${reportCSVheader}\n`);
    fs.appendFileSync(`./relatorio-lula-urnas-semvoto.csv`, `${reportCSVheader}\n`);
    fs.appendFileSync(`./relatorio-bolsonaro-urnas-semvoto.csv`, `${reportCSVheader}\n`);
    fs.appendFileSync(`./relatorio-urnas-aptos-acima-media.csv`, `${reportCSVheader}\n`);

    for(let fileBU of files){
        bar1.increment();  
        const buData = JSON.parse(fs.readFileSync(fileBU, "utf8"));

        const id = `${buData.municipio}-${buData.zona}-${buData.secao}`;
        const municipio = municipios[id];
        
        let votosLula = 0;
        let votosBolsonaro = 0;

        if(!isNaN(parseInt(buData.votos["13"]?.quantidadeVotos)))
            votosLula = parseInt(buData.votos["13"]?.quantidadeVotos);

        if(!isNaN(parseInt(buData.votos["22"]?.quantidadeVotos)))
            votosBolsonaro = parseInt(buData.votos["22"]?.quantidadeVotos);

        if(votosLula > maxVotosLula)
            maxVotosLula = votosLula;
        if(votosBolsonaro > maxVotosBolsonaro)
            maxVotosBolsonaro = votosBolsonaro;

        const reportCSVObject = [
            buData.municipio, buData.zona, buData.secao, 
            municipio?.estadoSingla, municipio?.municipio, 
            buData.local, buData.numeroInternoUrna, buData.numeroSerieFC, 
            buData.dataHoraCarga, buData.codigoCarga, buData.dataHoraAbertura, 
            buData.dataHoraEncerramento, buData.qtdEleitoresAptos, buData.qtdComparecimento, 
            buData.votos["13"]?.quantidadeVotos, buData.votos["22"]?.quantidadeVotos
        ];

        mediaEleitoresAptos += parseInt(buData.qtdEleitoresAptos);
        totalUrnas++;

        let newLine = reportCSVObject.join(",").replace(/\r/img, "").replace(/\n/img, "");

        if(parseInt(buData.qtdEleitoresAptos) > 400 && municipio?.estadoSingla){
            fs.appendFileSync(`./relatorio-urnas-aptos-acima-media.csv`, `${newLine}\n`);

            if(!urnasComVotosAcimaDaMedia[municipio?.estadoSingla])
                urnasComVotosAcimaDaMedia[municipio?.estadoSingla] = 0;

            urnasComVotosAcimaDaMedia[municipio?.estadoSingla]++;
        }

        if(votosLula >= 250){
            countBULula++;
            fs.appendFileSync(`./relatorio-lula-urnas-acima-250votos.csv`, `${newLine}\n`);
        }
        else if(votosLula === 0){
            urnasSemVotosLula++;
            fs.appendFileSync(`./relatorio-lula-urnas-semvoto.csv`, `${newLine}\n`);
        }

        if(votosBolsonaro >= 250){
            countBUBolsonaro++;
            fs.appendFileSync(`./relatorio-bolsonaro-urnas-acima-250votos.csv`, `${newLine}\n`);
        } 
        else if(votosBolsonaro === 0){
            urnasSemVotosBolsonaro++;
            fs.appendFileSync(`./relatorio-bolsonaro-urnas-semvoto.csv`, `${newLine}\n`);
        }
    }
    
    fs.writeFileSync(`minMaxVotosPorCanditado.json`, JSON.stringify({
        maxVotosLula,
        maxVotosBolsonaro,
        countBULula,
        countBUBolsonaro,
        urnasSemVotosLula,
        urnasSemVotosBolsonaro,
        mediaEleitoresAptosPorUrna: (mediaEleitoresAptos / totalUrnas),
        urnasComVotosAcimaDaMedia
    }, null, 4));

    process.exit(1);
})();