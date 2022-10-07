import * as fs from "fs";
import archiver from "archiver";
import fg from "fast-glob";


(async () => {
    //Clear
    const dataParsedFilesExists = await fg("./DataParsed/**/*.zip");

    for(let file of dataParsedFilesExists)
        await fs.unlinkSync(file);

    const busFilesExists = await fg("./BUs/**/*.zip");

    for(let file of busFilesExists)
        await fs.unlinkSync(file);

    const ssFilesExists = await fg("./Screenshots/**/*.zip");

    for(let file of ssFilesExists)
        await fs.unlinkSync(file);

    if(fs.existsSync(`bus-binary.zip`))
        await fs.unlinkSync(`bus-binary.zip`);

    //Data Parsed
    const outputdp = fs.createWriteStream(`dp-${new Date().getTime()}.zip`);
    const archivedp = archiver('zip');
    archivedp.pipe(outputdp);
    archivedp.directory("./DataParsed", false);
    await archivedp.finalize();

    //BUs
    const outputbu = fs.createWriteStream(`bu-${new Date().getTime()}.zip`);
    const archivebu = archiver('zip');
    archivebu.pipe(outputbu);
    archivebu.directory("./BUs", false);
    await archivebu.finalize();

    //Screenshot
    const outputss = fs.createWriteStream(`ss-${new Date().getTime()}.zip`);
    const archivess = archiver('zip');
    archivess.pipe(outputss);
    archivess.directory("./Screenshots", false);
    await archivess.finalize();

    //Binarios
    const output = fs.createWriteStream(`bus-binary-${new Date().getTime()}.zip`);
    const archive = archiver('zip');
    archive.pipe(output);
    archive.directory("./Binary", false);
    await archive.finalize();
})();