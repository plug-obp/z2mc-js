export {PingPongCircularBuffer}

/**
 * This implements an unbounded circular buffer with layering
 * @param {*} capacity 
 */
function PingPongCircularBuffer(capacity) {
    this.m_growthFactor = 2;                            // The growth factor
    this.m_read_idx     = 0;
    this.m_write_idx    = 0;
    this.m_barrier_idx  = 0;
    this.m_items        = new Array(capacity);
    this.m_size         = 0;
}

const PingPongCircularBufferPrototype = {
    size()          { return this.m_size;     },
    capacity()      { return this.m_items.length; },
    isEmpty()       { return this.m_size == 0; },
    isFull()        { return this.m_size == this.capacity();  },
    enqueue:        m_enqueue,
    dequeue:        m_dequeue,
    markLayer()     { this.m_barrier_idx = this.m_write_idx; },
    layerChanged()  { this.m_read_idx == this.m_barrier_idx; },
    growIfFull:     m_growIfFull,
    toString:       m_toString,
}

PingPongCircularBuffer.prototype = PingPongCircularBufferPrototype;
PingPongCircularBuffer.prototype.constructor = PingPongCircularBuffer;


function m_enqueue(in_element) {
    this.growIfFull();
    this.m_items[this.m_write_idx] = in_element;
    this.m_write_idx    = (this.m_write_idx + 1) % this.capacity();
    this.m_size++;
}

function m_dequeue() {
    if (this.isEmpty()) {
        return null;
    }
    let element     = this.m_items[this.m_read_idx];
    this.m_read_idx = (this.m_read_idx+1) % this.capacity();
    this.m_size--;
    return element;
}

function m_growIfFull() {
    if (this.m_size < this.m_items.length) return;
    let capacity = this.capacity();
    this.m_items.length = capacity * this.m_growthFactor;

    //patch the circular buffer
    if (this.m_write_idx <= this.m_read_idx) {
        //if the block tail=[0,m_write_idx] is smaller than head=[m_read_idx, capacity] -> copy the tail after the head
        if (this.m_write_idx <= capacity - this.m_read_idx) {
            this.m_items.copyWithin(capacity, 0, this.m_write_idx);
            if (this.m_barrier_idx < this.m_write_idx) {
                this.m_barrier_idx = capacity + this.m_barrier_idx;
            }
            this.m_write_idx = capacity + this.m_write_idx;
        } else { //if the block tail=[0,m_write_idx] is bigger than head=[m_read_idx, capacity] -> move the head towards the tail
            let offset = this.m_items.length - (capacity - this.m_read_idx);
            this.m_items.copyWithin(offset, this.m_read_idx, capacity-this.m_read_idx);
            if (this.m_barrier_idx >= this.m_read_idx) {
                this.m_barrier_idx = offset + (this.m_barrier_idx - this.m_read_idx);
            }
            this.m_read_idx = offset;
        }
    }
}

function m_toString() {
    let repr =      "capacity=" + this.capacity() 
                +   ", size=" + this.m_size 
                +   ", isEmpty= " + this.isEmpty()
                +   ", isFull= " + this.isFull()
                +   ", ridx=" + this.m_read_idx
                +   ", widx=" + this.m_write_idx
                +   ", bidx=" + this.m_barrier_idx
                +   " items=["
    for (let i = 0; i<this.capacity(); i++) {
        if (i!=0) {
            repr += ", ";
        }
        repr += JSON.stringify(this.m_items[i])
    }
    repr += "]"
    return repr
}


// let x = new PingPongCircularBuffer(2);

// console.log(x);

// x.enqueue(2);
// x.enqueue(3);
// x.enqueue(4);
// console.log("deq: " + x.dequeue())
// console.log(x);

// x.enqueue(5);
// x.enqueue(6);
// console.log(x);

// x.enqueue(7);

// console.log(x.toString());