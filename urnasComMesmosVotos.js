import * as fs from "fs";
import fg from "fast-glob";
import * as cliProgress from "cli-progress";
const municipios = JSON.parse(fs.readFileSync("municipios.json", "utf8"));

(async () => {
    const files = await fg("./DataParsed/**/*json");

    let summayTotal = {};

    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar1.start(files.length, 0);

    for(let fileBU of files){
        bar1.increment();  
        const buData = JSON.parse(fs.readFileSync(fileBU, "utf8"));

        const id = `${buData.municipio}-${buData.zona}-${buData.secao}`;
        const municipio = municipios[id];
        
        let votosOutros = 0;
        let votosNulos = 0;
        let votosLula = 0;
        let votosBolsonaro = 0;
        let summaryStates = {};

        for(let key in buData.votos){
            if(key !== "13" && key !== "22" && key !== "nulo")
                votosOutros += parseInt(buData.votos[key].quantidadeVotos);
            else if(key === "nulo")
                votosNulos = parseInt(buData.votos[key].quantidadeVotos);
        }

        if(!isNaN(parseInt(buData.votos["13"]?.quantidadeVotos)))
            votosLula = parseInt(buData.votos["13"]?.quantidadeVotos);

        if(!isNaN(parseInt(buData.votos["22"]?.quantidadeVotos)))
            votosBolsonaro = parseInt(buData.votos["22"]?.quantidadeVotos);

        if(!summayTotal[`${votosLula}-${votosBolsonaro}`])
            summayTotal[`${votosLula}-${votosBolsonaro}`] = 0;

        summayTotal[`${votosLula}-${votosBolsonaro}`]++;

        //if(!summayTotal[`${votosLula}-${votosBolsonaro}-${votosOutros}-${votosNulos}`])
        //    summayTotal[`${votosLula}-${votosBolsonaro}-${votosOutros}-${votosNulos}`] = 0;
        
        //summayTotal[`${votosLula}-${votosBolsonaro}-${votosOutros}-${votosNulos}`]++;
    }

    let summaryFinal = {};
    let summayTotalSortable = sortObject(summayTotal);
    let contagemTotal = 0;
    let totaldeUrnas = 0;

    for(let key = summayTotalSortable.length - 1; key >= 0; key--)
        summaryFinal[summayTotalSortable[key][0]] = summayTotalSortable[key][1];

    let finalData = {
        quantidadeDeUrnas: 0,
        totalDeVotos: 0,
        votosLula: 0,
        votosBolsonaro: 0,
        minVotos: 330,
        maxVotos: 0,
        mediaDiferenca: 0
    };

    for(let key in summaryFinal){
        const [lula, bolsonaro] = key.split("-");

        if(parseInt(lula) + parseInt(bolsonaro) > 100 && parseInt(lula) + parseInt(bolsonaro) <= 330){
            if(summaryFinal[key] >= 10){
                finalData.quantidadeDeUrnas += summaryFinal[key];
                finalData.totalDeVotos += (parseInt(lula) + parseInt(bolsonaro)) * summaryFinal[key];
                finalData.votosLula += (parseInt(lula)) * summaryFinal[key];
                finalData.votosBolsonaro += (parseInt(bolsonaro)) * summaryFinal[key];
            }

            if(finalData.minVotos > parseInt(lula) && parseInt(lula) > 10)
                finalData.minVotos = parseInt(lula);
            if(finalData.minVotos > parseInt(bolsonaro) && parseInt(bolsonaro) > 10)
                finalData.minVotos = parseInt(bolsonaro);

            if(finalData.maxVotos < parseInt(lula) && parseInt(bolsonaro) > 10)
                finalData.maxVotos = parseInt(lula);
            if(finalData.maxVotos < parseInt(bolsonaro) && parseInt(bolsonaro) > 10)
                finalData.maxVotos = parseInt(bolsonaro);

            contagemTotal += parseInt(lula) - parseInt(bolsonaro);
            totaldeUrnas++;
        }
    }

    finalData.mediaDiferenca = contagemTotal / totaldeUrnas;
    
    fs.writeFileSync(`urnasComMesmosVotos.json`, JSON.stringify(summaryFinal, null, 4));
    fs.writeFileSync(`urnasComMesmosVotosSummary.json`, JSON.stringify(finalData, null, 4));

    process.exit(1);
})();

function sortObject(obj) {
    let sortable=[];

	for(let key in obj)
		if(obj.hasOwnProperty(key))
			sortable.push([key, obj[key]]);

    sortable.sort(function(a, b)
    {
        let x=a[1], y=b[1];
        return x<y ? -1 : x>y ? 1 : 0;
    });

    return sortable;
}