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

export {STR2TR}

class STR2TR {
    constructor(aSTR) {
        this.operand = aSTR;
    }
    initial() {
        return this.operand.initial();
    }
    async next(source) {
        let tr_targets = [];
        let actions = await this.operand.actions(source);
        for (let action of actions) {
            let targets = await this.operand.execute(action, source);
            tr_targets.push(...targets);
        }
        return tr_targets;
    }
    isAccepting(c) {
        return this.operand.isAccepting(c);
    }
    
    configurationHashFn(c) {
        return this.operand.configurationHashFn(c);
    }
    configurationEqFn(a, b){
        return this.operand.configurationEqFn(a, b);
    }
}
