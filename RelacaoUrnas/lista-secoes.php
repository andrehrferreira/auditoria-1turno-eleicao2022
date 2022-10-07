<?php

ini_set('memory_limit', 1024 * 1024 * 1024 * 5);

$path    = './csvs/.';
$files = scandir($path);
$files = array_diff(scandir($path), array('.', '..'));

$links = [];
foreach($files as $file)
{
    if (!str_contains($file, '.csv'))
    {
        continue;
    }

    $open = fopen("./csvs/{$file}", "r");
    while (($data = fgetcsv($open, 1000, ";")) !== FALSE)
    {
        //
        $uf = strtolower($data[5]);
        if ($uf=='sg_uf')
        {
            continue;
        }

        //
        $nubu = $data[6];
        $zn = str_pad($data[8], 4, "0", STR_PAD_LEFT);;
        $se = str_pad($data[9], 4, "0", STR_PAD_LEFT);;
        $url = "https://resultados.tse.jus.br/oficial/app/index.html#/eleicao;e=e544;uf={$uf};ufbu={$uf};mubu=$nubu;zn={$zn};se={$se}/dados-de-urna/boletim-de-urna";

        echo "Processando {$uf}/{$zn}/{$se}... ";

        $links[$uf.$zn.$se] = (object)[
            'url' => $url,
            'uf' => $uf,
            'nubu' => $nubu,
            'zn' => $zn,
            'se' => $se
        ];

        echo "Concluído!\n";
    }
}

echo count($links) . " registros processados\n";
file_put_contents('links-full.json', json_encode(array_values($links), JSON_PRETTY_PRINT));
