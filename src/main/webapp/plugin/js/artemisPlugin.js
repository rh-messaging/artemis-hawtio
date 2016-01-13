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
         .when('/artemis/createDestination', {
            templateUrl: ARTEMIS.templatePath + 'createDestination.html'
         })
         .when('/artemis/deleteQueue', {
            templateUrl: ARTEMIS.templatePath + 'deleteQueue.html'
         })
         .when('/artemis/createQueue', {
            templateUrl: ARTEMIS.templatePath + 'createQueue.html'
         })
         .when('/artemis/createTopic', {
            templateUrl: ARTEMIS.templatePath + 'createTopic.html'
         })
         .when('/artemis/deleteTopic', {
            templateUrl: ARTEMIS.templatePath + 'deleteTopic.html'
         })
         .when('/artemis/browseQueue', {
            templateUrl: ARTEMIS.templatePath + 'browseQueue.html'
         });
         /*.when('/artemis/sendMessage', {
            templateUrl: 'app/camel/html/sendMessage.html'
         });*/
   });

   // one-time initialization happens in the run function
   // of our module
   ARTEMIS.module.run(function(workspace, viewRegistry, preferencesRegistry, localStorage, jolokia, ARTEMISService, $rootScope) {
      // let folks know we're actually running
      ARTEMIS.log.info("plugin running " + jolokia);

      var artemisJmxDomain = localStorage['artemisJmxDomain'] || "org.apache.activemq.artemis";

      workspace.addTreePostProcessor(postProcessTree);


      ARTEMISService.initArtemis();

      // tell hawtio that we have our own custom layout for
      // our view
      viewRegistry["artemis"] = ARTEMIS.templatePath + "artemisLayout.html";

      preferencesRegistry.addTab("Artemis", ARTEMIS.templatePath + "preferences.html", function () {
         return workspace.treeContainsDomainAndProperties(artemisJmxDomain);
      });

      // Add a top level tab to hawtio's navigation bar
      workspace.topLevelTabs.push({
         id: "artemis",
         content: "Artemis",
         title: "example ARTEMIS client",
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
         title: "Create a new destination",
         isValid: function (workspace) {
            return isBroker(workspace, artemisJmxDomain);
         },
         href: function () {
            return "#/artemis/createDestination";
         }
      });

      workspace.subLevelTabs.push({
         content: '<i class="icon-plus"></i> Create',
         title: "Create a new queue",
         isValid: function (workspace) {
            return isQueuesFolder(workspace, artemisJmxDomain)
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
         content: '<i class="icon-plus"></i> Create',
         title: "Create a new topic",
         isValid: function (workspace) {
            return isTopicsFolder(workspace, artemisJmxDomain)
         },
         href: function () {
            return "#/artemis/createTopic";
         }
      });

      workspace.subLevelTabs.push({
         content: '<i class="icon-remove"></i> Delete',
         title: "Delete this topic",
         isValid: function (workspace) {
            return isTopic(workspace, artemisJmxDomain)
         },
         href: function () {
            return "#/artemis/deleteTopic";
         }
      });

      workspace.subLevelTabs.push({
          content: '<i class="icon-envelope"></i> Browse',
          title: "Browse the messages on the queue",
          isValid: function (workspace) { return isQueue(workspace, artemisJmxDomain); },
          href: function () { return "#/artemis/browseQueue"; }
      });

      function postProcessTree(tree) {
         var activemq = tree.get(artemisJmxDomain);
         // let JMS as first children within brokers

         ARTEMIS.log.info("activemq=" + activemq);
         if (activemq) {
            angular.forEach(activemq.children, function (broker) {
               ARTEMIS.log.info("broker=" + broker);
               angular.forEach(broker.children, function (child) {

                  ARTEMIS.log.info("child=" + child);
                  // lets move JMS module to the front.
                  var grandChildren = child.children;
                  if (grandChildren) {
                     var names = ["JMS"];
                     angular.forEach(names, function (name) {
                        var idx = grandChildren.findIndex(function (n) {
                           return n.title === name;
                        });
                        if (idx > 0) {
                           var old = grandChildren[idx];
                           grandChildren.splice(idx, 1);
                           grandChildren.splice(0, 0, old);
                        }
                     });
                  }
               });
            });
         }
      }
});

   /*

    workspace.subLevelTabs.push({
    content: '<i class="icon-pencil"></i> Send',
    title: "Send a message to this destination",
    isValid: function (workspace) { return (isQueue(workspace, artemisJmxDomain) || isTopic(workspace, artemisJmxDomain)); },
    href: function () { return "#/artemis/sendMessage"; }
    });*/


   function isBroker(workspace, domain) {
      return workspace.hasDomainAndProperties(domain, {'serviceType': 'Server'}, 4) || workspace.selectionHasDomainAndType(domain, 'Server');
   }

   function isQueuesFolder(workspace, domain) {
      return workspace.selectionHasDomainAndLastFolderName(domain, 'Queue');
   }

   function isQueue(workspace, domain) {
      return workspace.hasDomainAndProperties(domain, {'serviceType': 'Queue'}, 5) || workspace.selectionHasDomainAndType(domain, 'Queue');
   }

   function isTopicsFolder(workspace, domain) {
      return workspace.selectionHasDomainAndLastFolderName(domain, 'Topic');
   }


   function isTopic(workspace, domain) {
      //return workspace.selectionHasDomainAndType(jmxDomain, 'Topic');
      return workspace.hasDomainAndProperties(domain, {'serviceType': 'Topic'}, 5) || workspace.selectionHasDomainAndType(domain, 'Topic');
   }

   return ARTEMIS;
}(ARTEMIS || {}));

// Very important!  Add our module to hawtioPluginLoader so it
// bootstraps our module
hawtioPluginLoader.addModule(ARTEMIS.pluginName);