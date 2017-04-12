/**
 * @module ARTEMIS
 */
var ARTEMIS = (function(ARTEMIS) {

    /**
     * @method QueueController
     * @param $scope
     * @param ARTEMISService
     *
     * Controller for the Create interface
     */
    ARTEMIS.QueueController = function ($scope, workspace, ARTEMISService, jolokia, localStorage) {
        Core.initPreferenceScope($scope, localStorage, {
            'durable': {
                'value': true,
                'converter': Core.parseBooleanValue
            },
            'routingType': {
                'value': 0,
                'converter': parseInt,
                'formatter': parseInt
            },
            'maxConsumers': {
                'value': -1,
                'converter': parseInt,
                'formatter': parseInt
            },
            'purgeWhenNoConsumers': {
                'value': false,
                'converter': Core.parseBooleanValue
            }
        });
        var artemisJmxDomain = localStorage['artemisJmxDomain'] || "org.apache.activemq.artemis";
        $scope.workspace = workspace;
        $scope.message = "";
        $scope.queueType = 'true';
        $scope.deleteDialog = false;
        $scope.purgeDialog = false;
        $scope.$watch('workspace.selection', function () {
            workspace.moveIfViewInvalid();
        });
        function operationSuccess() {
            $scope.queueName = "";
            $scope.workspace.operationCounter += 1;
            Core.$apply($scope);
            Core.notification("success", $scope.message);
            $scope.workspace.loadTree();
        }

       function operationFailure(response) {
          Core.defaultJolokiaErrorHandler(response);
          Core.notification("warning", response['error']);
       }
        function deleteSuccess() {
            // lets set the selection to the parent
            workspace.removeAndSelectParentNode();
            $scope.workspace.operationCounter += 1;
            Core.$apply($scope);
            Core.notification("success", $scope.message);
            $scope.workspace.loadTree();
        }
        $scope.createQueue = function (queueName, routingType, durable, filter, maxConsumers, purgeWhenNoConsumers) {
            var mbean = getBrokerMBean(jolokia);
            if (mbean) {
                var selection = workspace.selection;
                var entries = selection.entries;
                var address = entries["address"];
                if (address.charAt(0) === '"' && address.charAt(address.length -1) === '"')
                {
                    address = address.substr(1,address.length -2);
                }
                $scope.message = "Created queue " + queueName + " durable=" + durable + " filter=" + filter + " on address " + address;
                if (routingType == 0) {
                    ARTEMIS.log.info($scope.message);
                    ARTEMISService.artemisConsole.createQueue(mbean, jolokia, address, "MULTICAST", queueName, durable, filter, maxConsumers, purgeWhenNoConsumers, onSuccess(operationSuccess, {
                                                                                        error: function (response) {
                                                                                           operationFailure(response);
                                                                                        }
                                                                                    }));
                    ARTEMIS.log.info("executed");
                } else {
                   ARTEMIS.log.info($scope.message);
                   ARTEMISService.artemisConsole.createQueue(mbean, jolokia, address, "ANYCAST", queueName, durable, filter, maxConsumers, purgeWhenNoConsumers, onSuccess(operationSuccess, {
                                                                                       error: function (response) {
                                                                                          operationFailure(response);
                                                                                       }
                                                                                   }));
                   ARTEMIS.log.info("executed");
                }
            }
        };
        $scope.deleteDestination = function (isQueue) {
            var selection = workspace.selection;
            var entries = selection.entries;
            var mbean = getBrokerMBean(jolokia);
            ARTEMIS.log.info(mbean);
            if (mbean) {
                if (selection && jolokia && entries) {
                    var domain = selection.domain;
                    var name = entries["Destination"] || entries["destinationName"] || selection.title;
                    name = name.replace(/['"]+/g, '');
                    ARTEMIS.log.info(name);
                    var operation;
                    if (isQueue) {
                        $scope.message = "Deleted queue " + name;
                        ARTEMISService.artemisConsole.deleteQueue(mbean, jolokia, name, onSuccess(deleteSuccess, {
                                                                                            error: function (response) {
                                                                                               operationFailure(response);
                                                                                            }
                                                                                        }));
                    }
                    else {
                        $scope.message = "Deleted topic " + name;
                        ARTEMISService.artemisConsole.deleteTopic(mbean, jolokia, name, onSuccess(deleteSuccess, {
                                                                                            error: function (response) {
                                                                                               operationFailure(response);
                                                                                            }
                                                                                        }));
                    }
                }
            }
        };
        $scope.purgeDestination = function () {
            var selection = workspace.selection;
            var entries = selection.entries;
            var mbean = getBrokerMBean(jolokia);
            if (mbean) {
                if (selection && jolokia && entries) {
                    var name = entries["Destination"] || entries["destinationName"] || selection.title;
                    name = name.replace(/['"]+/g, '');
                    var operation = "purge()";
                    $scope.message = "Purged queue " + name;
                    ARTEMISService.artemisConsole.purgeQueue(mbean, jolokia, name, onSuccess(deleteSuccess, {
                                                                                        error: function (response) {
                                                                                           operationFailure(response);
                                                                                        }
                                                                                    }));
                }
            }
        };
        $scope.name = function () {
            var selection = workspace.selection;
            if (selection) {
                return selection.title;
            }
            return null;
        };

        function getBrokerMBean(jolokia) {
            var mbean = null;
            var selection = workspace.selection;
            var folderNames = selection.folderNames;
            mbean = "" + folderNames[0] + ":broker=" + folderNames[1];
            ARTEMIS.log.info("broker=" + mbean);
            return mbean;
        }
    };

    return ARTEMIS;
} (ARTEMIS || {}));