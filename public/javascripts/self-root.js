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

	})