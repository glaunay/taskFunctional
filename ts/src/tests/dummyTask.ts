import tk = require('taskobject');
declare var __dirname; // mandatory



export {DummyTask as Task}

export class DummyTask extends tk.Task {
	public readonly dummyInput;

    constructor(management, options) {
        console.dir(management);
        super(management, options); // (1)
            this.rootdir = __dirname; // (2)

            this.coreScript = this.rootdir + '/../../data/dummyCoreScript.sh'; // (3)
            
            this.slotSymbols = ['dummyInput']; // (4)
            super.initSlots(); // (5)
        }
        prepareJob (inputs) {
            return super.configJob(inputs);
        }

        /* REMARK : 'pathOfCurrentDir' is the key you gave in your core script as JSON output */
        prepareResults (chunkJson) {
            return {
                [this.outKey] : chunkJson.dummyOutput 
            }
        }
}