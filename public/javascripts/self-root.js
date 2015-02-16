angular.module('selfRootController', [])
	.controller('rootCtrl', function($rootScope, $scope) {
		$rootScope.cover = {
			status: 'success',
			info: null
		};
		$rootScope.successAlert = function(msg) {
			$rootScope.cover.status = 'success';
			$rootScope.cover.info = seperateInfo(msg);
			$('#extraModal').modal('show');
		}
		$rootScope.dangerAlert = function(msg) {
			$rootScope.cover.status = 'danger';
			$rootScope.cover.info = seperateInfo(msg);
			$('#extraModal').modal('show');
		}
		$rootScope.loadingShow = function(msg) {
			$rootScope.cover.status = 'load';
			$rootScope.cover.info = msg;
			$('#extraModal').modal('show');
		}
		$rootScope.loadingChangeMessage = function(msg) {
			$rootScope.cover.info = msg;
		}
		$rootScope.loadingHide = function() {
			$rootScope.cover.status = 'load';
			$rootScope.cover.info = null;
			$('#extraModal').modal('hide');
		}

		$rootScope.userInfo = JSON.parse($.cookie('userInfo'));
		$rootScope.hasPermission = function(permissionIds) {
			if (!$rootScope.userInfo) {
				$rootScope.userInfo = JSON.parse($.cookie('userInfo'));
			}
			if (!$rootScope.userInfo || !$rootScope.userInfo.permissions || $rootScope.userInfo.permissions.length == 0) {
				return false;
			}
			var owned = $rootScope.userInfo.permissions;

			if (owned.indexOf(1) != -1) {
				return true;
			}
			var result = false;
			if (permissionIds && angular.isArray(permissionIds) && permissionIds.length > 0) {
				$.each(permissionIds, function(i, v) {
					if (owned.indexOf(v) != -1) {
						result = true;
						return false;
					}
				});
				return result;
			} else {
				return false;
			}
		}

		function seperateInfo(data) {
			if (!data || data.length == 0) {
				return [];
			}
			var items = data.split('||');
			for (var i = items.length; i--;) {
				if (!items[i] || items[i] == '') {
					items.splice(i, 1);
				}
			}
			return items;
		}

		$('.modal').on('shown.bs.modal', function() {
			var contentHeight = $(window).height() - 60;
			var headerHeight = $(this).find('.modal-header').outerHeight() || 2;
			var footerHeight = $(this).find('.modal-footer').outerHeight() || 2;

			$(this).find('.modal-content').css({
				'max-height': function() {
					return contentHeight;
				}
			});

			$(this).find('.modal-body').css({
				'max-height': function() {
					return (contentHeight - (headerHeight + footerHeight));
				}
			});

			$(this).find('.modal-dialog').css({
				'margin-top': function() {
					return -($(this).outerHeight() / 2);
				},
				'margin-left': function() {
					return -($(this).outerWidth() / 2);
				}
			});
		});

		$('#extraModal').on('hidden.bs.modal', function() {
			$rootScope.cover.status = null;
			$rootScope.cover.info = null;
		});

	})