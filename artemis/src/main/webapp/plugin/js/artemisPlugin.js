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
   ARTEMIS.module = angular.module(ARTEMIS.pluginName, ['bootstrap', 'ngResource', 'ui.bootstrap.dialog', 'hawtioCore', 'camel', 'hawtio-ui']);

   // set up the routing for this plugin, these are referenced by the subleveltabs added below
   ARTEMIS.module.config(function($routeProvider) {
      $routeProvider
         .when('/artemis/createAddress', {
            templateUrl: ARTEMIS.templatePath + 'createAddress.html'
         })
         .when('/artemis/deleteAddress', {
            templateUrl: ARTEMIS.templatePath + 'deleteAddress.html'
         })
         .when('/artemis/deleteQueue', {
            templateUrl: ARTEMIS.templatePath + 'deleteQueue.html'
         })
         .when('/artemis/createQueue', {
            templateUrl: ARTEMIS.templatePath + 'createQueue.html'
         })
         .when('/artemis/browseQueue', {
            templateUrl: ARTEMIS.templatePath + 'browseQueue.html'
         })
         .when('/artemis/diagram', {
            templateUrl: ARTEMIS.templatePath + 'brokerDiagram.html'
         })
         .when('/artemis/sendMessage', {
            templateUrl: ARTEMIS.templatePath + 'sendMessage.html'
         });
   });

   ARTEMIS.module.factory('artemisMessage', function () {
        return { 'message': null };
    });

   // one-time initialization happens in the run function
   // of our module
   ARTEMIS.module.run(function(workspace, viewRegistry, helpRegistry, preferencesRegistry, localStorage, jolokia, ARTEMISService, $rootScope) {
      // let folks know we're actually running
      ARTEMIS.log.info("plugin running " + jolokia);

      var artemisJmxDomain = localStorage['artemisJmxDomain'] || "org.apache.activemq.artemis";

      ARTEMISService.initArtemis();

      // tell hawtio that we have our own custom layout for
      // our view
      viewRegistry["artemis"] = ARTEMIS.templatePath + "artemisLayout.html";

      helpRegistry.addUserDoc("artemis", "../artemis-plugin/plugin/doc/help.md", function () {
         return workspace.treeContainsDomainAndProperties(artemisJmxDomain);
     });

      preferencesRegistry.addTab("Artemis", ARTEMIS.templatePath + "preferences.html", function () {
         return workspace.treeContainsDomainAndProperties(artemisJmxDomain);
      });

      // Add a top level tab to hawtio's navigation bar
      workspace.topLevelTabs.push({
         id: "artemis",
         content: "Artemis",
         title: "Artemis Broker",
         isValid: function (workspace) {
            return workspace.treeContainsDomainAndProperties(artemisJmxDomain);
         },
         href: function () {
            return "#/jmx/attributes?tab=artemis";
         },
         isActive: function () {
            return workspace.isLinkActive("artemis");
         }
      });

      workspace.subLevelTabs.push({
         content: '<i class="icon-plus"></i> Create',
         title: "Create a new address",
         isValid: function (workspace) {
            return isBroker(workspace, artemisJmxDomain) || isAddressFolder(workspace, artemisJmxDomain);
         },
         href: function () {
            return "#/artemis/createAddress";
         }
      });

      workspace.subLevelTabs.push({
         content: '<i class="icon-plus"></i> Delete',
         title: "Create a new address",
         isValid: function (workspace) {
            return isAddress(workspace, artemisJmxDomain);
         },
         href: function () {
            return "#/artemis/deleteAddress";
         }
      });

      workspace.subLevelTabs.push({
         content: '<i class="icon-plus"></i> Create',
         title: "Create a new queue",
         isValid: function (workspace) {
            return isAddress(workspace, artemisJmxDomain)
         },
         href: function () {
            return "#/artemis/createQueue"
         }
      });

      workspace.subLevelTabs.push({
         content: '<i class="icon-remove"></i> Delete',
         title: "Delete or purge this queue",
         isValid: function (workspace) {
            return isQueue(workspace, artemisJmxDomain)
         },
         href: function () {
            return "#/artemis/deleteQueue"
         }
      });

      workspace.subLevelTabs.push({
          content: '<i class="icon-envelope"></i> Browse',
          title: "Browse the messages on the queue",
          isValid: function (workspace) { return isQueue(workspace, artemisJmxDomain); },
          href: function () { return "#/artemis/browseQueue"; }
      });

      workspace.subLevelTabs.push({
      content: '<i class="icon-pencil"></i> Send',
      title: "Send a message to this address",
      isValid: function (workspace) { return isAddress(workspace, artemisJmxDomain) || isQueue(workspace, artemisJmxDomain); },
      href: function () { return "#/artemis/sendMessage"; }
      });

      workspace.subLevelTabs.push({
          content: '<i class="icon-picture"></i> Diagram',
          title: "View a diagram of the producers, destinations and consumers",
          isValid: function (workspace) { return workspace.isTopTabActive("artemis") || workspace.selectionHasDomain(artemisJmxDomain); },
          href: function () { return "#/artemis/diagram"; }
      });
});


   function isBroker(workspace, domain) {
      return workspace.hasDomainAndProperties(domain, {'serviceType': 'Broker'}, 3);
   }

   function isAddressFolder(workspace, domain) {
      return workspace.selectionHasDomainAndLastFolderName(domain, 'Address');
   }

   function isAddress(workspace, domain) {
      return workspace.hasDomainAndProperties(domain, {'serviceType': 'Address'});
   }

   function isQueuesFolder(workspace, domain) {
      return workspace.selectionHasDomainAndLastFolderName(domain, 'Queue');
   }

   function isQueue(workspace, domain) {
      return workspace.hasDomainAndProperties(domain, {'serviceType': 'Queue'});
   }

   return ARTEMIS;
}(ARTEMIS || {}));

// Very important!  Add our module to hawtioPluginLoader so it
// bootstraps our module
hawtioPluginLoader.addModule(ARTEMIS.pluginName);