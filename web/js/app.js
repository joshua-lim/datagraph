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
    $scope.pivotfield = "";
    $scope.aggregatefield = "";
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
        $scope.headers.push("");
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
        
        var CriteriaSign = "=";
        
        var n= $scope.filtercriteria1.search("%");
        if (n != -1){
           CriteriaSign = "like "
        }    
        
        
        if (($scope.aggregatetype == "SUM") || ($scope.aggregatetype == "AVG")){
            var sqlquery = 'SELECT ['+$scope.pivotfield+'], '+$scope.aggregatetype+'(cleanup_numericfield(['+$scope.aggregatefield+'])::NUMBER) As SUMMARY FROM ? ';    
        }else{
            var sqlquery = 'SELECT ['+$scope.pivotfield+'], '+$scope.aggregatetype+'(DISTINCT ['+$scope.aggregatefield+']) As SUMMARY FROM ? ';
        }    

        if ($scope.filterfield1 != ""){
            
            sqlquery = sqlquery + ' WHERE ['+$scope.filterfield1 + '] '+CriteriaSign+'"'+$scope.filtercriteria1+'"';
        }
        
        
        var n= $scope.filtercriteria2.search("%");
        if (n != -1){
           CriteriaSign = "like "
        }  
        
        if ($scope.filterfield2 != ""){
            
            sqlquery = sqlquery + ' AND ['+$scope.filterfield2 + '] '+CriteriaSign+'"'+$scope.filtercriteria2+'"';
        }        
        
        sqlquery = sqlquery + ' GROUP BY ['+$scope.pivotfield+']';
        
        var res = alasql(sqlquery,[$scope.griddata]);
        console.log(sqlquery);
        console.log(res);
        
        tempdata = [];
        for (i = 0; i < res.length; i++) { 
            var temp = res[i];
            $scope.labels.push(temp[$scope.pivotfield]);
            tempdata.push(temp["SUMMARY"]);
        }
        $scope.graphdata.push(tempdata);
        
    };
    

}]); 

app.controller("FieldComputationController", ["$scope","SharedDataService", function($scope,SharedDataService) {
    
    $scope.griddata = SharedDataService.getDataList();
    $scope.headers = SharedDataService.getFieldList();    
    
    // Initiate the value
    $scope.average = 0;
    $scope.sum = 0;
    $scope.count = 0;
    $scope.min = 0;
    $scope.max = 0;
    $scope.filterfield1 = "";
    $scope.filtercriteria1 = "";  
    $scope.filterfield2 = "";
    $scope.filtercriteria2 = "";      
    
    var CriteriaSign = "=";
    
    
    $scope.Compute = function () {
        
        
       var n= $scope.filtercriteria1.search("%");
       if (n != -1){
           CriteriaSign = "like "
       }    
        
       var sqlquery = 'SELECT AVG(cleanup_numericfield(['+$scope.aggregatefield+'])::NUMBER) As AVERAGE,COUNT(['+$scope.aggregatefield+']::NUMBER) As COUNTING, SUM(cleanup_numericfield(['+$scope.aggregatefield+'])::NUMBER) As SUMMATION,MIN(cleanup_numericfield(['+$scope.aggregatefield+'])::NUMBER) As MIN_VALUE, MAX(cleanup_numericfield(['+$scope.aggregatefield+'])::NUMBER) As MAX_VALUE FROM ? WHERE ['+$scope.filterfield1+']'+CriteriaSign+'"'+$scope.filtercriteria1+'"';   
       
        
       CriteriaSign = "=";   
        
       var p= $scope.filtercriteria2.search("%");
       if (p != -1){
           CriteriaSign = "like "
       }     
        
       if (($scope.filterfield2 != "") && ($scope.filtercriteria2 != "")){
           sqlquery = sqlquery+' AND '+'['+$scope.filterfield2+']'+CriteriaSign+'"'+$scope.filtercriteria2+'"';   
       }
          
        var res = alasql(sqlquery,[$scope.griddata]);
        
        $scope.average=res[0].AVERAGE;
        $scope.sum=res[0].SUMMATION;
        $scope.count=res[0].COUNTING;
        $scope.min=res[0].MIN_VALUE;
        $scope.max=res[0].MAX_VALUE;       
    };    

}]);

//alasql custom functions

alasql.fn.cleanup_numericfield = function(FieldData) { 
    
    var clean_string = "";
    
    // Clean up comma
    var n = FieldData.search(",");    
    if (n == -1){
        clean_string = FieldData;
    }else{
        clean_string = FieldData.substring(0, n)+FieldData.substring(n+1, FieldData.length);       
    }
    
    // Clean up double quote
    n = clean_string .search('"');    
    if (n != -1){
         clean_string = clean_string.substring(1,clean_string.length-1);
    }
    
    // Clean up dollar sign
    n =  clean_string.search("$");    
    if (n == -1){        
        return clean_string;
    }else{
        clean_string = clean_string.substring(1, clean_string.length);                        
        return clean_string;
    }   
    
}
