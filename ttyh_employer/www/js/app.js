// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services','flexcalendar' , 'pascalprecht.translate','ngFileUpload','ionic-timepicker'])

.run(function($ionicPlatform) {

  AV.initialize('dyAEWUwSAJqKpSyqjF4ebYcO','o5NdeR6pOKE2x1IVk5I4F0Vn');
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(['$provide', function($provide) {
  'use strict';

  $provide.decorator('$browser', ['$delegate', '$window', function($delegate, $window) {

    if (isIOS9UIWebView($window.navigator.userAgent)) {
      return applyIOS9Shim($delegate);
    }

    return $delegate;

    function isIOS9UIWebView(userAgent) {
      return /(iPhone|iPad|iPod).* OS 9_\d/.test(userAgent) && !/Version\/9\./.test(userAgent);
    }

    function applyIOS9Shim(browser) {
      var pendingLocationUrl = null;
      var originalUrlFn= browser.url;

      browser.url = function() {
        if (arguments.length) {
          pendingLocationUrl = arguments[0];
          return originalUrlFn.apply(browser, arguments);
        }

        return pendingLocationUrl || originalUrlFn.apply(browser, arguments);
      };

      $window.addEventListener('popstate', clearPendingLocationUrl, false);
      $window.addEventListener('hashchange', clearPendingLocationUrl, false);

      function clearPendingLocationUrl() {
        pendingLocationUrl = null;
      }

      return browser;
    }
  }]);
}])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })


  .state('tab.home', {
      url: '/home',
      views: {
        'tab-home': {
          templateUrl: 'templates/home.html',
          controller: 'HomeCtrl'
        }
      }
    })



  .state('tab.jobs', {
      url: '/home/jobs/:tab',
      views: {
        'tab-home': {
          templateUrl: 'templates/jobs.html',
          controller: 'JobsCtrl'
        }
      }
    })

  .state('tab.job-detail', {
    url: '/home/jobs/job-detail/:id',
    views: {
      'tab-home': {
        templateUrl: 'templates/job.html',
        controller: 'JobCtrl'
      }
    }
  })
  .state('tab.jobstatus', {
    url: '/home/jobstatus/:id',
    views: {
      'tab-home': {
        templateUrl: 'templates/jobstatus.html',
        controller: 'JobStatusCtrl'
      }
    }
  })

  .state('tab.postJobs', {
    url: '/postJobs',
    views: {
      'tab-postJobs': {
        templateUrl: 'templates/postJobs.html',
        controller: 'PostJobsCtrl'
      }
    }
  })

  .state('tab.postJob', {
    url: '/postJobs/postJob',
    views: {
      'tab-postJobs': {
        templateUrl: 'templates/postJob.html',
        controller: 'PostJobCtrl'
      }
    }
  })

  .state('tab.postjob-detail', {
    url: '/postJobs/job-detail/:id',
    views: {
      'tab-postJobs': {
        templateUrl: 'templates/job.html',
        controller: 'JobCtrl'
      }
    }
  })

  .state('tab.my', {
    url: '/my',
    views: {
      'tab-my': {
        templateUrl: 'templates/my.html',
        controller: 'MyCtrl'
      }
    }
  })

  .state('tab.profile',{
    url:'/my/profile',
    views:{
      'tab-my':{
        templateUrl:'templates/resume.html',
        controller:'ResumeCtrl'
      }
    }
  })

  .state('tab.renzheng', {
    url: '/my/renzheng',
    views: {
      'tab-my': {
        templateUrl: 'templates/renzheng.html',
        controller: 'RenzhengCtrl'
      }
    }
  })

  .state('tab.guide', {
    url: '/my/guide',
    views: {
      'tab-my': {
        templateUrl: 'templates/guide.html',
        controller: 'GuideCtrl'
      }
    }
  });  


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/home');

});
