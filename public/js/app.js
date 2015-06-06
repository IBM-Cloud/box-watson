/* global angular */

var underscore = angular.module('underscore', []);
underscore.factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
});

var app = angular.module("BoxInsights", ["underscore"]);

angular.element(document).ready(function () {
    angular.bootstrap(document, ["BoxInsights"]);
});
