let combinacoes = 0;

for(let cad1 = 0; cad1 <= 300; cad1++){//48%
    for(let cad2 = 0; cad2 <= 300; cad2++){//43%
        combinacoes++;
        console.log(`Combinacao ${combinacoes}: ${cad1} e ${cad2}`);
    }
}

console.log(combinacoes);