/// <reference path="artemisPlugin.ts"/>
var ARTEMIS;
(function (ARTEMIS) {
    ARTEMIS.module.controller("ARTEMIS.TreeHeaderController", ["$scope", function ($scope) {
        $scope.expandAll = function () {
            Tree.expandAll("#artemistree");
        };
        $scope.contractAll = function () {
            Tree.contractAll("#artemistree");
        };
    }]);
    ARTEMIS.module.controller("ARTEMIS.TreeController", ["$scope", "$location", "workspace", "localStorage", function ($scope, $location, workspace, localStorage) {
        var amqJmxDomain = localStorage['artemisJmxDomain'] || "org.apache.activemq.artemis";
        ARTEMIS.log.info("init tree " + amqJmxDomain);
        $scope.$on("$routeChangeSuccess", function (event, current, previous) {
            // lets do this asynchronously to avoid Error: $digest already in progress
            setTimeout(updateSelectionFromURL, 50);
        });
        $scope.$watch('workspace.tree', function () {
            reloadTree();
        });
        $scope.$on('jmxTreeUpdated', function () {
            reloadTree();
        });
        function reloadTree() {
            ARTEMIS.log.info("workspace tree has changed, lets reload the artemis tree");
            var children = [];
            var tree = workspace.tree;
            if (tree) {
                var domainName = amqJmxDomain;
                var folder = tree.get(domainName);
                if (folder) {
                    children = folder.children;
                }
                if (children.length) {
                    var firstChild = children[0];
                    // the children could be AMQ 5.7 style broker name folder with the actual MBean in the children
                    // along with folders for the Queues etc...
                    if (!firstChild.typeName && firstChild.children.length < 4) {
                        // lets avoid the top level folder
                        var answer = [];
                        angular.forEach(children, function (child) {
                            answer = answer.concat(child.children);
                        });
                        children = answer;
                    }
                }
                // filter out advisory topics
                children.forEach(function (broker) {
                    var grandChildren = broker.children;
                    if (grandChildren) {
                        Tree.sanitize(grandChildren);
                        var idx = grandChildren.findIndex(function (n) { return n.title === "Topic"; });
                        if (idx > 0) {
                            var old = grandChildren[idx];
                            // we need to store all topics the first time on the workspace
                            // so we have access to them later if the user changes the filter in the preferences
                            var key = "ARTEMIS-allTopics-" + broker.title;
                            var allTopics = old.children.clone();
                            workspace.mapData[key] = allTopics;
                            var filter = Core.parseBooleanValue(localStorage["artemisFilterAdvisoryTopics"]);
                            if (filter) {
                                if (old && old.children) {
                                    var filteredTopics = old.children.filter(function (c) { return !c.title.startsWith("ARTEMIS.Advisory"); });
                                    old.children = filteredTopics;
                                }
                            }
                            else if (allTopics) {
                                old.children = allTopics;
                            }
                        }
                    }
                });
                var treeElement = $("#artemistree");
                Jmx.enableTree($scope, $location, workspace, treeElement, children, true);
                // lets do this asynchronously to avoid Error: $digest already in progress
                setTimeout(updateSelectionFromURL, 50);
            }
        }
        function updateSelectionFromURL() {
            Jmx.updateTreeSelectionFromURLAndAutoSelect($location, $("#artemistree"), function (first) {
                // use function to auto select the queue folder on the 1st broker
                var queues = first.getChildren()[0];
                if (queues && queues.data.title === 'Queue') {
                    first = queues;
                    first.expand(true);
                    return first;
                }
                return null;
            }, true);
        }
    }]);
})(ARTEMIS || (ARTEMIS = {}));
//# sourceMappingURL=tree.js.map