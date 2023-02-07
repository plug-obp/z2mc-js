import { ndfs_gs09_cdlp05 } from "./model-checkers/buchi/mc_buchi_ndfs_gs09_cdlp05.js";
import { ndfs_gs09 } from "./model-checkers/buchi/mc_buchi_ndfs_gs09.js";
import { ndfs_cvwy92_alg2 } from "./model-checkers/buchi/mc_buchi_ndfs_cvwy92_alg2.js";
import { nbfs_naive } from "./model-checkers/buchi/mc_buchi_nbfs_naive.js";
import { NASyntax, DependentNASemantics } from "./nondeterministic-automata/nondeterministic_automata_semantics.js";
import { StepSynchronousProductSemantics } from "./operators/str/synchronous_product_semantics.js";
import { STR2TR } from "./operators/str/str2tr.js";
// import { objectHash } from "./typeHasher.js"

//return {"a": c["a"], "ticketA": c["ticketA"], "b": c["b"], "ticketB": c["ticketB"]}

function bakery_na() {
    const I = "I", W = "W", CS = "CS";
    return new NASyntax(
        [{ "a": I, "ticketA": 0, "b": I, "ticketB": 0 }],
        [
            { guard: (c) => c["a"] === I, action: (c) => { return { "a": W, "ticketA": c["ticketB"] + 1, "b": c["b"], "ticketB": c["ticketB"] }; } },
            { guard: (c) => c["b"] === I, action: (c) => { return { "a": c["a"], "ticketA": c["ticketA"], "b": W, "ticketB": c["ticketA"] + 1 }; } },

            { guard: (c) => c["a"] === W && c["ticketA"] < c["ticketB"], action: (c) => { return { "a": CS, "ticketA": c["ticketA"], "b": c["b"], "ticketB": c["ticketB"] } } }, // (c) => { c["a"] = CS; }},
            { guard: (c) => c["b"] === W && c["ticketB"] <= c["ticketA"], action: (c) => { return { "a": c["a"], "ticketA": c["ticketA"], "b": CS, "ticketB": c["ticketB"] } } },

            { guard: (c) => c["a"] === CS, action: (c) => { return { "a": I, "ticketA": 0, "b": c["b"], "ticketB": c["ticketB"] } } },
            { guard: (c) => c["b"] === CS, action: (c) => { return { "a": c["a"], "ticketA": c["ticketA"], "b": I, "ticketB": 0 } } },
        ],
        (c) => true,
        false,
    );
}

function gaconfigurationHashFn(configuration) {
    return (JSON.stringify(configuration)).length;
}
function gaconfigurationEqFn(a, b) {
    return JSON.stringify(a) == JSON.stringify(b);
}


class GASemantics {
    constructor(gaSyntax) {
        this.syntax = gaSyntax;
        this.configurationHashFn = gaconfigurationHashFn;
        this.configurationEqFn = gaconfigurationEqFn;
    }

    initial() {
        return this.syntax.initial;
    }

    actions(c) {
        return this.syntax.delta.filter((rule) => rule.guard(c));
    }

    execute(rule, configuration) {
        return [rule.action(configuration)];
    }

    isAccepting(configuration) {
        return this.syntax.accepting(configuration);
    }
}


//property

function atLeastOneInCS() {
    const q0 = 0, qF = 1;
    const I = "I", W = "W", CS = "CS";
    return new NASyntax(
        [q0],
        {
        /*q0*/0: [
                { guard: (i, c) => c === q0 && !(i.s["a"] === CS || i.s["b"] === CS), target: qF },
                { guard: (i, c) => c === q0, target: q0 },
            ],
        /*qF*/1: [
                { guard: (i, c) => c === qF && !(i.s["a"] === CS || i.s["b"] === CS), target: qF },
            ],
        },
        (c) => c === qF,
        false
    );
}


let modelSemantics = new GASemantics(bakery_na());
let propertySemantics = new DependentNASemantics(atLeastOneInCS());
let productSemantics = new StepSynchronousProductSemantics(modelSemantics, propertySemantics);
let tr = new STR2TR(productSemantics);

let naiveResult = await nbfs_naive(
    await tr.initial(), async (c) => await tr.next(c), async (c) => c,
    async (c) => await tr.isAccepting(c),
    (c) => tr.configurationHashFn(c), async (a, b) => await tr.configurationEqFn(a, b));

console.log(naiveResult);

// let cvwy92Result = await ndfs_cvwy92_alg2(
//     await tr.initial(), async (c) => await tr.next(c), async (c) => c,
//     async (c) => await tr.isAccepting(c),
//     (c) => tr.configurationHashFn(c), (a, b) => tr.configurationEqFn(a, b));

// console.log(cvwy92Result);

let gs09Result = await ndfs_gs09(
    await tr.initial(), async (c) => await tr.next(c), async (c) => c,
    async (c) => await tr.isAccepting(c),
    (c) => tr.configurationHashFn(c), (a, b) => tr.configurationEqFn(a, b));

console.log(gs09Result);

let gs09cdlp05Result = await ndfs_gs09_cdlp05(
    await tr.initial(), async (c) => await tr.next(c), async (c) => c,
    async (c) => await tr.isAccepting(c),
    (c) => tr.configurationHashFn(c), (a, b) => tr.configurationEqFn(a, b));

console.log(gs09cdlp05Result);

console.log("end");