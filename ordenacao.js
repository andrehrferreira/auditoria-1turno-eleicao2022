import * as fs from "fs";
import * as path from "path";
import fg from "fast-glob";


(async () => {
    //Data Parsed
    const dataParsedFiles = await fg("./DataParsed/*json");

    for(let file of dataParsedFiles){
        const basename = path.basename(file);
        const [mun, zona, secao] = basename.replace(".json", "").replace("BU-", "").split("-"); 

        if(!fs.existsSync(`./DataParsed/${mun}`))
            await fs.mkdirSync(`./DataParsed/${mun}`);

        await fs.renameSync(file, `./DataParsed/${mun}/BU-${mun}-${zona}-${secao}.json`);
    }

    //BUs
    const busFiles = await fg("./BUs/*json");

    for(let file of busFiles){
        const basename = path.basename(file);
        const [mun, zona, secao] = basename.replace(".json", "").replace("BU-", "").split("-"); 

        if(!fs.existsSync(`./BUs/${mun}`))
            await fs.mkdirSync(`./BUs/${mun}`);

        await fs.renameSync(file, `./BUs/${mun}/BU-${mun}-${zona}-${secao}.json`);
    }

    //Screenshot
    const ssFiles = await fg("./Screenshots/*png");

    for(let file of ssFiles){
        const basename = path.basename(file);
        const [mun, zona, secao] = basename.replace(".png", "").replace("BU-", "").split("-"); 

        if(!fs.existsSync(`./Screenshots/${mun}`))
            await fs.mkdirSync(`./Screenshots/${mun}`);

        await fs.renameSync(file, `./Screenshots/${mun}/BU-${mun}-${zona}-${secao}.png`);
    }

    //Binarios
    const byFiles = await fg("./Binary/*.bu");

    for(let file of byFiles){
        const basename = path.basename(file);
        const id = basename.replace(".bu", "").split("-")[1]; 
        const dir = id.substring(id.length-2, id.length);

        if(!fs.existsSync(`./Binary/${dir}`))
            await fs.mkdirSync(`./Binary/${dir}`);

        await fs.renameSync(file, `./Binary/${dir}/${basename}`);
    }
})();