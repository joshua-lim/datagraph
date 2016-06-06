var app = angular.module("App", ['ngCsvImport','ngAnimate', 'ngTouch', 'ui.grid','ui.grid.pagination', 'ui.grid.importer','chart.js']);

app.config(function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({      
      responsive: true
    });
});

app.controller("Ctrl", ['$scope','$log', '$http', '$interval','$timeout', function ($scope, $log, $http, $interval,$timeout){
    
    $scope.labels = [];
    $scope.type = 'Line';    
    $scope.graphdata = [];
    $scope.progresspic="img/blank.gif";
    //Input Parameters for Graph
    $scope.pivotfield = "Please Select";
    $scope.aggregatefield = "Please Select";
    $scope.aggregatetype = "count";
    
    //List of Values generated from alasql
    $scope.headers = [];
    
    $scope.csv = {
    	content: null,
    	header: true,
    	headerVisible: true,
    	separator: ',',
    	separatorVisible: true,
    	result: null,
    	encoding: 'ISO-8859-1',
    	encodingVisible: true,
    };
    
    
    $scope.griddata = [];
         
    $scope.gridOptions = {
        enableGridMenu: true,        
        enableFiltering: true,
        data: 'griddata',
        paginationPageSizes: [50, 100, 200],
        paginationPageSize: 50,        
        onRegisterApi: function(gridApi){
        $scope.gridApi = gridApi;
        }
    };
    
    $scope.LoadCSV = function () {
    
        $scope.headers = [];        
        console.log($scope.progresspic);        
        var p = $scope.csv.result[0];
        for (var key in p) {           
            $scope.headers.push(key);
        }
        
        $scope.griddata = $scope.csv.result;      
    };
    
    $scope.Generate = function () {
                    
        $scope.labels = [];
        $scope.graphdata = [];
        var res = alasql('SELECT '+$scope.pivotfield+', '+$scope.aggregatetype+'(DISTINCT '+$scope.aggregatefield+') As '+$scope.aggregatefield+' FROM ? GROUP BY '+$scope.pivotfield,[$scope.csv.result]);
        
        
        tempdata = [];
        for (i = 0; i < res.length; i++) { 
            var temp = res[i];
            $scope.labels.push(temp[$scope.pivotfield]);
            tempdata.push(temp[$scope.aggregatefield]);
        }
        $scope.graphdata.push(tempdata);
        
    };
    

}]); 

function callAtTimeout() {
    console.log("Timeout occurred");
}