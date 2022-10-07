import * as fs from "fs";
import archiver from "archiver";
import fg from "fast-glob";


(async () => {
    //Data Parsed
    const dataParsedFiles = await fg("./DataParsed/*", { onlyDirectories: true });

    for(let dir of dataParsedFiles){
        const output = fs.createWriteStream(`${dir}.zip`);
        const archive = archiver('zip');
        archive.pipe(output);
        archive.directory(dir, false);
        archive.finalize();
    }

    //BUs
    const busFiles = await fg("./BUs/*", { onlyDirectories: true });

    for(let dir of busFiles){
        const output = fs.createWriteStream(`${dir}.zip`);
        const archive = archiver('zip');
        archive.pipe(output);
        archive.directory(dir, false);
        archive.finalize();
    }

    //Screenshot
    const screenshotFiles = await fg("./.Screenshots/*", { onlyDirectories: true });

    for(let dir of screenshotFiles){
        const output = fs.createWriteStream(`${dir}.zip`);
        const archive = archiver('zip');
        archive.pipe(output);
        archive.directory(dir, false);
        archive.finalize();
    }

    //Binarios
    const output = fs.createWriteStream(`bus-binary.zip`);
    const archive = archiver('zip');
    archive.pipe(output);
    archive.directory("./Binary", false);
    archive.finalize();
})();