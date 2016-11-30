/**
 * @module ARTEMIS
 */
var ARTEMIS = (function(ARTEMIS) {

    /**
     * @method AddressController
     * @param $scope
     * @param ARTEMISService
     *
     * Controller for the Create interface
     */
    ARTEMIS.AddressController = function ($scope, workspace, ARTEMISService, jolokia, localStorage) {
        Core.initPreferenceScope($scope, localStorage, {
            'routingType': {
                'value': 0,
                'converter': parseInt,
                'formatter': parseInt
            }
        });
        var artemisJmxDomain = localStorage['artemisJmxDomain'] || "org.apache.activemq.artemis";
        $scope.workspace = workspace;
        $scope.message = "";
        $scope.deleteDialog = false;
        $scope.$watch('workspace.selection', function () {
            workspace.moveIfViewInvalid();
        });
        function operationSuccess() {
            $scope.addressName = "";
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
        $scope.createAddress = function (name, routingType) {
            var mbean = getBrokerMBean(jolokia);
            if (mbean) {
                if (routingType == 0) {
                    $scope.message = "Created  Multicast Address " + name;
                    ARTEMIS.log.info($scope.message);
                    ARTEMISService.artemisConsole.createAddress(mbean, jolokia, name, "MULTICAST", onSuccess(operationSuccess));
                }
                else if (routingType == 1) {
                    $scope.message = "Created Anycast Address " + name;
                    ARTEMIS.log.info($scope.message);
                    ARTEMISService.artemisConsole.createAddress(mbean, jolokia, name, "ANYCAST", onSuccess(operationSuccess));
                }
                else {
                    $scope.message = "Created Anycast/Multicast Address " + name;
                    ARTEMIS.log.info($scope.message);
                    ARTEMISService.artemisConsole.createAddress(mbean, jolokia, name, "ANYCAST,MULTICAST", onSuccess(operationSuccess));
                }
            }
        };
        $scope.deleteAddress = function () {
            var selection = workspace.selection;
            var entries = selection.entries;
            var mbean = getBrokerMBean(jolokia);
            ARTEMIS.log.info(mbean);
            if (mbean) {
                if (selection && jolokia && entries) {
                    var domain = selection.domain;
                    var name = entries["name"];
                    name = name.unescapeHTML();
                    if (name.charAt(0) === '"' && name.charAt(name.length -1) === '"')
                    {
                        name = name.substr(1,name.length -2);
                    }
                    ARTEMIS.log.info(name);
                    var operation;
                    $scope.message = "Deleted address " + name;
                    ARTEMISService.artemisConsole.deleteAddress(mbean, jolokia, name, onSuccess(deleteSuccess));
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
            mbean = "" + folderNames[0] + ":type=Broker" + ",brokerName=" + folderNames[2] + ",serviceType=Broker";
            ARTEMIS.log.info("broker=" + mbean);
            return mbean;
        }
    };

    return ARTEMIS;
} (ARTEMIS || {}));