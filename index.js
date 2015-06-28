var app = require('./lib/app');
var logger = require('winston');

var port = process.env.PORT || 3000;

app.listen(port, function() {
  logger.info('listening on ' + port  );
});
