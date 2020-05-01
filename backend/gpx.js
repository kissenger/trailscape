import { writeFile, createWriteStream } from 'fs';
import * as globals from './globals.js';
import { debugMsg } from './utilities.js';

 /**
  * readGPX(data)
  * @param {*} data input data from multer file read
  * @param return object containing path name, coords, elevs and timestamp
  * Parses track data from a provided GPX file.
  * Does not distiguish between a route and a track - it disguards this knowledge
  * and simplyy returns an object with supported parameters
  */
function readGPX(data) {
  debugMsg('readGPX()');

  // declare function variables
  const MAX_LOOPS = 1000000;
  var a = 0;                          // start of interesting feature
  var b = data.indexOf("\r",a);       // end of interesting feature
  var latValue, lngValue, eleValue, timeValue;
  let lngLat = [];
  let time = [];
  let elev = [];
  let nameOfPath = "";

  /**
   * Loop through each line until we find track or route start
   */
  for (let i = 0; i < MAX_LOOPS; i++) {

    lineData = data.slice(a,b)
    a = b + 2;
    b = data.indexOf("\r",a);

    if ( lineData.indexOf("<trk>") !== -1 ) {
      typeOfPath = "track";
      typeTag = "trkpt";
      break;
    }

    if ( lineData.indexOf("<rte>") !== -1 ) {
      typeOfPath = "route";
      typeTag = "rtept";
      break;
    }

  }

  //  Try to find a name
  lineData = data.slice(a,b)
  a = lineData.indexOf("<name>");
  b = lineData.indexOf("</name>");
  if ( a !== -1 && b !== -1 ) {
    nameOfPath = lineData.slice(a + 6, b);
  }

  /**
   *  Loop through each point in this segment
   */

  ptEnd = b;
  for (let i = 0; i < MAX_LOOPS; i++) {

    // get the start and end of the current track point, break from loop if not found
    ptStart = data.indexOf('<' + typeTag,ptEnd);  // find the next tag opener
    a = data.indexOf('</' + typeTag,ptStart);     // find regular tag closure
    b = data.indexOf('/>',ptStart);               // find self-closing tag

    if ( ptStart == -1 || ( a == -1 && b == -1) ) break;  // one of the above wasnt found

    if ( a != -1 && b != -1 ) {
      // if both closures are found, take the nearest one
      ptEnd = Math.min(a,b);
    } else if ( a == -1 || b == -1 ) {
      // if one or other closure was not found, take the one that was found
      ptEnd = Math.max(a,b);
    };

    ptData = data.slice(ptStart,ptEnd)

    // lat and long
    a = ptData.indexOf("lat=");
    b = ptData.indexOf("lon=");
    c = ptData.indexOf(">");         // end of line lat/long line to ensure elev numbers arent captured

    if ( a !== -1 && b !== -1 ) {
      if ( b > a ) {
        latValue = parseFloat(ptData.slice(a, b).match(/[-0123456789.]/g).join(""));
        lngValue = parseFloat(ptData.slice(b, c).match(/[-0123456789.]/g).join(""));
      } else {
        lngValue = parseFloat(ptData.slice(b, a).match(/[-0123456789.]/g).join(""));
        latValue = parseFloat(ptData.slice(a, c).match(/[-0123456789.]/g).join(""));
      }
    }
    lngLat.push([lngValue, latValue]);

    // elevation
    eleValue = '';
    a = ptData.indexOf("<ele>");
    b = ptData.indexOf("</ele>");
    if (a != -1 && b != -1) {
      eleValue = parseFloat(ptData.slice(a,b).match(/[-0123456789.]/g).join(""));
      // isElev = true;
    }
    elev.push(eleValue);

    // time
    timeValue = '';
    a = ptData.indexOf("<time>");
    b = ptData.indexOf("</time>");
    if (a != -1 && b != -1) {
      timeValue = ptData.slice(a,b).match(/[-0123456789.TZ:]/g).join("");
      // isTime = true;
    }
    time.push(timeValue);
  }

  // if elevation array is incomplete, then discard them - if necessary they'll get populated from DEM later
  for (let i = 0, n = lngLat.length - 1; i < n; i++) {
    elev = [];
  }

  if (lngLat.length === 0) {
    throw new Error('Error reading .gpx file');
  }

  // form return object so we can use it for debugMsg as well as return
  const returnObject = {
    name: nameOfPath,
    lngLat: lngLat,
    elev: elev,
    time: time,
  };

  // print to console and dump to file to support testing/debugging
  if (globals.DEBUG) {
    debugMsg('readGPX() finished!');
    writeFile("../gpx_dump.js", JSON.stringify(returnObject), (err) => {} );
  };

  return returnObject;
}



/**
 * writeGpx
 *
 * Purpose is to write path data to gpx file
 *
 */

function writeGPX(path){

  debugMsg('writeGPX()');

  return new Promise( (resolve, reject) => {

    const creator = 'Trailscape https://kissenger.github.io/trailscape/';
    const xmlns = 'http://www.topografix.com/GPX/1/0';

    const fileName = path.name !== "" ? path.name : path.category + ' ' + path.pathType;
    const file = createWriteStream('../' + fileName + '.gpx');
    const s = '   ';
    const eol = '\r\n'

    file.on('finish', () => { resolve(true) });
    file.on('error', reject);
    file.on('open', () => {

      file.write(s.repeat(0) + "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + eol);
      file.write(s.repeat(0) + "<gpx version=\"1.1\" creator=\"" + creator + "\" xmlns=\"" + xmlns + "\">" + eol);
      file.write(s.repeat(1) + "<rte>" + eol);
      file.write(s.repeat(2) + "<name>" + path.name + "</name>" + eol);

      path.lngLat.forEach( (lngLat, i) => {

        if ( path.elevs[i] ) {
          // elevation data exists, use conventional tag
          file.write(s.repeat(2) + "<rtept lat=\"" + lngLat[1] + "\" lon=\"" + lngLat[0] + "\">" + eol);
          file.write(s.repeat(3) + "<ele>" + path.elevs[i] + "</ele>" + eol);
          file.write(s.repeat(2) + "</rtept>" + eol);

        } else {
          // only lat/lon exists, use self-closing tag
          file.write(s.repeat(2) + "<rtept lat=\"" + lngLat[1] + "\" lon=\"" + lngLat[0] + "\" />" + eol);

        }

      });

      file.write(s.repeat(1) + "</rte>" + eol);
      file.write(s.repeat(0) + "</gpx>");

      file.finish;
      resolve(fileName);
    });

    debugMsg('writeGPX() finished');
  })

}


/**
 * export geoJson to file - for debugging
 * @param {Path} path
 */
// function exportGeoJSON(geoJSON) {

//   const fs = require('fs');

//   JSON.stringify(geoJSON)
//   fs.writeFile('../myjsonfile.json', JSON.stringify(geoJSON), 'utf8', (err) => {console.log(err)});

// }


/**
 * export data to CSV - For debugging
 * @param {Path} path
 */
// function exportCSV(path) {

//   const fs = require('fs');
//   let file = fs.createWriteStream("../node.out");

//   path.points.forEach ( point => {
//     file.write([point.lng, point.lat, point.time, point.elev].join(',') + '\n')
//   })

// }


export { readGPX, writeGPX };
