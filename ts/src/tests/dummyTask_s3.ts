import tk = require('taskobject');
declare var __dirname; // mandatory

export class Task extends tk.Task {
	public readonly dummyInput_s2;

    constructor(management, options) {
        super(management, options); // (1)
            this.rootdir = __dirname; // (2)

            this.coreScript = this.rootdir + '/../../data/dummyCoreScript_s2.sh'; // (3)
            
            this.slotSymbols = ['dummyInput_s3a', 'dummyInput_s3b']; // (4)
            super.initSlots(); // (5)
        }
        prepareJob (inputs) {
            return super.configJob(inputs);
        }

        /* REMARK : 'pathOfCurrentDir' is the key you gave in your core script as JSON output */
        prepareResults (chunkJson) {
            return {
                [this.outKey] : chunkJson.dummyOutput_s3 
            }
        }
}