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

  $scope.playChime = function() {
    document.getElementById('chime').play();
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

practices.controller('RemindersController', function($scope, $location, user) {
  // Method has multiple responsibilities! Refactor!
  // Sets data or redirects onboarded users.
  $scope.getCurrentUser = function() {
    user.getCurrent().then(function(currentUser) {
      if(currentUser.properties.reminder_frequency.value !== 0) {
        $location.path('/lengths');
      } else {
        $scope.current_user_id = currentUser.user_id;
      }
    });
  };

  $scope.setReminderFrequency = function(frequency) {
    UserApp.User.save({
      "user_id": $scope.current_user_id,
      "first_name": 'Colab',
      "properties": {
        "reminder_frequency": frequency
      }
    }, function(error, result) {
      if(!error) {
        $scope.trackEvent('Chose a Reminder Frequency', { "frequency": frequency });
        $scope.alertTestUsers();
        $location.path('/lengths');
        $scope.$apply();
      } else {
        $scope.error = error;
      }
    });
  };

  $scope.alertTestUsers = function() {
    alert(
      'TESTERS: This feature is not working yet. ' +
      'Please set recurring reminders for yourself at the ' +
      'frequency you selected. Thank you! :)'
    );
  };

  // -------------------------------------------------------
  // Initialize

  $scope.getCurrentUser();
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
    // HACK ALERT: Mobile Safari Audio
    // Chime is played here instead of on /check-in,
    // with a 5-second delay, to compensate for Mobile
    // Safari.
    $scope.playChime();
    //
    // END HACK ALERT

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
  $scope.chime       = new Audio('/sounds/bowl.mp3');

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
    $scope.contemplating = false;
    $scope.expressing = false;

    $timeout(function() {
      $scope.contemplate();
    }, 5000);
  };

  $scope.contemplate = function() {
    $scope.preparing = true;
    $scope.contemplating = true;
    $scope.expressing = false;

    // HACK ALERT: Mobile Safari Audio
    // This is really where this SHOULD go, but it is done for the
    // first time on /begin because Mobile Safari won't play audio
    // without a click event.
    //
    // $scope.playChime();
    //
    // END HACK ALERT
  };

  $scope.express = function() {
    $scope.preparing = false;
    $scope.contemplating = false;
    $scope.expressing = true;
  };

  $scope.evaluate = function(evaluation) {
    // HACK ALERT: Mobile Safari Audio
    // This is done on click rather than in flow to cater to
    // Mobile Safari.
    //
    $scope.playChime();
    //
    // END HACK ALERT

    // Use the Expression input if it's filled out.
    if(!!$scope.expression) {
      evaluation = $scope.expression;
    };

    $scope.trackEvent('Evaluated his/her state of ' + $scope.currentStep, { "Check-In Type": $scope.checkInType, "Evaluation": evaluation });
    $scope.nextStep();
  };

  $scope.playChime = function() {
    $scope.chime.currentTime = 0;
    $scope.chime.play();
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
    $scope.startTimer();
    $scope.prepare();
  };

  $scope.startTimer = function() {
    $scope.$broadcast('timer-start');
  };

  // -------------------------------------------------------
  // Initialize - Run

  $scope.prepare();
});

// -------------------------------------------------------
// Completion

practices.controller('CompleteController', function($scope) {
});
