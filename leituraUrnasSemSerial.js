import * as fs from "fs";
import * as path from "path";
import fg from "fast-glob";


(async () => {
    const urnasSemSerial = await fg("./UrnasSemSerial/*json");
    let FCs = []

    for(let file of urnasSemSerial){
        const data = JSON.parse(fs.readFileSync(file, "utf-8"));

        if(FCs[FCs.length - 1] !== data.numeroSerieFC)
            FCs.push(data.numeroSerieFC);
    }

    fs.writeFileSync(`SerialsFCsError.txt`, FCs.join(" "));
})();