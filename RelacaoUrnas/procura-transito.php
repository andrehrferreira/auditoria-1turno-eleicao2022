<?php

ini_set('memory_limit', 1024 * 1024 * 1024 * 5);

$path    = './bus/.';
$files = scandir($path);
$files = array_diff(scandir($path), array('.', '..'));

$links = [];
foreach($files as $fileIndex => $file)
{
    if (!str_contains($file, '.imgbu'))
    {
        continue;
    }

    //
    echo "Processando {$file}... ";

    //
    $txtFileName = str_replace("imgbu", "txt", "./bus/{$file}");
    if (file_exists($txtFileName))
    {
        $txt = file_get_contents($txtFileName);
    }
    else
    {
        $result = file_get_contents("./bus/{$file}");

        $data = unpack('C*', $result);
        $len = ord($result[168]) + (ord($result[169]) << 8);
        $txt = utf8_encode(pack("C*", ...array_slice($data, 172, $len)));

        file_put_contents($txtFileName, $txt);
    }

    //
    $lines = explode("\n", $txt);
    $aptos = [];
    foreach ($lines as $i => $line)
    {
        if (str_contains(strtolower($line), "aptos"))
        {
            $aptos[] = trim(substr($line, 30));
        }
    }

    $aptos = array_unique($aptos);

    if (count($aptos) > 1)
    {
        //
        $uf = strtolower(substr($lines[1], -3, 2));
        $nubu = trim(substr($lines[12], -5));
        $zn = trim(substr($lines[15], -5));
        $se = trim(substr($lines[17], -5));

        //
        $url = "https://resultados.tse.jus.br/oficial/app/index.html#/eleicao;e=e544;uf={$uf};ufbu={$uf};mubu=$nubu;zn={$zn};se={$se}/dados-de-urna/boletim-de-urna";
        $links[$uf.$zn.$se] = (object)[
            'url' => $url,
            'uf' => $uf,
            'nubu' => $nubu,
            'zn' => $zn,
            'se' => $se
        ];

        echo "ALERTA: Transito encontrado\n";
    }

    echo "Concluído!\n";
}

echo count($links) . " registros processados\n";
file_put_contents('links_transito.json', json_encode(array_values($links), JSON_PRETTY_PRINT));
