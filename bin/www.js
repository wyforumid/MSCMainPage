#!/usr/bin/env node
var debug = require('debug')('MSCMainPage');
var app = require('../app');

// app.set('port', process.env.PORT || 3000);
app.set('port', process.env.PORT);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});
