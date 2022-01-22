export { dataless_bfs_traversal }

/**
 * @param {*} initial               - a list C // it can be an iterable (atEnd : bool, next: C) 
 * @param {*} next                  - the next : C → set C
 * @param {*} on_entry              - the callback : C → C → α → ℕ → γ → γ
 * @param {*} memory                - the memory γ
 * @{The known should guarantee set-like behavior}
        @function {*} addIfAbsent             - a function that adds an element and return true if it was added : α → 𝔹
 * @{The frontier object should ensure FIFO discipline}
 * @param {FIFO} frontier 
        * @function {*} enqueue               - a function : C → Unit
        * @function {*} dequeue               - a function producing a C
        * @function {*} isEmpty               - a function testing the emptiness
        * @function {*} layerChanged          - a function that detects layer boundary crossing : 𝔹
        * @function {*} markLayer             - a function that mark the layer boundary
 * 
 * @param {*} bound 
 * @param {*} canonize 
 * @returns {γ} memory
 */
function dataless_bfs_traversal
(
    initial, next,
    on_entry, memory,
    known,
    frontier,
    bound,
    canonize
)
{
    let atStart  = true;
    let layer    = 0;
    
    while ((!frontier.isEmpty() || atStart) && layer < bound) {
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
            let canonical_neighbour = canonize(neighbour);
            if (known.addIfAbsent(canonical_neighbour)) {
                if (on_entry != null) {
                    let terminate = on_entry(source, neighbour, canonical_neighbour, layer, memory);
                    if (terminate) return memory;
                }
                frontier.enqueue(neighbour);
            }
        }
        if (frontier.layerChanged()) {
            frontier.markLayer();
            layer++;
        }
    }
    return memory;
}