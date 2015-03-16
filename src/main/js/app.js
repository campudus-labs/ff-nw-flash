
var Path = require('path');
var flashTrust = require('nw-flash-trust');
var appName = 'ff-nw-flash';

try {
  // Initialization and parsing config file for given appName (if already exists).
  var trustManager = flashTrust.initSync(appName);

  trustManager.empty();
  trustManager.add(process.cwd());

} catch (err) {
  if (err.message === 'Flash Player config folder not found.') {
    // Directory needed to do the work doesn't exist.
    // Probably Flash Player is not installed, there is nothing I can do.
  }
  console.error('Problem using flash trust manager: ' + err);
}

