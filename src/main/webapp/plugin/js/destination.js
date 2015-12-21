/**
 * @module ARTEMIS
 */
var ARTEMIS = (function(ARTEMIS) {

    /**
     * @method DestinationController
     * @param $scope
     * @param ARTEMISService
     *
     * Controller for the Create interface
     */
    ARTEMIS.DestinationController = function ($scope, workspace, ARTEMISService, jolokia, localStorage) {
        var artemisJmxDomain = localStorage['artemisJmxDomain'] || "org.apache.activemq.artemis";
        $scope.workspace = workspace;
        $scope.message = "";
        $scope.queueType = 'true';
        $scope.deleteDialog = false;
        $scope.purgeDialog = false;
        updateQueueType();
        function updateQueueType() {
            $scope.destinationTypeName = $scope.queueType ? "Queue" : "Topic";
        }
        $scope.$watch('queueType', function () {
            updateQueueType();
        });
        $scope.$watch('workspace.selection', function () {
            workspace.moveIfViewInvalid();
        });
        function operationSuccess() {
            $scope.destinationName = "";
            $scope.workspace.operationCounter += 1;
            Core.$apply($scope);
            Core.notification("success", $scope.message);
            $scope.workspace.loadTree();
        }
        function deleteSuccess() {
            // lets set the selection to the parent
            workspace.removeAndSelectParentNode();
            $scope.workspace.operationCounter += 1;
            Core.$apply($scope);
            Core.notification("success", $scope.message);
            $scope.workspace.loadTree();
        }
        $scope.createDestination = function (name, isQueue) {
            var mbean = getBrokerMBean(jolokia);
            if (mbean) {
                if (isQueue) {
                    $scope.message = "Created queue " + name;
                    ARTEMISService.artemisConsole.createQueue(mbean, jolokia, name, onSuccess(operationSuccess));
                }
                else {
                    $scope.message = "Created topic " + name;
                    ARTEMISService.artemisConsole.createTopic(mbean, jolokia, name, onSuccess(operationSuccess));
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
                    name = name.unescapeHTML();
                    ARTEMIS.log.info(name);
                    var operation;
                    if (isQueue) {
                        $scope.message = "Deleted queue " + name;
                        ARTEMISService.artemisConsole.deleteQueue(mbean, jolokia, name, onSuccess(deleteSuccess));
                    }
                    else {
                        $scope.message = "Deleted topic " + name;
                        ARTEMISService.artemisConsole.deleteTopic(mbean, jolokia, name, onSuccess(deleteSuccess));
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
                    name = name.unescapeHTML();
                    var operation = "purge()";
                    $scope.message = "Purged queue " + name;
                    ARTEMISService.artemisConsole.purgeQueue(mbean, jolokia, name, onSuccess(deleteSuccess));
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
            var parent = selection ? selection.parent : null;
            if (selection && parent && jolokia && folderNames && folderNames.length > 1) {
                mbean = parent.objectName;
                // we might be a destination, so lets try one more parent
                if (!mbean && parent) {
                    ARTEMIS.log.info("returning selection parent.parent.objectName");
                    mbean = parent.parent.objectName;
                }
                if (!mbean) {
                    mbean = "" + folderNames[0] + ":type=Broker" + ",brokerName=" + folderNames[2] + ",module=JMS,serviceType=Server";
                }
            }
            return mbean;
        }
    };

    return ARTEMIS;
} (ARTEMIS || {}));