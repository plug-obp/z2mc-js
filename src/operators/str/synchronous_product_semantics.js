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

export {StateSynchronousProductSemantics, StepSynchronousProductSemantics, STUTTERING}

class StateSynchronousProductSemantics {
    constructor(lhs, rhs) {
        this.lhs = lhs;
        this.rhs = rhs;
    }

    configurationHashFn (configuration) {
        let { lc, rc } = configuration;
        let seed = this.lhs.configurationHashFn(lc);
        let value = this.rhs.configurationHashFn(rc);
        seed ^= value + 0x9e3779b9 + (seed << 6) + (seed >> 2);
        return seed;
    }

    configurationEqFn(x, y) {
        let { lc:xlc, rc:xrc } = x;
        let { lc:ylc, rc:yrc } = y;
        return this.lhs.configurationEqFn(xlc, ylc) && this.buchi.configurationEqFn(xrc, yrc);
    };

    async initial() {
        return await this.rhs.initial().map((abc) => ({ lc: null, rc: abc }));
    }

    async actions(source) {
        let { lc: l_source, rc: r_source } = source;
        let synchronous_actions = [];
        //initial case: the kripke configuration is None -- the synthetic configuration introduced by the kripke2buchi
        if (l_source == null) {
            for (let l_target of await this.lhs.initial()) {
                await getSynchronousActions(this.buchi, l_target, r_source, synchronous_actions);
            }
            return synchronous_actions;
        }
        //the normal case: the kripke has a step, find the corresponding step in the buchi automaton
        let l_actions = await this.lhs.actions(l_source);
        let number_of_actions = l_actions.length; //used to detect deadlock
        for (let l_action of l_actions) {
            let l_targets = await this.lhs.execute(l_action, l_source);
            if (l_targets.length == 0) {
                number_of_actions -= 1;
                continue;
            }
            for (let l_target of l_targets) {
                await getSynchronousActions(this.buchi, l_target, r_source, synchronous_actions);
            }
        }
        //the deadlock case: the kripke does not have a step, add stuttering
        if (number_of_actions == 0) {
            await getSynchronousActions(this.rhs, l_source, r_source, synchronous_actions);
        }
        return synchronous_actions;
    }

    async execute(action, configuration) {
        let { lo: l_target, ra: r_action } = action;
        let { lc: _, rc: r_source } = configuration;
        let r_targets = await this.rhs.execute(r_action, l_target, r_source);
        return r_targets.map((abc) => ({ lc: kripke_target, rc: abc }));
    }

    async isAccepting(configuration) {
        let { lc, rc } = configuration;
        return await this.lhs.isAccepting(lc) && await this.rhs.isAccepting(rc);
    }
}

async function getSynchronousActions(r_semantics, l_output, r_config, io_synchronous_actions) {
    let r_actions = await r_semantics.actions(l_output, r_config);
    let synchronous_actions = r_actions.map( (r_action) => ({lo: l_output, ra: r_action}) );
    io_synchronous_actions.push(...synchronous_actions);
    return;
}
const STUTTERING = {};
class StepSynchronousProductSemantics {
    constructor(kripke, buchi) {
        this.kripke = kripke;
        this.buchi = buchi;
    }

    configurationHashFn (configuration) {
        let { kc, bc } = configuration;
        let seed = this.kripke.configurationHashFn(kc);
        let value = this.buchi.configurationHashFn(bc);
        seed ^= value + 0x9e3779b9 + (seed << 6) + (seed >> 2);
        return seed;
    }

    configurationEqFn(x, y) {
        let { kc:xkc,bc: xbc } = x;
        let { kc:ykc, bc:ybc } = y;
        return this.kripke.configurationEqFn(xkc, ykc) && this.buchi.configurationEqFn(xbc, ybc);
    };

    async initial() {
        let initial_configurations = [];
        for (let kripke_config of await this.kripke.initial()) {
            for (let buchi_config of await this.buchi.initial()) {
                initial_configurations.push({ kc: kripke_config, bc: buchi_config });
            }
        }
        return initial_configurations;
    }

    async actions(source) {
        let { kc: kripke_source, bc: buchi_source } = source;
        let synchronous_actions = [];
        //the normal case: the kripke has a step, find the corresponding step in the buchi automaton
        let kripke_actions = await this.kripke.actions(kripke_source);
        let number_of_actions = kripke_actions.length; //used to detect deadlock
        for (let kripke_action of kripke_actions) {
            let kripke_targets = await this.kripke.execute(kripke_action, kripke_source);
            if (kripke_targets.length == 0) {
                number_of_actions -= 1;
                continue;
            }
            for (let kripke_target of kripke_targets) {
                let kripke_step = { s: kripke_source, a: kripke_action, t: kripke_target };
                await getSynchronousActions(this.buchi, kripke_step, buchi_source, synchronous_actions);
            }
        }
        //the deadlock case: the kripke does not have a step, add stuttering
        if (number_of_actions == 0) {
            let kripke_step = { s: kripke_source, a: STUTTERING, t: kripke_source };
            await getSynchronousActions(this.buchi, kripke_step, buchi_source, synchronous_actions);
        }
        return synchronous_actions;
    }

    async execute(action, configuration) {
        let { ko: kripke_step, ba: buchi_action } = action;
        let { kc: kc, bc: buchi_source } = configuration;
        let { s: s, a: a, t: kripke_target } = kripke_step;
        let buchi_targets = await this.buchi.execute(buchi_action, kripke_step, buchi_source);
        return buchi_targets.map((abc) => ({ kc: kripke_target, bc: abc }));
    }

    async isAccepting(configuration) {
        let { kc, bc } = configuration;
        return await this.kripke.isAccepting(kc) && await this.buchi.isAccepting(bc);
    }
}

