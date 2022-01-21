import { generic_bfs } from "./generic_bfs.js"

let g = {
    1: [3, 2],
    2: [3, 4],
    3: [],
    4: [1, 5],
    5: []
}

function on_entry(source, neighbour, canonical_neighbour, layer, accumulator) {
    console.log(
        `${source}->${neighbour}[${canonical_neighbour}] @ layer ${layer}`
    );
    v.size++;
    return false;
}
let v = {size: 0};
let r = generic_bfs([1], (n) => g[n], {on_entry: on_entry, accumulator: v, canonize:(n)=>(-n)});

console.log("r="+ JSON.stringify(r));

r = generic_bfs([1], (n) => g[n]);

console.log("r="+ JSON.stringify(r));
