#!/usr/bin/nodejs
//#!/usr/bin/rhino
print=console.log     // "Patch" for nodejs

var o = new Object()  // Objekt
var h = {}            // Hash-tabell (det samme som objekt)
var a = []            // Tabell/array (har egenskapen 'length')

var x = [o,h,a]

h["def"] = "Hash-tabell"
o.def    = "Objekt"
a.def    = "Tabell"

function enToTre (c) {

    c[0]   = 1
    c["2"] = 3
    c['1'] = 2
}

function fireFemSeks (c) {

    c["fire"] = 4
    c['fem']  = 5
    c.seks    = 6
}

for ( var i in x ) {    // Fyller med data
    enToTre     (x[i] )
    fireFemSeks (x[i] )
}


for ( var i in x ) {    // Skriver ut innhold

    print('\ntypeof:\t'   + typeof(x[i]) )
    print('length:\t' + x[i].length  )

    for ( var j in x[i])
        print (j+":\t"+x[i][j])

}
