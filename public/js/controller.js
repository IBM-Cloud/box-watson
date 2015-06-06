/* global angular */

angular.module("BoxInsights")

.controller("FilesController", function ($scope, $http, _, $sce) {
    $scope.files = undefined;
    $scope.filteredFiles = undefined;

    function getFiles() {
        $http.get("/api/v1/files").
        success(function(data, status, headers, config) {
            $scope.files = data;

            // Asynchronously get file descriptions
            for (var i=0; i < $scope.files.length; i++) {
                $http.get("/api/v1/fileInfo/" + $scope.files[i].id + "/" + i.toString()).
                    success(function(data) {
                        if ($scope.files[data.iterator])
                          $scope.files[data.iterator].description = data.description;
                    }).
                    error(function(data) {
                        $scope.error = true;
                        $scope.errorMessage = data.message;
                    });
            }

            $scope.filteredFiles = data;
            $scope.error = false;
            $scope.chunkedData = chunk($scope.files);
        }).
        error(function(data, status, headers, config) {
            $scope.error = true;
            $scope.errorMessage = data.message;
        });
    }

    /**
     * Renders the sunburst visualization. The input parameter is the tree as returned
     * from the Personality Insights JSON API.
     */
    function showVizualization(theProfile) {
      var widgetId = "viz-graph",
      widgetWidth = 650, widgetHeight = 650, // Default width and height
      personImageUrl = 'images/watson.png';

      console.log(widgetId);

      $('#' + widgetId).empty();
      var d3vis = d3.select('#' + widgetId).append('svg:svg');
      var widget = {
        d3vis: d3vis,
        data: theProfile,
        loadingDiv: 'dummy',
        switchState: function() {
          console.log('[switchState]');
        },
        _layout: function() {
          console.log('[_layout]');
        },
        showTooltip: function() {
          //console.log('[showTooltip]');
        },
        id: 'SystemUWidget',
        COLOR_PALLETTE: ['#1b6ba2', '#488436', '#d52829', '#F53B0C', '#972a6b', '#8c564b', '#dddddd'],
        expandAll: function() {
          this.vis.selectAll('g').each(function() {
            var g = d3.select(this);
            if (g.datum().parent && // Isn't the root g object.
              g.datum().parent.parent && // Isn't the feature trait.
              g.datum().parent.parent.parent) { // Isn't the feature dominant trait.
              g.attr('visibility', 'visible');
            }
          });
        },
        collapseAll: function() {
          this.vis.selectAll('g').each(function() {
            var g = d3.select(this);
            if (g.datum().parent !== null && // Isn't the root g object.
              g.datum().parent.parent !== null && // Isn't the feature trait.
              g.datum().parent.parent.parent !== null) { // Isn't the feature dominant trait.
              g.attr('visibility', 'hidden');
            }
          });
        },
        addPersonImage: function(url) {
          if (!this.vis || !url) {
            return;
          }
          var icon_defs = this.vis.append('defs');
          var width = this.dimW,
            height = this.dimH;

          // The flower had a radius of 640 / 1.9 = 336.84 in the original, now is 3.2.
          var radius = Math.min(width, height) / 16.58; // For 640 / 1.9 -> r = 65
          var scaled_w = radius * 2.46; // r = 65 -> w = 160

          var id = 'user_icon_' + this.id;
          icon_defs.append('pattern')
            .attr('id', id)
            .attr('height', 1)
            .attr('width', 1)
            .attr('patternUnits', 'objectBoundingBox')
            .append('image')
            .attr('width', scaled_w)
            .attr('height', scaled_w)
            .attr('x', radius - scaled_w / 2) // r = 65 -> x = -25
            .attr('y', radius - scaled_w / 2)
            .attr('xlink:href', url)
            .attr('opacity', 1.0)
            .on('dblclick.zoom', null);
          this.vis.append('circle')
            .attr('r', radius)
            .attr('stroke-width', 0)
            .attr('fill', 'url(#' + id + ')');
        }
      };

      widget.dimH = widgetHeight;
      widget.dimW = widgetWidth;
      widget.d3vis.attr('width', widget.dimW).attr('height', widget.dimH);
      widget.d3vis.attr('viewBox', "0 0 " + widget.dimW + ", " + widget.dimH);
      renderChart.call(widget);
      widget.expandAll.call(widget);
      if (personImageUrl)
        widget.addPersonImage.call(widget, personImageUrl);

      $('html, body').animate({
        scrollTop: $("#viz-graph").offset().top
    }, 1000);
    }

    $scope.getPersonality = function() {
        var self = this;

        if (!this.file.personality) {
            $http.get("/api/v1/personality/" + this.file.id).
            success(function(data, status, headers, config) {
                console.log(data.tree.children[0].children[0].children);
                self.file.personality = data;
                setTimeout(function(){
                    var showVizButton = document.getElementById("viz-btn-" + self.file.id.toString());
                    showVizButton.addEventListener("click", function() {
                      showVizualization(self.file.personality);
                    });
                }, 1000);
            });
        }
    };

    getFiles();

    $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
    };

    function chunk(arr, size) {
        var newArr = [];
        if (size) {
            for (var i=0; i<arr.length; i+=size) {
                newArr.push(arr.slice(i, i+size));
            }
        }
        else {
            newArr.push(arr.slice(i, arr.size));
        }
        return newArr;
    }

    $scope.$watch('file', function(filename){
        if (filename === "") {
            $scope.files = undefined;
            getFiles();
        }
        else {
            if (filename)
                filename = filename.toLowerCase();
            $scope.filteredFiles = _.filter($scope.files, function(file){
                if (file.name.toLowerCase().indexOf(filename) !== -1) {
                    return true;
                }
                else {
                    return false;
                }
            });
            $scope.chunkedData = chunk($scope.filteredFiles, 3);
        }
    });
})
.filter('percentage', ['$filter', function ($filter) {
  return function (input, decimals) {
    return $filter('number')(input * 100, decimals) + '%';
  };
}]);
