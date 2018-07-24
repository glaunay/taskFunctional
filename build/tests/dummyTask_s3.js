"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tk = require("taskobject");
class DummyTask3 extends tk.Task {
    constructor(management, options) {
        super(management, options); // (1)
        this.rootdir = __dirname; // (2)
        this.coreScript = this.rootdir + '/../../data/dummyCoreScript_s3.sh'; // (3)
        this.slotSymbols = ['dummyInput_s3a', 'dummyInput_s3b']; // (4)
        super.initSlots(); // (5)
    }
    prepareJob(inputs) {
        return super.configJob(inputs);
    }
    /* REMARK : 'pathOfCurrentDir' is the key you gave in your core script as JSON output */
    prepareResults(chunkJson) {
        return {
            [this.outKey]: chunkJson.dummyOutput_s3
        };
    }
}
exports.DummyTask3 = DummyTask3;
exports.Task = DummyTask3;
