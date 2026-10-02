#!/usr/bin/nodejs
//#!/usr/bin/rhino

print=console.log     // "Patch" for nodejs

v="X"
var o = new Object()
o.v="Y"
o.f=function(){
    v = "Z"
    print(global.v)
    print(this.v)
    print(v)
    var v   //  Kommenter bort denne, observer og forklar
}

o.f()
