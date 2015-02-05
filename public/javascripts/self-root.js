angular.module('selfRootController', [])
	.controller('rootCtrl', function($rootScope, $scope) {
		$rootScope.cover = {
			status: 'success',
			info: null
		};
		$rootScope.successAlert = function(msg) {
			$rootScope.cover.status = 'success';
			$rootScope.cover.info = msg;
			$('#extraModal').modal('show');
		}
		$rootScope.dangerAlert = function(msg) {
			$rootScope.cover.status = 'danger';
			$rootScope.cover.info = msg;
			$('#extraModal').modal('show');
		}
		$rootScope.loadingShow = function(msg) {
			$rootScope.cover.status = 'danger';
			$rootScope.cover.info = msg;
			$('#extraModal').modal('show');
		}
		$rootScope.loadingChangeMessage = function(msg) {
			$rootScope.cover.info = msg;
		}
		$rootScope.loadingHide = function() {
			$rootScope.cover.status = 'danger';
			$rootScope.cover.info = msg;
			$('#extraModal').modal('show');
		}
		
	})