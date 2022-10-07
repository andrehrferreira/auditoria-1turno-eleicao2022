<?php
ini_set('memory_limit', 1024 * 1024 * 1024 * 5);

$path    = './csvs/.';
$files = scandir($path);
$files = array_diff(scandir($path), array('.', '..'));

$filter = $argv[1]??'.csv';

$links = [];
foreach($files as $fileIndex => $file)
{
    if (!str_contains($file, $filter))
    {
        continue;
    }

    $open = fopen("./csvs/{$file}", "r");
    while (($data = fgetcsv($open, 0, ";")) !== FALSE)
    {
        //
        $uf = strtolower($data[5]);
        if ($uf == 'sg_uf')
        {
            continue;
        }

        //
        $nubu = $data[6];
        $zn = str_pad($data[8], 4, "0", STR_PAD_LEFT);
        $se = str_pad($data[9], 4, "0", STR_PAD_LEFT);

        echo "Processando {$uf}/{$zn}/{$se}... ";

        //
        if (file_exists("./bus/o00406-{$nubu}{$zn}{$se}.imgbu"))
        {
            echo "Já processado!\n";
            continue;
        }

        //
        // sleep(1);

        /**
         *
         */
        $url = "https://resultados.tse.jus.br/oficial/ele2022/arquivo-urna/406/dados/{$uf}/{$nubu}/{$zn}/{$se}/p000406-{$uf}-m{$nubu}-z{$zn}-s{$se}-aux.json";
        $json = json_decode(file_get_contents($url));
        $hash = $json->hashes[0]->hash;

        /**
         *
         */
        $urlBu = "https://resultados.tse.jus.br/oficial/ele2022/arquivo-urna/406/dados/{$uf}/{$nubu}/{$zn}/{$se}/{$hash}/o00406-{$nubu}{$zn}{$se}.imgbu";

        //
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $urlBu);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');

        $headers = array();
        $headers[] = 'Referer: https://resultados.tse.jus.br/oficial/app/index.html';
        $headers[] = 'Accept: */*';
        $headers[] = 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15';
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $result = curl_exec($ch);
        if (curl_errno($ch))
        {
            echo 'Error:' . curl_error($ch);
        }
        curl_close($ch);

        // salva
        file_put_contents("./bus/o00406-{$nubu}{$zn}{$se}.imgbu", $result);

        echo "Arquivo salvo!\n";
    }
}
