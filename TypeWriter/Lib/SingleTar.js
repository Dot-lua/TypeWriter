//https://github.com/isaacs/node-tar/issues/181#issuecomment-1153196779

var tar = require('tar');

function extractFileFromTarball(tarpath, filename) {
  var nentries = 0;
  var data = [];
  var onentry = entry => {
    nentries++;
    if (nentries % 1e4 === 0) { console.log('nentries=' + nentries); }
    if (entry.path === filename) { entry.on('data', c => data.push(c)); }
  };
  tar.t({onentry, file: tarpath, sync: true});
  var buf = Buffer.concat(data);
  return buf.toString('binary');
}

module.exports = extractFileFromTarball