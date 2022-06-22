'use strict';

const fs = require('fs');

let data = fs.readFileSync('./comuni.json');
let comuni = JSON.parse(data);
let lightweight = comuni.map(c=>{
    return({
        'n': c.nome,
        'r': c.regione.nome,
        'p': c.provincia.nome.slice(0,2).toUpperCase()
    })
})

lightweight.forEach(element => {
    console.log(element)
});

let dataW = JSON.stringify(lightweight);
fs.writeFileSync('comuni-lightweight.json', dataW);
