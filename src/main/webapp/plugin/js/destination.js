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
            if (isQueue) {
                $scope.message = "Created queue " + name;
                ARTEMISService.artemisConsole.createQueue(jolokia, name, onSuccess(operationSuccess));
            }
            else {
                $scope.message = "Created topic " + name;
                ARTEMISService.artemisConsole.createTopic(jolokia, name, onSuccess(operationSuccess));
            }
        };
        $scope.deleteDestination = function () {
            var selection = workspace.selection;
            var entries = selection.entries;
            if (selection && jolokia && entries) {
                var domain = selection.domain;
                var name = entries["Destination"] || entries["destinationName"] || selection.title;
                name = name.unescapeHTML();
                var isQueue = "Topic" !== (entries["Type"] || entries["destinationType"]);
               ARTEMIS.log.info("name3=" + isQueue);
                var operation;
                if (isQueue) {
                    $scope.message = "Deleted queue " + name;
                    ARTEMISService.artemisConsole.deleteQueue(jolokia, name, onSuccess(deleteSuccess));
                }
                else {
                    $scope.message = "Deleted topic " + name;
                    ARTEMISService.artemisConsole.deleteTopic(jolokia, name, onSuccess(deleteSuccess));
                }
            }
        };
        $scope.purgeDestination = function () {
            var selection = workspace.selection;
            var entries = selection.entries;
            if (selection && jolokia && entries) {
                var name = entries["Destination"] || entries["destinationName"] || selection.title;
                name = name.unescapeHTML();
                var operation = "purge()";
                $scope.message = "Purged queue " + name;
               ARTEMISService.artemisConsole.purgeQueue(jolokia, name, onSuccess(deleteSuccess));
            }
        };
        $scope.name = function () {
            var selection = workspace.selection;
            if (selection) {
                return selection.title;
            }
            return null;
        };
    };

    return ARTEMIS;
} (ARTEMIS || {}));