/**
 * @module ARTEMIS
 */
var ARTEMIS = (function(ARTEMIS) {

   /**
    * @method PreferencesController
    * @param $scope
    *
    * Controller for the Preferences interface
    */
   ARTEMIS.PreferencesController = function ($scope, localStorage, userDetails, $rootScope) {
      Core.initPreferenceScope($scope, localStorage, {
         'artemisUserName': {
            'value': userDetails.username
         },
         'artemisPassword': {
            'value': userDetails.password
         },
         'artemisDLQ': {
            'value': "DLQ"
         },
         'artemisExpiryQueue': {
            'value': "ExpiryQueue"
         },
         'artemisBrowseBytesMessages': {
            'value': 1,
            'converter': parseInt,
            'formatter': function (value) {
               return "" + value;
            }
         }
      });
   };

   return ARTEMIS;

}(ARTEMIS || {}));