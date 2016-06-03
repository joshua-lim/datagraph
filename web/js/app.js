var app = angular.module("App", ['ngCsvImport','ngAnimate', 'ngTouch', 'ui.grid', 'ui.grid.importer','chart.js']);

app.controller("Ctrl", ['$scope','$log', '$http', '$interval', function ($scope, $log, $http, $interval){
    
    $scope.labels = [];
    $scope.type = 'StackedBar';    
    $scope.graphdata = [];
    
    //Input Parameters for Graph
    $scope.pivotfield = "";
    $scope.aggregatefield = "";
    $scope.aggregatetype = "";
    
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
        paginationPageSizes: [25, 50, 75],
        paginationPageSize: 25,        
        onRegisterApi: function(gridApi){
        $scope.gridApi = gridApi;
        }
    };
    
    $scope.LoadCSV = function () {
    
        $scope.headers = [];
        
        var p = $scope.csv.result[0];
        for (var key in p) {           
            $scope.headers.push(key);
        }
        
        $scope.griddata = $scope.csv.result;                  
    };
    
    $scope.Generate = function () {
                    
        $scope.labels = [];
        $scope.graphdata = [];
                
        var res = alasql('SELECT '+$scope.pivotfield+', '+$scope.aggregatetype+'('+$scope.aggregatefield+') As '+$scope.aggregatefield+' FROM ? GROUP BY '+$scope.pivotfield,[$scope.csv.result]);
        
        
        tempdata = [];
        for (i = 0; i < res.length; i++) { 
            var temp = res[i];
            $scope.labels.push(temp[$scope.pivotfield]);
            tempdata.push(temp[$scope.aggregatefield]);
        }
        $scope.graphdata.push(tempdata);
        
    };
    

}]); 
