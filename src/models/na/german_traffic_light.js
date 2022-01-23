import { NASyntax } from "../../nondeterministic-automata/nondeterministic_automata_semantics.js";
export {traffic_light_na, traffic_light_observer_false, traffic_light_observer_true};
const GREEN = 0;
const YELLOW = 1;
const RED = 2;
const REDYELLOW = 3;

function traffic_light_na() {
    return new NASyntax(
        [GREEN],
        {
            0: [{guard: (c)=>true, target: YELLOW}],    //green
            1: [{guard: (c)=>true, target: RED}],       //yellow
            2: [{guard: (c)=>true, target: REDYELLOW}], //red
            3: [{guard: (c)=>true, target: GREEN}]      //red/yellow
        },
        (c) => true,
        false
    );
}

function traffic_light_observer_false() {
    const q0 = 0, q1 = 1, qF = 2;
    return new NASyntax(
        [q0],
        {
        /*q0*/0:[ 
                {guard: (i,c) => i!==RED && i!==YELLOW, target: q0}, 
                {guard: (i,c) => i===RED,               target: q1}, 
                {guard: (i,c) => i===YELLOW && i!==RED, target: qF} ],
        /*q1*/1:[ 
                {guard: (i,c) => i===YELLOW,            target: q1}, 
                {guard: (i,c) => i!==YELLOW,            target: q0}],
        /*qF*/2:[],
        },
        (c) => c === qF,
        false
    );
}

function traffic_light_observer_true() {
    const q0 = 0, q1 = 1, qF = 2;
    return new NASyntax(
        [q0],
        {
        /*q0*/0:[ 
                {guard: (i,c) => i!==RED && i!==YELLOW, target: q0}, 
                {guard: (i,c) => i===RED,               target: qF}, 
                {guard: (i,c) => i===YELLOW && i!==RED, target: q1} ],
        /*q1*/1:[ 
                {guard: (i,c) => i===YELLOW,            target: q1}, 
                {guard: (i,c) => i!==YELLOW,            target: q0}],
        /*qF*/2:[],
        },
        (c) => c === qF,
        false
    );
}
