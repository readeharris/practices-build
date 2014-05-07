// -------------------------------------------------------
// Application

practices.controller('ApplicationController', function($scope, user) {
  // -------------------------------------------------------
  // Functions

  $scope.initializeFastClick = function() {
    $(document).ready(function() {
      FastClick.attach(document.body);
    });
  };


  $scope.trackEvent = function(event_name, event_data) {
    user.getCurrent().then(function(currentUser) {
      var default_data = { "distinct_id": currentUser.user_id }
      $.extend(event_data, default_data);
      mixpanel.identify(currentUser.user_id);
      mixpanel.people.set({
        "$email": currentUser.email
      });
      mixpanel.track(event_name, event_data);
    });
  }

  // -------------------------------------------------------
  // Initialize

  $scope.initializeFastClick();
  $scope.initializePush();
});

// -------------------------------------------------------
// Welcome

practices.controller('WelcomeController', function($scope, $location, user) {
  $scope.redirectAuthenticatedUsers = function() {
    if(user.status().authenticated) {
      $location.path('/reminders');
    };
  };

  $scope.redirectAuthenticatedUsers();
});

// -------------------------------------------------------
// Log Out

practices.controller('LogoutController', function(user, $location) {
  user.logout();
});

// -------------------------------------------------------
// Reminders
//
// Currently the first step that does not require authentication,
// so Push Notifications are initialized here.
//
// TODO: Refactor Push logic into a Factory.
//

practices.controller('RemindersController', function($scope, $location, user) {
  $scope.handleCurrentUser = function() {
    user.getCurrent().then(function(currentUser) {
      if(currentUserHasSetReminders()) { 
        $scope.redirectRemindedUsers();
      } else {
        $scope.current_user_id = currentUser.user_id;
        $scope.initializePush();
      }
    });
  };

  $scope.setReminderFrequency = function(frequency) {
    UserApp.User.save({
      "user_id": $scope.current_user_id,
      "properties": {
        "reminder_frequency": frequency
      }
    }, function(error, result) {
      if(!error) {
        $scope.trackEvent('Chose a Reminder Frequency', { "frequency": frequency });
        $scope.redirectRemindedUsers();
        $scope.$apply();
      } else {
        $scope.error = error;
      }
    });
  };

  $scope.initializePush = function() {
    $(document).ready(function() {
      var pushNotification = window.plugins.pushNotification;

      var tokenHandler = function(result) {
        $scope.setUserDevice('ios', result);
      }

      var errorHandler = function(err) {
        console.log(err);
      }

      var successHandler = function(result) {
        console.log('Success');
      }

      if (device.platform == 'android' || device.platform == 'Android') {
        pushNotification.register(
          successHandler,
          errorHandler, {
            "senderID":"150054670823",
            "ecb":"onNotificationGCM"
          }
        );
      } else {
        pushNotification.register(
          tokenHandler,
          errorHandler, {
            "badge":"true",
            "sound":"true",
            "alert":"true",
            "ecb":"onNotificationAPN"
        });
      }
    });
  };

  $scope.setUserDevice = function(device_type, device_id) {
    UserApp.User.save({
      "user_id": $scope.current_user_id,
      "properties": {
        "device_type": device_type,
        "device_id": device_id
      }
    }, function(error, result) {
      if(!error) {
        console.log('set device id for user ' + $scope.current_user_id);
      } else {
        $scope.error = error;
      }
    });
  };

  $scope.currentUserHasSetReminders = function() {
    currentUser.properties.reminder_frequency.value !== 0;
  };

  $scope.redirectRemindedUsers = function() {
    $location.path('/lengths');
  };


  // -------------------------------------------------------
  // Initialize

  $scope.handleCurrentUser();
});

// -------------------------------------------------------
// Lengths

practices.controller('LengthsController', function($scope, $location) {
  $scope.$on('$routeChangeSuccess', function() {
    $scope.trackEvent('Prompted to Choose a Check-In');
  });

  $scope.selectCheckIn = function(type) {
    $scope.trackEvent('Chose a Check-In', { "Check-In Type": type });
    $location.path('/begin/' + type);
  };
});

// -------------------------------------------------------
// Beginning

practices.controller('BeginController', function($scope, $timeout, $routeParams, $location) {
  $scope.proceed = function() {
    $scope.trackEvent('Began a Check-In', { "Check-In Type": $routeParams.type });
    $location.path('/check-in/' + $routeParams.type);
  };
});

// -------------------------------------------------------
// Check-Ins

practices.controller('CheckInController', function($scope, $location, $routeParams, $timeout) {
  $scope.checkInType = $routeParams.type;
  $scope.steps       = ['mind', 'body', 'heart'];
  $scope.stepIndex   = 0;
  $scope.currentStep = $scope.steps[$scope.stepIndex];

  // -------------------------------------------------------
  // Events

  $scope.$on('timer-stopped', function() {
    $scope.express();
    $scope.$apply();
  });

  // -------------------------------------------------------
  // Functions

  $scope.prepare = function() {
    $scope.preparing = true;
    $scope.expressing = false;
  };

  $scope.express = function() {
    $scope.preparing = false;
    $scope.expressing = true;
  };

  $scope.evaluate = function(evaluation) {
    // Use the Expression input if it's filled out.
    if(!!$scope.expression) {
      evaluation = $scope.expression;
    };

    $scope.trackEvent('Evaluated his/her state of ' + $scope.currentStep, { "Check-In Type": $scope.checkInType, "Evaluation": evaluation });
    $scope.nextStep();
  };

  $scope.nextStep = function() {
    $scope.stepIndex += 1;

    if(($scope.stepIndex + 1) <= $scope.steps.length) {
      $scope.proceedToNextStep();
    } else {
      $location.path('/complete');
    }
  };

  $scope.proceedToNextStep = function() {
    angular.element('input#expression').val(''); // Reset text field.

    $scope.currentStep = $scope.steps[$scope.stepIndex]
    $scope.prepare();
  };

  // -------------------------------------------------------
  // Initialize - Run

  $scope.prepare();
});

// -------------------------------------------------------
// Completion

practices.controller('CompleteController', function($scope) {
});
