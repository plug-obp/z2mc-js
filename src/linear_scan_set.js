var _ = require('lodash');
var hash = require('object-hash');

function LinearScanHashSet(capacity, hashFunction, hashSeed, equalityFunction) {
    this.m_capacity         = capacity;                     // The capacity of the underlying container
    this.m_hashFunction     = hashFunction === null ? (e, seed) => { return 1; } : hashFunction;   // The hash function which will be used
    this.m_hashSeed         = hashSeed;                     // The seed of the hash function
    this.m_equalsFunction   = equalityFunction == null ? (a, b) => { return a === b} : equalityFunction;  // The equality test function, by default identity test
    this.m_maxLoadFactor    = 0.667;                        // The maximum load factor, when this load factor is reached the m_items will grow by m_growthFactor
    this.m_growthFactor     = 2;                            // The growth factor
    this.m_items            = new Array(capacity);                         // The underlying container, the elements are stored inside
    this.m_size             = 0;                            // The number of items currently in the set
}

const LinearScanHashSetPrototype = {
    size() {
        return this.m_size;
    },

    toString() {
        repr = "capacity=" + this.m_capacity + ", size=" + this.m_size + " items=["
        for (i = 0; i<this.m_capacity; i++) {
            if (i!=0) {
                repr += ", ";
            }
            repr += JSON.stringify(this.m_items[i])
        }
        repr += "]"
        return repr
    },
    /**
     * 
     * @param {*} element 
     * @returns true if the element was added, false if the element was already in
     */
    add(element) {
        // grow the table if the load factor was reached
        if (this.m_size >= (this.m_capacity * this.m_maxLoadFactor)) {
            this.grow()
        }

        theHash = this.m_hashFunction(element, this.m_hashSeed);
        theIndex  = theHash % this.m_capacity;

        //check for empty slot at index
        if (this.m_items[theIndex] == null) {
            this.m_items[theIndex] = element;
            this.m_size++;
            return true;
        }

        //check if the element is already present at index
        if (this.m_equalsFunction(element, this.m_items[theIndex])) {
            return false;
        }

        //not found start linear probing
        start = theIndex;
        do {
            theIndex = (theIndex + 1) % this.m_capacity;
        } while (
                this.m_items[theIndex] != null
            && !this.m_equalsFunction(element, this.m_items[theIndex])
            &&  theIndex != start
        );

        if (theIndex == start) {
            //Normally we cannot reach this, since we are trying to grow
            throw new Error("The hashset is full")
        }

        //check for empty slot at index
        if (this.m_items[theIndex] == null) {
            this.m_items[theIndex] = element;
            this.m_size++;
            return true;
        }

        //the element is already present
        return false;
    },

    contains(element) {
        theHash = this.m_hashFunction(element, this.m_hashSeed);
        theIndex  = theHash % this.m_capacity;

        //check for empty slot at index
        if (this.m_items[theIndex] == null) {
            return false;
        }

        //check if the element is already present at index
        if (this.m_equalsFunction(element, this.m_items[theIndex])) {
            return true;
        }

        //not found start linear probing
        start = theIndex;
        do {
            theIndex = (theIndex + 1) % this.m_capacity;
        } while (
                this.m_items[theIndex] != null
            && !this.m_equalsFunction(element, this.m_items[theIndex])
            &&  theIndex != start
        );

        //scanned the table, the element is not in
        if (theIndex == start || this.m_items[theIndex] == null) {
            return false;
        }
        return true;
    },

    grow() {
        console.log("wants to grow")
        newCapacity = this.m_capacity * this.m_growthFactor;
        newArray = new Array(newCapacity);
        //copy and rehash the elements
        for (i = 0; i<this.m_capacity; i++) {
            element = this.m_items[i];
            if (element == null) continue;
            this.internalAddRehash(newArray, element, this.m_hashFunction(element, this.m_hashSeed));
        }
        this.m_capacity = newCapacity;
        this.m_items = newArray;
    },

    //does not check for duplicates, does not change the size
    internalAddRehash(array, element, hash) {
        theCapacity = array.length;
        theIndex = hash % theCapacity;
        //check for empty slot at index
        if (array[theIndex] == null) {
            array[theIndex] = element;
            return;
        }

        //not found start linear probing
        start = theIndex;
        do {
            theIndex = (theIndex + 1) % theCapacity;
        } while (
                array[theIndex] != null
            &&  theIndex != start
        );

        if (theIndex == start) {
            //Normally we cannot reach this, since we are trying to grow
            throw new Error("The hashset is full")
        }

        //check for empty slot at index
        if (array[theIndex] == null) {
            array[theIndex] = element;
        }
    },
}

LinearScanHashSet.prototype             = LinearScanHashSetPrototype;
LinearScanHashSet.prototype.constructor = LinearScanHashSet;

theSet = new LinearScanHashSet(5, null, null, null)
theSet.add(1)
theSet.add(2)
theSet.add(1)
theSet.add([1, 2])
theSet.add([1, 2])
x = [2, 3]
theSet.add(x)
theSet.add(x)
theSet.add({x:2})
console.log(`The set:${theSet}`)
console.log(`The size is : ${theSet.size()} contains [1,2]: ${theSet.contains([1,2])}`)

console.log(`---------------------------------------------------------`)

dirtyHash = (e, seed) => {return Number(BigInt.asUintN(32, BigInt("0x"+hash(e))));}
theSet = new LinearScanHashSet(5, dirtyHash, null, _.isEqual)

console.log(`The set:${theSet}`)

theSet.add(1)
theSet.add(2)
theSet.add(1)
theSet.add([1, 2])
theSet.add([1, 2])
x = [2, 3]
theSet.add(x)
theSet.add(x)
theSet.add({x:2})
console.log(`The set:${theSet}`)
console.log(`The size is : ${theSet.size()} contains [1,2]: ${theSet.contains([1,2])}`)


console.log(`---------------------------------------------------------`)


theSet = new Set()
theSet.add(1)
theSet.add(2)
theSet.add(1)
theSet.add([1, 2])
theSet.add([1, 2])
x = [2, 3]
theSet.add(x)
theSet.add(x)
theSet.add({x:2})
console.log(theSet)
console.log(`The size is : ${theSet.size} contains [1,2]: ${theSet.has([1,2])}`)


// console.log(`The size is : ${theSet.grow()}`)
