/*
    Use non-default job profile
    Take a task constructor
    Take a list as inputs
    map task on list
*/

import jobManager = require('ms-jobmanager');
import dummyTask = require('./dummyTask');
import dummyTask_s2 = require('./dummyTask_s2');
import stream = require('stream');
import {logger, setLogLevel} from '../logger.js';
import utils = require('util');

import {map} from '../index';


logger.info("\t\tStarting map test");


let inputs:any[] = ["5", "10", "4", "2"];
inputs = inputs.map((e) => {return { "dummyInput":e };});
/*

*/
jobManager.start({ "TCPip": "localhost", "port": "2323" })
    .on("ready", () => {
    let myManagement = {
        'jobManager' : jobManager,
        'jobProfile' : 'dummy'
    }
    let myOptions = inputs.map((e, i)=>{
        return { 'logLevel': 'debug', 'exportVar' : { 'iterValue' :  i } };
    });
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

map(myManagement, <any[]>inputs, dummyTask.Task).join( (data) => {
        logger.info(`${ utils.format(data) }`);
    });


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