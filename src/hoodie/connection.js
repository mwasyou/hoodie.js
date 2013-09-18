/* exported hoodieConnection */

//
// hoodie.checkConnection() & hoodie.isConnected()
// =================================================

var hoodie = require('../hoodie');

// state
var online = true;
var checkConnectionInterval = 30000;
var checkConnectionRequest = null;
var checkConnectionTimeout = null;

// Check Connection
// ------------------

// the `checkConnection` method is used, well, to check if
// the hoodie backend is reachable at `baseUrl` or not.
// Check Connection is automatically called on startup
// and then each 30 seconds. If it fails, it
//
// - sets `online = false`
// - triggers `offline` event
// - sets `checkConnectionInterval = 3000`
//
// when connection can be reestablished, it
//
// - sets `online = true`
// - triggers `online` event
// - sets `checkConnectionInterval = 30000`
//
var checkConnection = function checkConnection() {
  var req = checkConnectionRequest;

  if (req && req.state() === 'pending') {
    return req;
  }

  window.clearTimeout(checkConnectionTimeout);

  checkConnectionRequest = hoodie.request('GET', '/').then(
    handleCheckConnectionSuccess,
    handleCheckConnectionError
  );

  return checkConnectionRequest;
};


// isConnected
// -------------

//
var isConnected = function isConnected() {
  return online;
};


//
//
//
function handleCheckConnectionSuccess() {
  checkConnectionInterval = 30000;

  checkConnectionTimeout = window.setTimeout(hoodie.checkConnection, checkConnectionInterval);

  if (!hoodie.isConnected()) {
    hoodie.trigger('reconnected');
    online = true;
  }

  return hoodie.resolve();
}


//
//
//
function handleCheckConnectionError() {
  checkConnectionInterval = 3000;

  checkConnectionTimeout = window.setTimeout(hoodie.checkConnection, checkConnectionInterval);

  if (hoodie.isConnected()) {
    hoodie.trigger('disconnected');
    online = false;
  }

  return hoodie.reject();
}

module.exports = {
  checkConnection: checkConnection,
  isConnected: isConnected
};
