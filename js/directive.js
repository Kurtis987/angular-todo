angular.module('TodoDirective', []).directive('todoTable', function() {
	return {
		restrict: 'EA', // EA -> element/attribute
		templateUrl: 'templates/directives/todo-table.html'
	};
});
angular.module('NavbarDirective', []).directive('todoNav', function() {
	return {
		restrict: 'E', // E -> element
		templateUrl: 'templates/directives/todo-nav.html'
	};
});