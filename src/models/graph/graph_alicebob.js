export {aliceBob0, aliceBob1, aliceBob2, peterson}

function aliceBob0() {
    this.ss = {
        0: [1, 2],
        1: [0, 3],
        2: [0, 3],
        3: [1, 2]
    };
    this.initial = [0];
    this.aCS = (c) => c === 3;
    this.bCS = (c) => c === 3;
    this.exclusion = (c) => this.aCS(c) && this.bCS(c);
}
// alicebob0.prototype = {}
// alicebob0.prototype.constructor = alicebob0;

function aliceBob1() {
    this.ss= {
        0: [1, 2], //ii
        1: [4, 5], //iw
        2: [3, 5], //wi
        3: [0, 7], //ci
        4: [0, 6], //ic
        5: [], //ww
        6: [2], //wc
        7: [1]  //cw
    };
    this.initial= [0];
    this.aCS = (c) => [3, 7].includes(c);
    this.bCS = (c) => [4, 6].includes(c);
    this.aF  = (c) => [2, 3, 5, 6, 7].includes(c);
    this.bF  = (c) => [1, 4, 5, 6, 7].includes(c);
    this.exclusion = (c) => this.aCS(c) && this.bCS(c);
}

function aliceBob2() {
    this.ss = {
        0: [1, 2], //ii
        1: [4, 5], //iw
        2: [3, 5], //wi
        3: [0, 7], //ci
        4: [0, 6], //ic
        5: [2], //ww
        6: [2], //wc
        7: [1, 3]  //cw
    };
    this.initial= [0];
    this.aCS = (c) => [3, 7].includes(c);
    this.bCS = (c) => [4, 6].includes(c);
    this.aF  = (c) => [2, 3, 5, 6, 7].includes(c);
    this.bF  = (c) => [1, 4, 5, 6, 7].includes(c);
    this.exclusion = (c) => this.aCS(c) && this.bCS(c);
}
// Object.setPrototypeOf(aliceBob2, aliceBob1);
// aliceBob2.prototype = aliceBob1;

function peterson() {
    this.ss= {
        0: [1, 2], //ii0
        1: [4, 5], //iw
        2: [3, 6], //wi
        3: [8, 9], //ci
        4: [7, 0], //ic
        5: [7], //ww1
        6: [8], //ww0
        7: [2], //wc
        8: [1], //cw
        9: [1,2], //ii1
    };
    this.initial= [0, 9];
    this.aCS = (c) => [3, 8].includes(c);
    this.bCS = (c) => [4, 7].includes(c);
    this.aF  = (c) => [2, 3, 5, 6, 7, 8].includes(c);
    this.bF  = (c) => [1, 4, 5, 6, 7, 8].includes(c);
    this.exclusion= (c) => this.aCS(c) && this.bCS(c);
}