import * as fs from "fs";
import * as path from "path";
import fg from "fast-glob";
import * as cliProgress from "cli-progress";

function getBU(filename){
    return new Promise((function(resolve, reject) {
        const data = fs.readFileSync(filename, "utf-8");
        const dataJson = JSON.parse(data);
        let votos = {};

        const pointer = dataJson.conteudo.entidadeBoletimUrna.resultadosVotacaoPorEleicao.content[1]?.resultadosVotacao.content[0].totaisVotosCargo.content[0];
        
        if(pointer){
            for(let votosVotavel of pointer.votosVotaveis.content){
                if(votosVotavel.partido){
                    votos[votosVotavel.partido] = {
                        partido: votosVotavel.partido,
                        quantidadeVotos: votosVotavel.quantidadeVotos.value,
                        assinatura: votosVotavel.assinatura.value
                    }
                }
                else{
                    votos["nulo"] = {
                        partido: votosVotavel.partido,
                        quantidadeVotos: votosVotavel.quantidadeVotos.value,
                        assinatura: votosVotavel.assinatura.value
                    }
                }
            }

            try{
                const serialUrna = dataJson.conteudo.entidadeBoletimUrna.urna.correspondenciaResultado.carga.numeroSerieFC.value;
    
                if(serialUrna?.length == 8 || serialUrna?.length == 7){
                    resolve({
                        secao: dataJson.identificacao.secao?.value || "INDEFINIDO",
                        zona: dataJson.conteudo.entidadeBoletimUrna.urna.correspondenciaResultado.identificacao.municipioZona.zona.value,
                        municipio: dataJson.conteudo.entidadeBoletimUrna.urna.correspondenciaResultado.identificacao.municipioZona.municipio.value,
                        local: dataJson.conteudo.entidadeBoletimUrna.identificacao.local.value,
                        numeroInternoUrna: dataJson.conteudo.entidadeBoletimUrna.urna.correspondenciaResultado.carga.numeroInternoUrna.value,
                        numeroSerieFC: serialUrna,
                        dataHoraCarga: dataJson.conteudo.entidadeBoletimUrna.urna.correspondenciaResultado.carga.dataHoraCarga.value,
                        codigoCarga: dataJson.conteudo.entidadeBoletimUrna.urna.correspondenciaResultado.carga.codigoCarga.value,
                        dataHoraAbertura: dataJson.conteudo.entidadeBoletimUrna.dadosSecao?.dataHoraAbertura.value || "INDEFINIDO",
                        dataHoraEncerramento: dataJson.conteudo.entidadeBoletimUrna.dadosSecao?.dataHoraEncerramento.value || "INDEFINIDO",
                        idEleicao: dataJson.conteudo.entidadeBoletimUrna.resultadosVotacaoPorEleicao.content[1].idEleicao.value,
                        qtdEleitoresAptos: dataJson.conteudo.entidadeBoletimUrna.resultadosVotacaoPorEleicao.content[0].qtdEleitoresAptos.value,
                        qtdEleitoresAptosPresidente: dataJson.conteudo.entidadeBoletimUrna.resultadosVotacaoPorEleicao.content[1].qtdEleitoresAptos.value,
                        qtdComparecimento: dataJson.conteudo.entidadeBoletimUrna.resultadosVotacaoPorEleicao.content[0].resultadosVotacao.content[0].qtdComparecimento.value,
                        qtdComparecimentoPresidente: dataJson.conteudo.entidadeBoletimUrna.resultadosVotacaoPorEleicao.content[1].resultadosVotacao.content[0].qtdComparecimento.value,
                        votos
                    });
                }
                else{
                    const municipio = dataJson.conteudo.entidadeBoletimUrna.urna.correspondenciaResultado.identificacao.municipioZona.municipio.value;
                    const zona = dataJson.conteudo.entidadeBoletimUrna.urna.correspondenciaResultado.identificacao.municipioZona.zona.value;
                    const secao = dataJson.identificacao.secao.value;
    
                    fs.writeFileSync(`./UrnasSemSerial/${municipio}-${zona}-${secao}.json`, JSON.stringify({
                        secao: dataJson.identificacao.secao?.value || "INDEFINIDO",
                        zona: dataJson.conteudo.entidadeBoletimUrna.urna.correspondenciaResultado.identificacao.municipioZona.zona.value,
                        municipio: dataJson.conteudo.entidadeBoletimUrna.urna.correspondenciaResultado.identificacao.municipioZona.municipio.value,
                        local: dataJson.conteudo.entidadeBoletimUrna.identificacao.local.value,
                        numeroInternoUrna: dataJson.conteudo.entidadeBoletimUrna.urna.correspondenciaResultado.carga.numeroInternoUrna.value,
                        numeroSerieFC: serialUrna,
                        dataHoraCarga: dataJson.conteudo.entidadeBoletimUrna.urna.correspondenciaResultado.carga.dataHoraCarga.value,
                        codigoCarga: dataJson.conteudo.entidadeBoletimUrna.urna.correspondenciaResultado.carga.codigoCarga.value,
                        dataHoraAbertura: dataJson.conteudo.entidadeBoletimUrna.dadosSecao?.dataHoraAbertura.value || "INDEFINIDO",
                        dataHoraEncerramento: dataJson.conteudo.entidadeBoletimUrna.dadosSecao?.dataHoraEncerramento.value || "INDEFINIDO",
                        idEleicao: dataJson.conteudo.entidadeBoletimUrna.resultadosVotacaoPorEleicao.content[1].idEleicao.value,
                        qtdEleitoresAptos: dataJson.conteudo.entidadeBoletimUrna.resultadosVotacaoPorEleicao.content[0].qtdEleitoresAptos.value,
                        qtdEleitoresAptosPresidente: dataJson.conteudo.entidadeBoletimUrna.resultadosVotacaoPorEleicao.content[1].qtdEleitoresAptos.value,
                        qtdComparecimento: dataJson.conteudo.entidadeBoletimUrna.resultadosVotacaoPorEleicao.content[0].resultadosVotacao.content[0].qtdComparecimento.value,
                        qtdComparecimentoPresidente: dataJson.conteudo.entidadeBoletimUrna.resultadosVotacaoPorEleicao.content[1].resultadosVotacao.content[0].qtdComparecimento.value,
                        votos
                    }, null, 4));
    
                    resolve({
                        secao: dataJson.identificacao.secao?.value || "INDEFINIDO",
                        zona: dataJson.conteudo.entidadeBoletimUrna.urna.correspondenciaResultado.identificacao.municipioZona.zona.value,
                        municipio: dataJson.conteudo.entidadeBoletimUrna.urna.correspondenciaResultado.identificacao.municipioZona.municipio.value,
                        local: dataJson.conteudo.entidadeBoletimUrna.identificacao.local.value,
                        numeroInternoUrna: dataJson.conteudo.entidadeBoletimUrna.urna.correspondenciaResultado.carga.numeroInternoUrna.value,
                        numeroSerieFC: 'ERROR',
                        dataHoraCarga: dataJson.conteudo.entidadeBoletimUrna.urna.correspondenciaResultado.carga.dataHoraCarga.value,
                        codigoCarga: dataJson.conteudo.entidadeBoletimUrna.urna.correspondenciaResultado.carga.codigoCarga.value,
                        dataHoraAbertura: dataJson.conteudo.entidadeBoletimUrna.dadosSecao?.dataHoraAbertura.value || "INDEFINIDO",
                        dataHoraEncerramento: dataJson.conteudo.entidadeBoletimUrna.dadosSecao?.dataHoraEncerramento.value || "INDEFINIDO",
                        idEleicao: dataJson.conteudo.entidadeBoletimUrna.resultadosVotacaoPorEleicao.content[1].idEleicao.value,
                        qtdEleitoresAptos: dataJson.conteudo.entidadeBoletimUrna.resultadosVotacaoPorEleicao.content[0].qtdEleitoresAptos.value,
                        qtdEleitoresAptosPresidente: dataJson.conteudo.entidadeBoletimUrna.resultadosVotacaoPorEleicao.content[1].qtdEleitoresAptos.value,
                        qtdComparecimento: dataJson.conteudo.entidadeBoletimUrna.resultadosVotacaoPorEleicao.content[0].resultadosVotacao.content[0].qtdComparecimento.value,
                        qtdComparecimentoPresidente: dataJson.conteudo.entidadeBoletimUrna.resultadosVotacaoPorEleicao.content[1].resultadosVotacao.content[0].qtdComparecimento.value,
                        votos
                    });
                }
            }
            catch(e){
                console.log("Erro ao ler arquivo: " + filename);
                console.log(e);
                resolve();
            }
        }
        else{
            resolve();
        }
    }));
}

(async () => {
    const files = await fg("./BUs/**/*json");

    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar1.start(files.length, 0);

    for(let bu of files){
        bar1.increment();  

        if(!fs.existsSync(bu.replace("BUs", "DataParsed"))){
            const data = await getBU(bu);

            if(data){
                const dirname = path.dirname(bu.replace("BUs", "DataParsed"));

                if(!fs.existsSync(dirname))
                    fs.mkdirSync(dirname, { recursive: true });

                fs.writeFileSync(bu.replace("BUs", "DataParsed"), JSON.stringify(data, null, 4));
            }
        }
    }

    process.exit(1);
})();

