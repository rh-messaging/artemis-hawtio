/**
 * @module ARTEMIS
 */
var ARTEMIS = (function(ARTEMIS) {

  /**
   * @method ServerController
   * @param $scope
   * @param ARTEMISService
   *
   * Controller for the server interface
   */
  ARTEMIS.ServerController = function($element, $scope, ARTEMISService, localStorage, jolokia, $location) {
    serverAttributes = ARTEMISService.artemisConsole.getServerAttributes(jolokia).value;
    $scope.artemisServerVersion = serverAttributes.Version;

    $scope.server = {
      version: serverAttributes.Version,
      managementAddress: serverAttributes.ManagementAddress
    };
  };

  return ARTEMIS;

} (ARTEMIS || {}));
