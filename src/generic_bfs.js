import { LinearScanHashSet } from "./linear_scan_set.js"
import { PingPongCircularBuffer } from "./pingpong_unbounded_circular_buffer.js"

export { generic_bfs }

function generic_bfs(
    initial, next,
    on_entry=null, accumulator=null,
    hashFunction, hashSeed,
    equalityFunction,
    bound=null,
    canonize=(v) => v
    )
{
    let known = new LinearScanHashSet(1024, hashFunction, hashSeed, equalityFunction);
    let frontier = new PingPongCircularBuffer(1024);
    let atStart  = true;
    let layer    = 0;

    
    while (!frontier.isEmpty() || atStart || layer < bound) {
        let source = null;
        let neighbours = null;
        if (atStart) {
            neighbours = initial;
        } else {
            source = frontier.dequeue();
            if (frontier.layerChanged()) {
                layer++;
            }
            neighbours = next(source);
        }
        for (let neighbour of neighbours) {
            let canonical_neighbour = canonize(neighbour);
            if (known.add(canonical_neighbour)) {
                if (on_entry != null) {
                    let terminate = on_entry(source, neighbour, canonical_neighbour, layer, accumulator);
                    if (terminate) return accumulator;
                }
                frontier.enqueue(neighbour);
            }
        }
        if (atStart) {
            frontier.markLayer();
            atStart = false;
        }
    }
    return accumulator;
}
