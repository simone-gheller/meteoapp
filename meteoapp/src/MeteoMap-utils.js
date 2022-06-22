
export function weather_decode(code) {
    if(code > 800)
       return "cloudy";
    if(code == 800)
       return "sunny";
    if(code >= 700)
       return "sunny_intervals";
    if(code >= 600)
       return "snowy";
    if(code >= 500)
       return "rainy";
    if(code >= 300)
       return "rainy";
    if(code >=200)
       return "storm";

    return undefined
}

export const coords = {
    "valle d'aosta" : "-50px 0px",
    "piemonte": "-50px 0px",
    "liguria": "-50px 0px",
    "lombardia": "-10px 0px",
    "trentino-alto adige": "120px -50px",
    "friuli-venezia giulia": "220px -50px",
    "veneto": "120px -50px",
    "emilia-romagna": "100px 50px",
    "toscana": "100px 80px",
    "umbria": "200px 180px",
    "marche": "200px 180px",
    "lazio": "220px 250px",
    "abruzzo": "280px 150px",
    "molise": "340px 290px",
    "campania": "370px 380px",
    "basilicata": "440px 400px",
    "puglia": "490px 400px",
    "calabria": "500px 520px",
    "sicilia": "290px 650px",
    "sardegna": "-50px 390px"
}

export const level1_icons = {
    "milano" : [55,80],
    "genova" : [125,60],
    "torino" : [85, 5],
    "aosta"  : [40,0],
    "bologna": [110, 155],
    "venezia": [65,175],
    "trieste": [40,230],
    "trento" : [25,140],
    "firenze": [155,150],
    "perugia": [180,190],
    "ancona" : [160,230],
    "cagliari": [360,70],
    "roma"   : [240,175],
    "isernia": [245,270],
    "l'aquila":[220,245],
    "napoli" : [280,245],
    "bari"   : [280,350],
    "potenza": [305,315],
    "catanzaro": [380,340],
    "palermo": [418,225],
    "oristano":[330,50],
    "nuoro"  : [310,90],
    "sassari": [290,60],
    "agrigento": [460,240],
    "catania": [440,280],
    "ragusa" : [410,310],
    "cosenza": [345,320],
    "lecce"  : [315,385],
    "foggia" : [272,290],
    "salerno": [310,275],
    "frosinone": [255,215],
    "riccione": [215,205],
    "grosseto": [192,138],
    "massa": [140,105],
    "rimini" : [138,190],
    "prato"  : [100,110],
    "imperia"  : [130,20],
    "alessandria": [90,50],
    "verbania" : [45,40],
    "brescia" : [62,120],
    "sondrio" : [20,100],
    "bolzano" : [-6,160],
    "belluno" : [30,190]
}

export const level2_icons = {
    "valle d'aosta": {
        "courmayeur": [110,65],
        "chatillon": [125,110]
    },
    "piemonte" : {
        "torino": [200,125],
        "alessandria":[215,182],
        "cuneo":[260,113],
        "novara":[150,150],
        "domodossola":[90,155],
        "bardonecchia":[165,80],
        "dronero":[225,75]
    },
    "liguria":{
        "sanremo": [295, 115],
        "savona": [270, 160],
        "genova": [250, 200],
        "la spezia": [275,240]
    },
    "lombardia":{
        "milano": [150,165],
        "varese": [110,146],
        "brescia": [136,254],
        "pavia": [197,170],
        "bergamo": [120, 207],
        "sondrio": [78,215],
        "mantova": [165,212],
        "cremona": [184,282]
    },
    "trentino-alto adige":{
        "trento": [137,174],
        "bolzano": [70,197],
        "mezzano": [118,223],
        "solda": [100,146]
    },
    "veneto":{
        "venezia": [190,260],
        "verona" : [192,180],
        "rovigo": [233,230],
        "vicenza": [160,226],
        "belluno": [108,255],
        "portogruaro": [170,308]
    },
    "friuli-venezia giulia":{
        "pordenone":[130,200],
        "monfalcone":[155,248],
        "tolmezzo":[89,220]
    },
    "emilia-romagna":{
        "piacenza":[150,105],
        "bardi":[190,120],
        "parma":[164,163],
        "bologna":[183,218],
        "ferrara":[160,260],
        "rimini":[235,290],
        "galeata":[220,248],
        "sestola":[214,170]
    },
    "toscana":{
        "massa":[195,136],
        "firenze":[228,196],
        "pisa":[250,150],
        "marradi":[200,235],
        "orbetello":[350,220],
        "arezzo":[260,250],
        "siena":[290,200]
    },
    "umbria":{
        "perugia":[186,194],
        "terni":[240,195],
        "norcia":[230,240]
    },
    "marche":{
        "pesaro":[130,230],
        "cagli":[165,212],
        "ancona":[160,270],
        "camerino":[200,240],
        "fermo":[210,285]
    },
    "lazio":{
        "bolsena":[190,141],
        "rieti":[205,209],
        "roma":[240,165],
        "latina":[280,200],
        "subiaco":[248,234],
        "pontecorvo":[290,260]
    },
    "abruzzo":{
        "teramo":[270,210],
        "pescara":[295,245],
        "atessa":[340,240],
        "l'aquila":[330,190]
    },
    "molise":{
        "isernia":[238,194],
        "termoli":[210,230],
    },
    "campania":{
        "napoli":[240,190],
        "mondragone":[186,142],
        "benevento":[188,191],
        "sapri":[270,242],
        "lioni":[215,228]
    },
    "basilicata":{
        "potenza":[225,213],
        "policoro":[256,257],
        "lauria":[270,202],
        "melfi":[187,190]
    },
    "puglia":{
        "foggia":[140,127],
        "vieste":[102,160],
        "barletta":[162,187],
        "bari":[180,237],
        "taranto":[227,245],
        "brindisi":[220,294],
        "gallipoli":[275,310]
    },
    "calabria":{
        "reggio calabria":[327,140],
        "vibo valentia":[275,170],
        "crotone":[250,223],
        "cosenza":[220,178],
        "castrovillari":[170,170]
    },
    "sicilia":{
        "palermo":[210,170],
        "marsala":[240,115],
        "agrigento":[270,200],
        "enna":[235,245],
        "messina":[200,313],
        "siracusa":[290,280]
    },
    "sardegna":{
        "sassari":[220,160],
        "olbia":[205,226],
        "nuoro":[265,210],
        "tortoli":[316,240],
        "cagliari":[360,200],
        "oristano":[307,164]
    }
}