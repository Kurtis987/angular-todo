angular.module('RouteControllers', [])
	.controller('HomeController', function($scope) {
		$scope.title = "Welcome to Angular Todo!"; 
	})
	.controller('NavController', function($scope, store, UserInfoService) {
		//grab username for navbar
      	$scope.userInfoService = UserInfoService;
		$scope.userInfoService.username = store.get('username');
	})
	.controller('RegisterController', function($scope, $location, UserAPIService, UserInfoService, store) {

		$scope.userInfoService = UserInfoService;
		$scope.registrationUser = {};
		var URL = "https://morning-castle-91468.herokuapp.com/";

		$scope.login = function() { 
			UserAPIService.callAPI(URL + "accounts/api-token-auth/", $scope.data).then(function(results) {
				$scope.token = results.data.token;  
				$scope.username = $scope.user.username;
				store.set('username',  $scope.user.username);
				store.set('authToken', $scope.token);

				//pass name to the navbar
				$scope.userInfoService.username = $scope.username;

				console.log($scope.token);
				$location.path("/todo");
			}).catch(function(err) {
				console.log(err);
				alert("Login unsuccessful. Wrong username or password.");
			});
		};

		$scope.submitForm = function() {
			if ($scope.registrationForm.$valid) {
				$scope.registrationUser.username = $scope.user.username;
				$scope.registrationUser.password = $scope.user.password;
			

				UserAPIService.callAPI(URL + "accounts/register/", $scope.registrationUser).then(function(results) {
					$scope.data = results.data;
					alert("You have successfully registered to Angular Todo");
					$scope.login();
				}).catch(function(err) {
					alert("Registration failed, please try again with another username.");
					console.log(err);
				}); 
			}
		};
	})
	.controller('LoginController', function($scope, $location, UserAPIService, UserInfoService, store) {

		var URL = "https://morning-castle-91468.herokuapp.com/";
		$scope.userInfoService = UserInfoService;

		$scope.submitForm = function() {
			if ($scope.loginForm.$valid) {
				$scope.data = $scope.user;

				UserAPIService.callAPI(URL + "accounts/api-token-auth/", $scope.data).then(function(results) {
					$scope.token = results.data.token; 
					$scope.username = $scope.user.username;
					store.set('username',  $scope.user.username);
					store.set('authToken', $scope.token); 
					console.log($scope.token);
					alert("Login Successful.");

					//pass name to the navbar
					$scope.userInfoService.username = $scope.username;
					//direct user to their todo page
					$location.path("/todo");
				}).catch(function(err) {
					console.log(err);
					alert("Wrong username or password.");
				});
			}
		};
	})
	.controller('LogoutController', function($scope, store, UserInfoService) {
		try{
			store.remove('username');
			store.remove('authToken');
			$scope.username = "";
			$scope.userInfoService = UserInfoService;
			//pass name to the navbar
			$scope.userInfoService.username = $scope.username;
			$scope.status = "You have been successfully logged out";
		}
		catch(err)
		{
			console.log(err);
			$scope.status = "User is already logged out";
		}
	})
	.controller('TodoController', function($scope, $location, TodoAPIService, store) {
		//send user to registration if not logged in
		if (!store.get('authToken')) {
        	$location.path("/accounts/register");
    	}
		var URL = "https://morning-castle-91468.herokuapp.com/"; 
		
		$scope.authToken = store.get('authToken');
		$scope.username = store.get('username');

		$scope.todos = [];

		var refreshTodos = function() {
			TodoAPIService.getTodos(URL + "todo/", $scope.username, $scope.authToken).then(function(results) {
					$scope.todos = results.data || [];
					console.log($scope.todos);
				}).catch(function(err) {
					console.log(err);
					alert("Server Error Occured. Account may have expired. Please try logging out and logging back in");
				}); 
		};

		refreshTodos();

		//center the todo-modal, or clear the center class when done
		$scope.center = function() {
			$("#todo-modal").toggleClass("center");
		};
		$scope.cleanup = function() {
			$scope.center();
			$("#todoForm").children("div").children("input").val("");
		};
		$scope.editTodo = function(id) {
			$location.path("/todo/edit/" + id);
		};

		$scope.deleteTodo = function(id) {
			TodoAPIService.deleteTodo(URL + "todo/" + id, $scope.username, $scope.authToken).then(function(results) {
				refreshTodos();
				console.log(results);
			}).catch(function(err) {
				console.log(err);
			});
		};
		$scope.submitForm = function() {
			if ($scope.todoForm.$valid) {
				$scope.todo.username = $scope.username; 
					TodoAPIService.createTodo(URL + "todo/", $scope.todo, $scope.authToken).then(function(results) {
						refreshTodos(); 
						$("#todo-modal").modal('hide');
						$scope.cleanup();
						console.log(results);
					}).catch(function(err) {
						console.log(err);
					});
			}
		};
	})
	.controller('EditTodoController', function($scope, $location, $routeParams, TodoAPIService, store) {
		var id = $routeParams.id;
		var URL = "https://morning-castle-91468.herokuapp.com/";

		TodoAPIService.getTodos(URL + "todo/" + id, $scope.username, store.get('authToken')).then(function(results) {
			$scope.todo = results.data;
		}).catch(function(err) {
			console.log(err);
		});

		$scope.cancel = function() {
			$location.path("/todo");
		};
		
		$scope.submitForm = function() {
			if ($scope.todoForm.$valid) {
				$scope.todo.username = $scope.username;

				TodoAPIService.editTodo(URL + "todo/" + id, $scope.todo, store.get('authToken')).then(function(results) {
					$location.path("/todo");
				}).catch(function(err) {
					console.log(err);
				}); 
			}
		};
	});