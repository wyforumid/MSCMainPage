angular.module('selfFilters', [])
	.filter("toBoolean", function() {
		return function(value) {
			if (angular.isNumber(value)) {
				if (value == 1) {
					return "true";
				} else if (value == 0) {
					return "false";
				}
			} else {
				return "Undefined";
			}
		}
	})
	.filter('filterPermissionById', function() {
		return function(arr, categoryId) {

			var filterArray = [];

			if (!categoryId) {
				return filterArray;
			} else {

				for (var i = arr.length; i--;) {
					if (arr[i].categoryId == categoryId) {
						filterArray.push(arr[i]);
					}
				}
				return filterArray;
			}
		}
	});