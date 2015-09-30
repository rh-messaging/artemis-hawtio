/**
 * @module ARTEMIS
 */
var ARTEMIS = (function (ARTEMIS) {

  /**
   * @method SettingsController
   * @param $scope
   * @param ARTEMISServer
   *
   * Controller that handles the ARTEMIS settings page
   */
  ARTEMIS.SettingsController = function($scope, ARTEMISService, localStorage, jolokia, $location) {

    $scope.connecting = false;

    $scope.forms = {};

    $scope.formEntity = angular.fromJson(localStorage[ARTEMIS.SETTINGS_KEY]) || {};
    $scope.formConfig = {
      properties: {
        host: {
          description: "ARTEMIS Server Hostname",
          'type': 'java.lang.String',
          required: true
        },
        ports: {
          description: 'ARTEMIS Port',
          'type': 'Integer'
        }
      }
    };

    $scope.$watch('formEntity', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        localStorage[ARTEMIS.SETTINGS_KEY] = angular.toJson(newValue);
      }
    }, true);

    $scope.buttonText = function() {
        return "Connect";
    };

    $scope.connect = function() {
      if ($scope.forms.settings.$valid) {
        $scope.connecting = true;
        ARTEMISService.addConnectAction(function() {
          $scope.connecting = false;
          if ($location.path().startsWith("/artemis/settings")){
            $location.path("/artemis/server");
          }
        });
        ARTEMISService.getVersion(jolokia);
      }
    };

  };

  return ARTEMIS;
}(ARTEMIS || {}));
