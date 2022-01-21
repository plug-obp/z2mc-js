import { generic_bfs } from "./generic_bfs.js"

let g = {
    1: [3, 2],
    2: [3, 4],
    4: [1, 5]
}

function on_entry(source, neighbour, canonical_neighbour, layer, accumulator) {
    console.log(
        `${source}->${neighbour}[${canonical_neighbour}] @ ${layer}`
    );
    return false;
}
let r = generic_bfs([1], (n) => g[1], on_entry, null, (n, s) => n, null, (a, b) => a === b, null);

console.log(r);