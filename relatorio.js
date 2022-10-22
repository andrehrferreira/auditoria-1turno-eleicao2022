import * as fs from "fs";
import fg from "fast-glob";
import * as cliProgress from "cli-progress";
const municipios = JSON.parse(fs.readFileSync("municipios.json", "utf8"));

(async () => {
    const files = await fg("./DataParsed/**/*json");
    let reportCSV = "";
    let reportCSVVotoEmTransito = ""
    let reportJSON = {};
    let reportJSONVotoEmTransito = {};
    let summayTotal = {
        urnas: 0,
        votos: {
            "BOLSONARO": 0,
            "LULA": 0,
            "OUTROS": 0,
            "NULOS": 0,
        }
    };

    reportCSV += "MUN,ZONA,SECAO,ESTADO,MUNICIPIO,LOCAL,URNA,SERIEFC,DHCARGA,CODCARGA,DHABERTURA,DHENCERRAMENTO,ELAPTOS,ELCOMPARECIMENTO,LULA,BOLSONARO,OUTROS,NULO,TOTAL,VENCEDOR,DIFFVENCEDOR,DIFFTRANSITO,VOTOSEMTRANSITO\n";
    reportCSVVotoEmTransito += "MUN,ZONA,SECAO,ESTADO,MUNICIPIO,LOCAL,URNA,SERIEFC,DHCARGA,CODCARGA,DHABERTURA,DHENCERRAMENTO,ELAPTOS,ELCOMPARECIMENTO,LULA,BOLSONARO,OUTROS,NULO,TOTAL,VENCEDOR,DIFFVENCEDOR,DIFFTRANSITO,VOTOSEMTRANSITO\n";

    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar1.start(files.length, 0);

    for(let fileBU of files){
        bar1.increment();  
        const buData = JSON.parse(fs.readFileSync(fileBU, "utf8"));
        const id = `${buData.municipio}-${buData.zona}`;
        const municipio = municipios[id];

        let votosOutros = 0;
        let votosNulos = 0;
        summayTotal.urnas++;

        for(let key in buData.votos){
            if(key !== "13" && key !== "22" && key !== "nulo")
                votosOutros += parseInt(buData.votos[key].quantidadeVotos);
            else if(key === "nulo")
                votosNulos = parseInt(buData.votos[key].quantidadeVotos);
        }

        if(!isNaN(parseInt(buData.votos["13"]?.quantidadeVotos)))
        summayTotal.votos["LULA"] += parseInt(buData.votos["13"]?.quantidadeVotos);

        if(!isNaN(parseInt(buData.votos["22"]?.quantidadeVotos)))
            summayTotal.votos["BOLSONARO"] += parseInt(buData.votos["22"]?.quantidadeVotos);

        summayTotal.votos["NULOS"] += votosNulos;
        summayTotal.votos["OUTROS"] += votosOutros;

        const total = parseInt(buData.qtdComparecimentoPresidente);

        let vencedor = parseInt(buData.votos["13"]?.quantidadeVotos) > parseInt(buData.votos["22"]?.quantidadeVotos) ? "LULA" : "BOLSONARO";

        if(buData.votos["13"]?.quantidadeVotos === buData.votos["22"]?.quantidadeVotos)
            vencedor = "EMPATE";

        const diffTransito = parseInt(buData.qtdEleitoresAptosPresidente) > parseInt(buData.qtdEleitoresAptos);
        let diffVencedor = 0;

        if(parseInt(buData.votos["13"]?.quantidadeVotos) > parseInt(buData.votos["22"]?.quantidadeVotos))
            diffVencedor = parseInt(buData.votos["13"]?.quantidadeVotos) - parseInt(buData.votos["22"]?.quantidadeVotos);
        else
            diffVencedor = parseInt(buData.votos["22"]?.quantidadeVotos) - parseInt(buData.votos["13"]?.quantidadeVotos);

        const votosEmTransito = (diffTransito) ? (parseInt(buData.qtdComparecimentoPresidente) - parseInt(buData.qtdComparecimento)) : 0;

        const reportCSVObject = [
            buData.municipio, buData.zona, buData.secao, 
            municipio?.estadoSingla, municipio?.municipio, 
            buData.local, buData.numeroInternoUrna, buData.numeroSerieFC, 
            buData.dataHoraCarga, buData.codigoCarga, buData.dataHoraAbertura, 
            buData.dataHoraEncerramento, buData.qtdEleitoresAptos, buData.qtdComparecimento, 
            buData.votos["13"]?.quantidadeVotos, buData.votos["22"]?.quantidadeVotos,
            votosOutros, votosNulos, total, vencedor, diffVencedor, diffTransito, votosEmTransito
        ];

        let newLine = reportCSVObject.join(",").replace(/\r/img, "").replace(/\n/img, "");
        reportCSV += `${newLine}\n`;

        reportJSON[id] = {
            ...buData,
            municipio,
            vencedor,
            diffVencedor,
            diffTransito
        };

        fs.appendFileSync(`./relatorio-${municipio?.estadoSingla}.csv`, `${newLine}\n`);

        if(diffTransito){
            reportCSVVotoEmTransito += `${reportCSVObject.join(",")}\n`;

            reportJSONVotoEmTransito = {
                ...buData,
                municipio,
                vencedor,
                diffVencedor,
                diffTransito
            };
        }
    }

    summayTotal.urnas = summayTotal.urnas.toLocaleString("pt-BR");
    summayTotal.votos["LULA"] = summayTotal.votos["LULA"].toLocaleString("pt-BR");
    summayTotal.votos["BOLSONARO"] = summayTotal.votos["BOLSONARO"].toLocaleString("pt-BR");
    summayTotal.votos["NULOS"] = summayTotal.votos["NULOS"].toLocaleString("pt-BR");
    summayTotal.votos["OUTROS"] = summayTotal.votos["OUTROS"].toLocaleString("pt-BR");

    //fs.writeFileSync("./relatorio.json", JSON.stringify(reportJSON, null, 4));
    //fs.writeFileSync("./relatorioVotoEmTransito.json", JSON.stringify(reportJSONVotoEmTransito, null, 4));
    fs.writeFileSync("./relatorio.csv", reportCSV);
    fs.writeFileSync("./relatorioVotoEmTransito.csv", reportCSVVotoEmTransito);
    fs.writeFileSync("./sumarioFinal.json", JSON.stringify(summayTotal, null, 4));
    process.exit(1);
})();
