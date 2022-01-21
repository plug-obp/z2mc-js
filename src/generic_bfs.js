import { LinearScanHashSet } from "./linear_scan_set.js"
import { PingPongCircularBuffer } from "./pingpong_unbounded_circular_buffer.js"

export { generic_bfs }

let defaultOptions = {
    on_entry: (s,n,cn,l,a) => { a.size++; return false; },
    accumulator: {size:0},
    hashFunction: null,
    hashSeed: 482683,
    equalityFunction: (a, b) => a === b,
    bound: Number.MAX_SAFE_INTEGER,
    canonize: (v) => v
};

function applyDefaults(in_options) {
    let options = in_options || {};
    return {
        on_entry: options.on_entry ? options.on_entry : defaultOptions.on_entry,
        accumulator: options.accumulator ? options.accumulator : defaultOptions.accumulator,
        hashFunction: options.hashFunction ? options.hashFunction : defaultOptions.hashFunction,
        hashSeed: options.hashSeed ? options.hashSeed : defaultOptions.hashSeed,
        equalityFunction: options.equalityFunction ? options.equalityFunction : defaultOptions.equalityFunction,
        bound: options.bound ? options.bound : defaultOptions.bound,
        canonize: options.canonize ? options.canonize : defaultOptions.canonize
    };
}

function generic_bfs(initial, next, options=defaultOptions) {
    if (options !== defaultOptions) {
        options = applyDefaults(options)
    }
    return generic_bfs_internal(initial, next, options);
}

function generic_bfs_internal (
    initial, next, o
    // o.on_entry=(s,n,cn,l,a) => { a.size++; return false; }, o.accumulator={size:0},
    // o.hashFunction=null, o.hashSeed=0,
    // o.equalityFunction=(a, b) => a === b,
    // o.bound=Number.MAX_SAFE_INTEGER,
    // o.canonize=(v) => v
    )
{
    let known = new LinearScanHashSet(1024, o.hashFunction, o.hashSeed, o.equalityFunction);
    let frontier = new PingPongCircularBuffer(1024);
    let atStart  = true;
    let layer    = 0;

    
    while ((!frontier.isEmpty() || atStart) && layer < o.bound) {
        let source = null;
        let neighbours = null;
        if (atStart) {
            neighbours = initial;
            atStart = false;
        } else {
            source = frontier.dequeue();
            neighbours = next(source);
        }
        for (let neighbour of neighbours) {
            let canonical_neighbour = o.canonize(neighbour);
            if (known.add(canonical_neighbour)) {
                if (o.on_entry != null) {
                    let terminate = o.on_entry(source, neighbour, canonical_neighbour, layer, o.accumulator);
                    if (terminate) return o.accumulator;
                }
                frontier.enqueue(neighbour);
            }
        }
        if (frontier.layerChanged()) {
            frontier.markLayer();
            layer++;
        }
    }
    return o.accumulator;
}
