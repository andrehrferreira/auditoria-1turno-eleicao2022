import * as fs from "fs";
import fg from "fast-glob";

(async () => {
    const files = await fg("./Municipios/*json");
    const index = {};

    for(let fileMun of files){
        const data = await fs.readFileSync(fileMun, "utf-8");
        const dataJson = JSON.parse(data);

        const estadoSingla = dataJson.abr[0].cd;
        const estado = dataJson.abr[0].ds;

        for(let mun of dataJson.abr[0].mu){
            const municipio = mun.nm;
            const codMun = mun.cd;

            for(let zona of mun.zon){
                const zonaId = zona.cd;

                for(let sessao of zona.sec){
                    const sessaoId = sessao.ns;

                    index[`${parseInt(codMun)}-${parseInt(zonaId)}-${parseInt(sessaoId)}`] = {
                        estadoSingla,
                        estado,
                        municipio,
                        codMun,
                        zona: zonaId,
                        sessao: sessaoId
                    }

                    index[`${parseInt(codMun)}-${parseInt(zonaId)}`] = {
                        estadoSingla,
                        estado,
                        municipio,
                        codMun,
                        zona: zonaId,
                        sessao: sessaoId
                    }
                }
            }
        }
    }

    fs.writeFileSync("./municipios.json", JSON.stringify(index, null, 4));
})();
