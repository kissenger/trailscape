
/**
 * This test imports test route, creates a Path object and compares the calculated
 * path properties against our expectations
 */


import { use } from "chai";
import { expect } from 'chai';
import chaiAsPromised from "chai-as-promised";
use(chaiAsPromised);

import { Route } from './_Path';
import { readFile } from 'fs';


before( function() {
  return getTests('./data/_test-def.js').then( function(T) {
    console.log(T);
    testList = T;
  })
})

it('shoud equal 1', function () { // a hack to get the 'before' to deliver promisified data

  let testWithData = function (test) {
    // this is a closure to define the actual tests - needed to cope with a loop of tests each with promises

    return function () {
      before( function() {
        this.timeout(30000);
        return getPath('./test-data/'+test.filename+'.js').then(function(P) {
          pathInfo = P.asMongoObject().info;
          console.log(pathInfo.category, pathInfo.direction)
        });
      });

      it('should have category ' + test.category, function() {
        expect(pathInfo.category).to.equal(test.category);
      });

      it('should have direction ' + test.direction === "" ? "none": test.direction, function() {
          expect(pathInfo.direction).to.equal(test.direction);
      });
    };
  }; // testWithData

  testList.forEach( function(testInfo) {
    // this loops through all the provided test cases, using the closure as an argument
    describe("Testing file: " + testInfo.filename , testWithData(testInfo));
  });

}) // it (hack)

function getPath(fn) {
  // returns Path object created from gpx import stored in provided file
  return new Promise ( (res, rej) => {
    readFile(fn, (err, data) => {
      const testObject = JSON.parse(data);
      // console.log(testObject);
      const path = new Route(testObject.nameOfPath, undefined, testObject.lngLat, testObject.elev);
      path.init().then( () => res(path));

    });
  })
}

function getTests(fn) {
  return new Promise ( (res, rej) => {
    readFile(fn, (err, data) => {
      res(JSON.parse(data));
    });
  })
}
