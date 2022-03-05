// MIT License

// Copyright (c) 2022 Ciprian Teodorov

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

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
    layerChanged()  { return this.m_read_idx == this.m_barrier_idx; },
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
        
        if (this.m_write_idx == 0) {
            this.m_write_idx = capacity;
        } 
        //if the block tail=[0,m_write_idx] is smaller than head=[m_read_idx, capacity] -> copy the tail after the head
        else if (this.m_write_idx <= (capacity - this.m_read_idx)) {
            this.m_items.copyWithin(capacity, 0, this.m_write_idx);
            if (this.m_barrier_idx < this.m_write_idx) {
                this.m_barrier_idx = capacity + this.m_barrier_idx;
            }
            this.m_write_idx = capacity + this.m_write_idx;
        }
        //if the block tail=[0,m_write_idx] is bigger than head=[m_read_idx, capacity] -> move the head towards the tail 
        else {
            let offset = this.m_items.length - (capacity - this.m_read_idx);
            this.m_items.copyWithin(offset, this.m_read_idx, capacity);
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



// const ppcb = new PingPongCircularBuffer(5);

// ppcb.enqueue("value" + 0);
// console.log("enqueue", ppcb.size());
// ppcb.enqueue("value" + 1);
// console.log("enqueue", ppcb.size());
// ppcb.enqueue("value" + 2);
// console.log("enqueue", ppcb.size());
// ppcb.enqueue("value" + 3);
// console.log("enqueue", ppcb.size());
// ppcb.enqueue("value" + 4);
// console.log("enqueue", ppcb.size());
// let p = ppcb.dequeue();
// console.log("dequeue", p);
// p = ppcb.dequeue();
// console.log("dequeue", p);
// p = ppcb.dequeue();
// console.log("dequeue", p);

// ppcb.enqueue("value" + 5);
// console.log("enqueue", ppcb.size());
// ppcb.enqueue("value" + 6);
// console.log("enqueue", ppcb.size());
// ppcb.enqueue("value" + 7);
// console.log("enqueue", ppcb.size());
// ppcb.enqueue("value" + 8);
// console.log("enqueue", ppcb.size());

// const actions = `enqueue
// dequeue
// enqueue
// enqueue
// enqueue
// enqueue
// dequeue
// enqueue
// enqueue
// enqueue
// enqueue
// dequeue
// dequeue
// enqueue
// enqueue
// dequeue
// dequeue
// enqueue
// enqueue
// enqueue
// enqueue
// dequeue`.split("\n");

// let i = 0;
// for(const action of actions) {
//         switch(action) {
//                 case "enqueue":
//                         ppcb.enqueue("value" + i++);
//                         console.log(action, ppcb.size());
//                         break;
//                 case "dequeue": 
//                         const r = ppcb.dequeue();
//                         console.log(action, ppcb.size(), r);
//                         break;
//                 default:
//                         throw "unknown action: " + action;
//         }
// }
