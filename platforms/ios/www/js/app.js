var practices = angular.module('practices', [
  'ngRoute',
  'UserApp'
]);

practices.run(function($rootScope, user) {
  user.init({ appId: '53613b135ec0b' });
});

practices.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/welcome', {
      templateUrl: 'welcome.html',
      controller: 'WelcomeController',
      login: true
    }).
    when('/sign-up', {
      templateUrl: 'sign-up.html',
      controller: 'WelcomeController',
      public: true
    }).
    when('/reminders', {
      templateUrl: 'reminders.html',
      controller: 'RemindersController'
    }).
    when('/lengths', {
      templateUrl: 'lengths.html',
      controller: 'LengthsController'
    }).
    when('/begin/:type', {
      templateUrl: 'begin.html',
      controller: 'BeginController'
    }).
    when('/check-in/:type', {
      templateUrl: 'check-in.html',
      controller: 'CheckInController'
    }).
    when('/complete', {
      templateUrl: 'complete.html',
      controller: 'CompleteController'
    }).
    when('/logout', {
      template: ' ',
      controller: 'LogoutController'
    }).
    otherwise({
      redirectTo: '/reminders'
    });
  }
]);
