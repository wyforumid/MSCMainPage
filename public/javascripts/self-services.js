angular.module('selfServices', [])
	.factory('fundationService', function($http) {
		var allOffices = [],
			allDepts = [],
			allPermissionCategories =[],
			allPermissions=[];

		function fetchFoundationData(url, storePlace, successCallback, errorCallback) {
			$http({
				method: 'GET',
				url: url,
				cache: false
			}).success(function(data, status) {
				storePlace = data;
				successCallback(storePlace);
			}).error(function(data, status) {
				errorCallback(data, status);
			});
		}


		return {
			getAllOffices: function(successCallback, errorCallback, forceRefresh) {
				if (forceRefresh || ($.isArray(allOffices) && allOffices.length == 0) {
					fetchFoundationData('/API/company/ALLOFFICES', allOffices, successCallback, errorCallback);
				} else {
					return allOffices;
				}
			},

			getAllDepts: function(successCallback, errorCallback, forceRefresh) {
				if (forceRefresh || ($.isArray(allDepts) && allDepts.length == 0)) {
					fetchFoundationData('/API/company/ALLDEPTS', allDepts, successCallback, errorCallback);
				} else {
					return allDepts;
				}
			},

			getAllPermissions: function(successCallback,errorCallback,forceRefresh){
				if(forceRefresh || ($.isArray(allPermissions) && allPermissions.length == 0)){
					fetchFoundationData('/API/permission/ALLPERMISSIONS',allPermissions,successCallback,errorCallback);
				}else{
					return allPermissions;
				}
			}

			getAllPermissionCategories: function(successCallback,errorCallback,forceRefresh){
				//if(forceRefresh || ($.isArray))
			}
		}


	});