"use strict";
/*
    Use non-default job profile
    Take a task constructor
    Take a list as inputs
    map task on list
*/
Object.defineProperty(exports, "__esModule", { value: true });
const jobManager = require("ms-jobmanager");
const dummyTask = require("./dummyTask");
const dummyTask_s2 = require("./dummyTask_s2");
const dummyTask_s3 = require("./dummyTask_s3");
const logger_js_1 = require("../logger.js");
const utils = require("util");
const index_1 = require("../index");
const program = require("commander");
program
    .version('0.1.0')
    .option('-a, --basic', 'one map test')
    .option('-b,--map2map', 'map into map')
    .option('-c, --map2map2', 'map into a map 2, ie injecting input vector')
    .option('-d, --map2map2i', 'map into a map 2, injecting variable and input vectors')
    .option('-d, --map2map2j', 'map into a map 2, injecting variable, input vectors and jobProfile')
    .option('-t, --templating', 'use template to generate variables or inputs vectors')
    .option('-i, --inverse', 'Apply a single set of inputs on a task iteree')
    .option('-n, --size <n>', 'map size (default=4)', parseInt)
    .option('-v, --verbosity [logLevel]', 'Set log level', logger_js_1.setLogLevel, 'info')
    .parse(process.argv);
//console.dir(utils.format(logger));
logger_js_1.logger.debug("\t\tStarting map test");
/*
    Generate a bunch of random integer inputs, as two arrays
    later used as domain of the maps
*/
let n = program.size ? program.size : 4;
let inputs = [];
let inputs2 = [];
for (let i = 0; i < n; i++) {
    let x = Math.floor(Math.random() * 100);
    inputs.push({ "dummyInput": x.toString() });
    inputs2.push({ "dummyInput_s3b": x.toString() });
}
let myOptions = inputs.map((e, i) => {
    return { 'logLevel': 'info', 'exportVar': { 'iterValue': i } };
});
jobManager.start({ "TCPip": "localhost", "port": "2323" })
    .on("ready", () => {
    // process.exit();
    let myManagement = {
        'jobManager': jobManager,
        'jobProfile': 'dummy'
    };
    //logger.info(`my managment litteral:\n${utils.format(myManagement)}`);
    /*
    let myOptions = {
        'logLevel': 'debug'/*,
        'modules' : ['myModule1', 'myModule2'],
        'exportVar' : { 'myVar1' : '/an/awesome/path/to/a/file.exe'},
    };*/
    /*
    let dTask = new dummyTask.Task(myManagement, myOptions);
    let dTask_s2 = new dummyTask_s2.Task(myManagement, myOptions);
*/
    function display(d) {
        logger_js_1.logger.info(`Chain joined OUTPUT:\n${utils.format(d)}`);
    }
    if (program.inverse) {
        /*
            A single input // try to mess w/ keys symbol to asses check procedure
            Generate a list of task, 3 explicit for a start
            call map
        */
        let myInput = { dummyInput_s2: "2", dummyInput: "2", dummyInput_s3a: "2", dummyInput_s3b: "2" };
        let myTasks = [dummyTask.Task, dummyTask_s2.Task, dummyTask_s3.Task];
        index_1.map(myManagement, myInput, myTasks).join(display);
    }
    if (program.basic) {
        logger_js_1.logger.info(`Basic map test`);
        index_1.map(myManagement, inputs, dummyTask.Task).join(display);
    }
    else if (program.map2map) {
        logger_js_1.logger.info(`piping a map into a map_1 (no additional args)`);
        index_1.map(myManagement, inputs, dummyTask.Task)
            .map(dummyTask_s2.Task).join(display);
    }
    else if (program.map2map2) {
        let addInput = program.templating ? inputs2[0] : inputs2;
        if (program.templating)
            logger_js_1.logger.info(`piping a map into a map_2 (additional inputs explicit)`);
        else
            logger_js_1.logger.info(`piping a map into a map_2 (additional inputs by template)`);
        index_1.map(myManagement, inputs, dummyTask.Task)
            .map(dummyTask_s2.Task)
            .map(dummyTask_s3.Task, addInput).join(display);
    }
    else if (program.map2map2i) {
        let addInput = program.templating ? inputs2[0] : inputs2;
        let addOPt = program.templating ? myOptions[0] : myOptions;
        if (program.templating)
            logger_js_1.logger.info(`piping a map into a map_2 (additional inputs and variables explicit) `);
        else
            logger_js_1.logger.info(`piping a map into a map_2 (additional inputs and variables by template)`);
        index_1.map(myManagement, inputs, dummyTask.Task, addOPt)
            .map(dummyTask_s2.Task, addOPt)
            .map(dummyTask_s3.Task, addInput, addOPt).join(display);
    }
    else if (program.map2map2j) {
        let addInput = program.templating ? inputs2[0] : inputs2;
        let addOPt = program.templating ? myOptions[0] : myOptions;
        if (program.templating)
            logger_js_1.logger.info(`piping a map into a map_2 w/ specific jobProfile (additional inputs and variables explicit) `);
        else
            logger_js_1.logger.info(`piping a map into a map_2  w/ specific jobProfile (additional inputs and variables by template)`);
        index_1.map(myManagement, inputs, dummyTask.Task, addOPt)
            .map(dummyTask_s2.Task, addOPt, 'default')
            .map(dummyTask_s3.Task, addInput, addOPt, 'default').join(display);
    }
    // pipeMapping w/ a new JobOpt iteree args
    //  map(myManagement, <any[]>inputs, dummyTask.Task)
    //  .map(dummyTask_s2.Task, myOptions)
    /*
      let aFirstInput = "2";
      let rs = new stream.Readable();
      rs.push( JSON.stringify({ "dummyInput":aFirstInput }) ); // JSON format
      rs.push(null);
  
      rs.pipe(dTask.dummyInput);
  
      dTask.on('processed', res => {
          console.log("I have my results :");
          console.log(res);
      })
      */
});
