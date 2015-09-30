/**
 * @module ARTEMIS
 * @main ARTEMIS
 *
 * The main entrypoint for the ARTEMIS module
 *
 */
var ARTEMIS = (function(ARTEMIS) {

  /**
   * @property pluginName
   * @type {string}
   *
   * The name of this plugin
   */
  ARTEMIS.pluginName = "ARTEMIS";

  /**
   * @property log
   * @type {Logging.Logger}
   *
   * This plugin's logger instance
   */
  ARTEMIS.log = Logger.get(ARTEMIS.pluginName);

  /**
   * @property templatePath
   * @type {string}
   *
   * The top level path to this plugin's partials
   */
  ARTEMIS.templatePath = "../artemis-plugin/plugin/html/";

  /**
   * @property jmxDomain
   * @type {string}
   *
   * The JMX domain this plugin mostly works with
   */
  ARTEMIS.jmxDomain = "hawtio"

  /**
   * @property mbeanType
   * @type {string}
   *
   * The mbean type this plugin will work with
   */
  ARTEMIS.mbeanType = "ARTEMISHandler";

  /**
   * @property mbean
   * @type {string}
   *
   * The mbean's full object name
   */
  ARTEMIS.mbean = ARTEMIS.jmxDomain + ":type=" + ARTEMIS.mbeanType;

  /**
   * @property SETTINGS_KEY
   * @type {string}
   *
   * The key used to fetch our settings from local storage
   */
  ARTEMIS.SETTINGS_KEY = 'ARTEMISSettings';

  /**
   * @property module
   * @type {object}
   *
   * This plugin's angularjs module instance
   */
  ARTEMIS.module = angular.module(ARTEMIS.pluginName, ['hawtioCore', 'hawtio-ui', 'hawtio-forms', 'luegg.directives']);

  // set up the routing for this plugin
  ARTEMIS.module.config(function($routeProvider) {
    $routeProvider
        .when('/artemis/server', {
          templateUrl: ARTEMIS.templatePath + 'artemis.html'
        })
        .when('/artemis/settings', {
          templateUrl: ARTEMIS.templatePath + 'settings.html'
        });
  });

  // one-time initialization happens in the run function
  // of our module
  ARTEMIS.module.run(function(workspace, viewRegistry, localStorage, jolokia, ARTEMISService, $rootScope) {
    // let folks know we're actually running
    ARTEMIS.log.info("plugin running " + jolokia);

    ARTEMISService.initArtemis();

    Core.addCSS('../artemis-plugin/plugin/css/plugin.css');

    // tell hawtio that we have our own custom layout for
    // our view
    viewRegistry["artemis"] = ARTEMIS.templatePath + "artemisLayout.html";

    // Add a top level tab to hawtio's navigation bar
    workspace.topLevelTabs.push({
      id: "artemis",
      content: "ARTEMIS",
      title: "example ARTEMIS client",
      isValid: function(workspace) { return workspace.treeContainsDomainAndProperties("org.apache.activemq.artemis");},
      href: function() { return "#/artemis/server"; },
      isActive: function() { return workspace.isLinkActive("artemis"); }
    });
  });

  return ARTEMIS;
}(ARTEMIS || {}));

// Very important!  Add our module to hawtioPluginLoader so it
// bootstraps our module
hawtioPluginLoader.addModule(ARTEMIS.pluginName);

// have to add this third-party directive too
hawtioPluginLoader.addModule('luegg.directives');
