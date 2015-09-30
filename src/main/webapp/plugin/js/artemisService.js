/**
 * @module ARTEMIS
 */
var ARTEMIS = (function(ARTEMIS) {

  ARTEMIS.SERVER = 'Server Messages';


  // The ARTEMIS service handles the connection to
  // the Artemis Jolokia server in the background
  ARTEMIS.module.factory("ARTEMISService", function(jolokia, $rootScope) {
    var self = {
      artemisConsole: undefined,

      getVersion: function(jolokia) {
        ARTEMIS.log.info("Connecting to ARTEMIS service: " + self.artemisConsole.getServerAttributes(jolokia));
      } ,
      initArtemis: function() {
        ARTEMIS.log.info("*************creating Artemis Console************");
        self.artemisConsole = new ArtemisConsole();
      }
    };

    return self;
  });

  return ARTEMIS;
}(ARTEMIS || {}));
