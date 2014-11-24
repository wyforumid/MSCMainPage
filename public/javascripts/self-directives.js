angular.module('selfDirectives', [])
	.directive("runningSpots", function() {
		return function(scope, element, attrs) {
			var divWidth = $(element).width(),
				EXPECT_WIDTH = 15,
				EXPECT_MARGRIN_LEFT = 2,
				EXPECT_WIDTH_WITH_MARGIN = 17,
				AT_LEAST_COUNT = 6,
				actualCount,
				actualWidth,
				needDivWidth,
				blankWidth,
				leftBlank,
				rightBlank;

			actualCount = Math.floor(divWidth / (EXPECT_WIDTH + EXPECT_MARGRIN_LEFT));

			if (actualCount < 6) {
				actualCount = AT_LEAST_COUNT;
				actualWidth = Math.floor(divWidth / actualCount) - 2;

			} else {
				actualWidth = EXPECT_WIDTH;
			}

			actualDivWidth = actualCount * (EXPECT_WIDTH + EXPECT_MARGRIN_LEFT);

			blankWidth = divWidth - needDivWidth;

			if (blankWidth < 2) {
				leftBlank = blankWidth;
				rightBlank = 0;
			} else {
				leftBlank = Math.floor(blankWidth / 2) + 1;
				rightBlank = blankWidth - leftBlank;
			}

			for (var i = actualCount; i--;) {
				$(element).append($('<div class="process-spot" ></div>').css('height', actualWidth + 'px').css('width', actualWidth + 'px')).css('padding-left', leftBlank + 'px').css('padding-right', rightBlank + 'px');
			}

			(function running(containerId) {

				var spots = $('[running-spots=' + containerId + '] > div'),
					index = -2,
					length = spots.length;

				function changeStatus() {
					if (index < 0) {
						for (var i = 0; i < 3; i++) {
							if (index + i >= 0) {
								$(spots[index + i]).addClass('process-spot-moving');
							}
						}
					} else if (index < length) {
						$(spots[index - 1]).removeClass('process-spot-moving');
						if ((index + 2) < length) {
							$(spots[index + 2]).addClass('process-spot-moving');
						}
					} else {
						$(spots[index - 1]).removeClass('process-spot-moving');
						index = -3;
					}
					index++;
					setTimeout(changeStatus, 200);
				}

				setTimeout(function() {
					changeStatus();
				}, 200)
			})(attrs['runningSpots']);

		}
	})
	.directive('permissionArea', function() {
		return {
			// link: function(scope, element, attrs) {
			// 	scope.permissionAreadata = {};
			// 	scope.$watch('permissionInfo.displayedPermission',
			// 			function(nV, oV) {
			// 				scope.permissionAreadata = nV;
			// 			}, true)
			// },
			scope: {
				data: '=categoriedpermissions',
				selectedCount : '=selectedcount',
				changedPermissionCount : '&selectedcountchange'
			},
			restrict: 'A',
			templateUrl: '/partialviews/permission/permissionTemplate.html',
			
		}
	});