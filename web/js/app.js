var app = angular.module("App", ['ngRoute','ngCsvImport','ngAnimate', 'ngTouch', 'ui.grid','ui.grid.pagination', 'ui.grid.importer','chart.js']);



app.config(function ($routeProvider) {
    $routeProvider
        .when('/',
        {
            templateUrl: 'view/import.html',
            controller: 'ImportController'
        }).
        when('/fieldcomputation',
        {
            templateUrl: 'view/fieldcomputation.html',
            controller: 'FieldComputationController'
        });
});

app.config(function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({      
      responsive: true
    });
});


app.service('SharedDataService',function(){

    var dataList = [];
    var fieldList = [];
    
    return {
        getDataList : function(){
      console.log("call getDataList");            
      return dataList; 
    },
        setDataList : function(data){
         dataList = data;
    },
        getFieldList : function(){
      console.log("call getFieldList");            
      return fieldList; 
    },
        setFieldList : function(data){
         fieldList = data;
    }        
    };
    
});

app.controller("MenuController", ["$scope","$location", function($scope,$location) {
    
    $scope.tab = 1;
    
    $scope.SetTab = function (tabId) {
        $scope.tab = tabId;
        console.log(tabId);
        if (tabId ==1){
            $location.path("/");
        }else if (tabId ==2){
            $location.path("fieldcomputation");
        }
    };
    
    $scope.TabPosition = function (tabId) {        
        return $scope.tab === tabId;
    };

}]);

app.controller("ImportController", ['$scope','$log', '$http', '$interval','$timeout',"SharedDataService", function ($scope, $log, $http, $interval,$timeout,SharedDataService){
    
    $scope.labels = [];
    $scope.type = 'Line';    
    $scope.graphdata = [];
    $scope.progresspic="img/blank.gif";
    //Input Parameters for Graph
    $scope.pivotfield = "Please Select";
    $scope.aggregatefield = "Please Select";
    $scope.aggregatetype = "count";
    
    
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
  
    
    $scope.griddata = SharedDataService.getDataList();
    $scope.headers = SharedDataService.getFieldList();        
    
    $scope.LoadCSV = function () {
    
        $scope.headers = [];        
        console.log($scope.progresspic);        
        var p = $scope.csv.result[0];
        for (var key in p) {           
            $scope.headers.push(key);
        }
        
        $scope.griddata = $scope.csv.result;  
        
        SharedDataService.setDataList($scope.griddata);
        SharedDataService.setFieldList($scope.headers);
    };
    
    $scope.Generate = function () {
                    
        $scope.labels = [];
        $scope.graphdata = [];
        if ($scope.aggregatetype == "SUM"){
            var sqlquery = 'SELECT '+$scope.pivotfield+', '+$scope.aggregatetype+'('+$scope.aggregatefield+'::NUMBER) As SUMMARY FROM ? GROUP BY '+$scope.pivotfield;    
        }else{
            var sqlquery = 'SELECT '+$scope.pivotfield+', '+$scope.aggregatetype+'(DISTINCT '+$scope.aggregatefield+') As '+$scope.aggregatefield+' FROM ? GROUP BY '+$scope.pivotfield;
        }    

        var res = alasql(sqlquery,[$scope.griddata]);
                
        tempdata = [];
        for (i = 0; i < res.length; i++) { 
            var temp = res[i];
            $scope.labels.push(temp[$scope.pivotfield]);
            tempdata.push(temp[$scope.aggregatefield]);
        }
        $scope.graphdata.push(tempdata);
        
    };
    

}]); 

app.controller("FieldComputationController", ["$scope","SharedDataService", function($scope,SharedDataService) {
    
    $scope.griddata = SharedDataService.getDataList();
    $scope.headers = SharedDataService.getFieldList();    
    $scope.average = 0;
    $scope.sum = 0;
    $scope.count = 0;
    $scope.min = 0;
    $scope.max = 0;
    console.log($scope.griddata);
    
   $scope.Compute = function () {
        
       var sqlquery = 'SELECT AVG('+$scope.aggregatefield+'::NUMBER) As AVERAGE,COUNT('+$scope.aggregatefield+'::NUMBER) As COUNTING, SUM('+$scope.aggregatefield+'::NUMBER) As SUMMATION,MIN('+$scope.aggregatefield+'::NUMBER) As MIN_VALUE, MAX('+$scope.aggregatefield+'::NUMBER) As MAX_VALUE FROM ? ';   
       
        console.log(sqlquery);       
        var res = alasql(sqlquery,[$scope.griddata]);
        $scope.average=res[0].AVERAGE;
        $scope.sum=res[0].SUMMATION;
        $scope.count=res[0].COUNTING;
        $scope.min=res[0].MIN_VALUE;
        $scope.max=res[0].MAX_VALUE;
        
    };    

}]);

