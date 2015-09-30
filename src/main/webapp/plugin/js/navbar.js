/**
 * @module ARTEMIS
 */
var ARTEMIS = (function (ARTEMIS) {

  /**
   * @property breadcrumbs
   * @type {{content: string, title: string, isValid: isValid, href: string}[]}
   *
   * Data structure that defines the sub-level tabs for
   * our plugin, used by the navbar controller to show
   * or hide tabs based on some criteria
   */
  ARTEMIS.breadcrumbs = [
    {
      content: '<i class="icon-comments"></i> Server',
      title: "Connect to ARTEMIS",
      isValid: function (ARTEMISService) { return true; },
      href: "#/artemis/server"
    },
    {
      content: '<i class="icon-cogs"></i> Settings',
      title: "Set up your ARTEMIS connection",
      isValid: function (ARTEMISService) { return true; },
      href: "#/artemis/settings"
    }
  ];

  /**
   * @function NavBarController
   *
   * @param $scope
   * @param workspace
   *
   * The controller for this plugin's navigation bar
   *
   */
  ARTEMIS.NavBarController = function($scope, ARTEMISService, $location) {

    if ($location.path().startsWith("/artemis/server")) {
      $location.path("/artemis/settings");
    }

    $scope.breadcrumbs = ARTEMIS.breadcrumbs;

    $scope.isValid = function(link) {
      return link.isValid(ARTEMISService);
    };

  };

  return ARTEMIS;

} (ARTEMIS || {}));
