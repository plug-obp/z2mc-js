export {alicebob0, aliceBob1, aliceBob2, peterson}

let alicebob0 = {
    model: {
        0: [1, 2],
        1: [0, 3],
        2: [0, 3],
        3: [1, 2]
    },
    initial: [0],
    aCS : (c) => c === 3,
    bCS : (c) => c === 3,
    exclusion: (c) => aCS(c) && bCS(c),
}

let aliceBob1 = {
    model: {
        0: [1, 2], //ii
        1: [4, 5], //iw
        2: [3, 5], //wi
        3: [0, 7], //ci
        4: [0, 6], //ic
        5: [], //ww
        6: [2], //wc
        7: [1]  //cw
    },
    initial: [0],
    aCS : (c) => [3, 7].includes(c),
    bCS : (c) => [4, 6].includes(c),
    aF  : (c) => [2, 3, 5, 6, 7].includes(c),
    bF  : (c) => [1, 4, 5, 6, 7].includes(c),
    exclusion: (c) => aCS(c) && bCS(c),
}

let aliceBob2 = {
    model: {
        0: [1, 2], //ii
        1: [4, 5], //iw
        2: [3, 5], //wi
        3: [0, 7], //ci
        4: [0, 6], //ic
        5: [2], //ww
        6: [2], //wc
        7: [1, 3]  //cw
    }
}
Object.setPrototypeOf(aliceBob1, aliceBob1);

let peterson = {
    model: {
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
    },
    initial: [0, 9],
    aCS : (c) => [3, 8].includes(c),
    bCS : (c) => [4, 7].includes(c),
    aF  : (c) => [2, 3, 5, 6, 7, 8].includes(c),
    bF  : (c) => [1, 4, 5, 6, 7, 8].includes(c),
    exclusion: (c) => aCS(c) && bCS(c),
}