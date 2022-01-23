
export {LinearScanHashSet};

function LinearScanHashSet(capacity, hashFunction, equalityFunction, isMap) {
    this.m_capacity         = capacity;                     // The capacity of the underlying container
    this.m_hashFunction     = hashFunction;   // The hash function which will be used
    this.m_equalsFunction   = equalityFunction;  // The equality test function, by default identity test
    this.m_maxLoadFactor    = 0.667;                        // The maximum load factor, when this load factor is reached the m_items will grow by m_growthFactor
    this.m_growthFactor     = 2;                            // The growth factor
    this.m_items            = new Array(capacity);          // The underlying container, the elements are stored inside
    this.m_size             = 0;                            // The number of items currently in the set
    this.m_isMap            = isMap;
}

const LinearScanHashSetPrototype = {
    size() {
        return this.m_size;
    },

    toString() {
        let repr = "capacity=" + this.m_capacity + ", size=" + this.m_size + " items=["
        for (let i = 0; i<this.m_capacity; i++) {
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
     * @param {*} key 
     * @returns true if the element was added, false if the element was already in
     */
    add(key, value=null) {
        // grow the table if the load factor was reached
        if (this.m_size >= (this.m_capacity * this.m_maxLoadFactor)) {
            this.grow()
        }

        let theHash = this.m_hashFunction(key);
        let theIndex  = theHash % this.m_capacity;

        //check for empty slot at index
        if (this.m_items[theIndex] == null) {
            this.m_items[theIndex] = this.m_isMap ? {key: key, value: value} : key;
            this.m_size++;
            return this.m_isMap ? null : true;
        }

        //check if the element is already present at index
        let item = this.m_items[theIndex];
        if (this.m_equalsFunction(key, this.m_isMap ? item.key : item)) {
            if (!this.m_isMap) return false;
            let old = item.value;
            item.value = value;
            return old;
        }

        //not found start linear probing
        let start = theIndex;
        do {
            theIndex = (theIndex + 1) % this.m_capacity;
        } while (
                this.m_items[theIndex] != null
            && !this.m_equalsFunction(key, this.m_isMap ? this.m_items[theIndex].key : this.m_items[theIndex])
            &&  theIndex != start
        );

        if (theIndex == start) {
            //Normally we cannot reach this, since we are trying to grow
            throw new Error("The hashset is full")
        }

        //check for empty slot at index
        if (this.m_items[theIndex] == null) {
            this.m_items[theIndex] = this.m_isMap ? {key: key, value: value} : key;
            this.m_size++;
            return this.m_isMap ? null : true;
        }

        //the element is already present
        if (!this.m_isMap) return false;
        let old = item.value;
        item.value = value;
        return old;
    },

    contains(key) {
        let theHash = this.m_hashFunction(key);
        let theIndex  = theHash % this.m_capacity;

        //check for empty slot at index
        if (this.m_items[theIndex] == null) {
            return false;
        }

        //check if the element is already present at index
        let item = this.m_items[theIndex];
        if (this.m_equalsFunction(key, this.m_isMap ? item.key : item)) {
            return true;
        }

        //not found start linear probing
        let start = theIndex;
        do {
            theIndex = (theIndex + 1) % this.m_capacity;
        } while (
                this.m_items[theIndex] != null
            && !this.m_equalsFunction(key, this.m_isMap ? this.m_items[theIndex].key : this.m_items[theIndex])
            &&  theIndex != start
        );

        //scanned the table, the element is not in
        if (theIndex == start || this.m_items[theIndex] == null) {
            return false;
        }
        return true;
    },

    get(key) {
        let theHash = this.m_hashFunction(key);
        let theIndex  = theHash % this.m_capacity;

        //check for empty slot at index
        if (this.m_items[theIndex] == null) {
            return null;
        }

        //check if the element is already present at index
        let item = this.m_items[theIndex];
        if (this.m_equalsFunction(key, this.m_isMap ? item.key : item)) {
            return this.m_isMap ? item.value : item;
        }

        //not found start linear probing
        let start = theIndex;
        do {
            theIndex = (theIndex + 1) % this.m_capacity;
        } while (
                this.m_items[theIndex] != null
            && !this.m_equalsFunction(key, this.m_isMap ? this.m_items[theIndex].key : this.m_items[theIndex])
            &&  theIndex != start
        );

        //scanned the table, the element is not in
        if (theIndex == start || this.m_items[theIndex] == null) {
            return null;
        }
        return this.m_isMap ? this.m_items[theIndex].value : this.m_items[theIndex];
    },

    grow() {
        let newCapacity = this.m_capacity * this.m_growthFactor;
        let newArray = new Array(newCapacity);
        //copy and rehash the elements
        for (let i = 0; i<this.m_capacity; i++) {
            let item = this.m_items[i];
            if (item == null) continue;
            this.internalAddRehash(newArray, item, this.m_hashFunction(this.m_isMap ? item.key : item));
        }
        this.m_capacity = newCapacity;
        this.m_items = newArray;
    },

    //does not check for duplicates, does not change the size
    internalAddRehash(array, item, hash) {
        let theCapacity = array.length;
        let theIndex = hash % theCapacity;
        //check for empty slot at index
        if (array[theIndex] == null) {
            array[theIndex] = item;
            return;
        }

        //not found start linear probing
        let start = theIndex;
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
            array[theIndex] = item;
        }
    },
}

LinearScanHashSetPrototype.addIfAbsent  = LinearScanHashSetPrototype.add;

LinearScanHashSet.prototype             = LinearScanHashSetPrototype;
LinearScanHashSet.prototype.constructor = LinearScanHashSet;
