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