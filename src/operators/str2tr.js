export {STR2TR}

class STR2TR {
    constructor(aSTR) {
        this.operand = aSTR;
        this.initial = this.operand.initial;
        this.isAccepting = this.operand.isAccepting;
        this.configurationHashFn = this.operand.configurationHashFn;
        this.configurationEqFn = this.operand.configurationEqFn;
    }
    next(source) {
        let targets = [];
        let actions = this.operand.actions(source);
        for (let action of actions) {
            targets = this.operand.execute(action, source);
            targets.push(...targets);
        }
        return targets;
    }
}