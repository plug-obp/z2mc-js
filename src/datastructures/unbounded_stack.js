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

export { UnboundedStack }

function UnboundedStack(capacity, growthFactor) {
    this.m_growthFactor =  growthFactor;
    this.m_top          = -1;
    this.m_items        = new Array(capacity);
}

const UnboundedStackPrototype = {
    size()          { return this.m_top + 1;                                        },
    capacity()      { return this.m_items.length;                                   },
    isEmpty()       { return this.m_top == -1;                                      },
    isFull()        { return this.m_top+1 == this.capacity();                       },
    push(in_element){
        this.growIfFull();
        this.m_items[++this.m_top] = in_element;
    },
    pop()           { return this.isEmpty() ? null : this.m_items[this.m_top--];    },
    peek()          { return this.isEmpty() ? null : this.m_items[this.m_top];      },
    growIfFull()    {
        if (this.m_top+1 < this.m_items.length) return;
        this.m_items.length = this.m_items.length * this.m_growthFactor;
    },
    toString:       m_toString,
    map(fn)         {
        let r = []
        for (let i = 0; i<this.size(); i++) {
            r.push(fn(this.m_items[i]))
        }
        return r;
    }
}

UnboundedStack.prototype             = UnboundedStackPrototype;
UnboundedStack.prototype.constructor = UnboundedStack;

function m_toString() {
    let repr =      "  capacity=" + this.capacity() 
                +   ", size="     + this.size()
                +   ", isEmpty= " + this.isEmpty()
                +   ", isFull= "  + this.isFull()
                +   ", top="      + this.m_top
                +   ", items=["
    for (let i = 0; i < this.capacity(); i++) {
        if ( i != 0 ) {
            repr += ", ";
        }
        repr += JSON.stringify(this.m_items[i])
    }
    repr += "]"
    return repr
}

/** an empty stack is empty
 * ∀ cap ∈ ℕ⁺ gF ∈ ℝ⁺,  new UnboundedStack(cap, gF).isEmpty() = true 
 */

/** a non-empty stack is not empty
 * ∀ T: Type cap ∈ ℕ⁺ gF ∈ ℝ⁺ S x ∈ T, S.push(x).isEmpty() = false
 */

// let x = new UnboundedStack(2, 2);

// console.log(x.toString());

// x.push(2);
// x.push(3);
// x.push(4);
// console.log(x.toString());
// console.log("pop: " + x.pop())
// console.log(x.toString());
// x.push(5);
// console.log(x.toString());
