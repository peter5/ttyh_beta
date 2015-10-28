


angular.module('Oddjobs',['ionic', 'Oddjobs.services','Oddjobs.controllers','flexcalendar' , 'pascalprecht.translate'])

.run(function($ionicPlatform, $rootScope, $state, $ionicLoading, $log,
	My, User){

  AV.initialize('dyAEWUwSAJqKpSyqjF4ebYcO','o5NdeR6pOKE2x1IVk5I4F0Vn')
  $ionicPlatform.ready(function() {

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

  });



  $rootScope.requestErrorHandler = function(options, callback) {
    return function(response) {
      var error;
      if (response.data && response.data.error_msg) {
        error = errorMsg[response.data.error_msg];
      } else {
        error = errorMsg[response.status] || 'Error: ' + response.status + ' ' + response.statusText;
      }
      var o = options || {};
      angular.extend(o, {
        template: error,
        duration: 1000
      });
      $ionicLoading.show(o);
      return callback && callback();
    };
  };


  

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

.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}])

.config(function($stateProvider, $urlRouterProvider) {


  $stateProvider

    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "views/tabs.html"
  })

 

  .state('tab.home', {
      url: '/home',
      views: {
        'tab-home': {
          templateUrl: 'views/job/home.html',
          controller: 'HomeCtrl'
        }
      }
    })

  .state('tab.homeguide',{
    url:'/home/guide',
    views:{
      'tab-home':{
        templateUrl:'views/my/guide.html'
      }
    }
  })

  .state('tab.jobs', {
      url: '/home/jobs/:tab',
      views: {
        'tab-home': {
          templateUrl: 'views/job/jobs.html',
          controller: 'JobsCtrl'
        }
      }
    })

  .state('tab.job-detail', {
    url: '/home/jobs/job-detail/:id',
    views: {
      'tab-home': {
        templateUrl: 'views/job/job.html',
        controller: 'JobCtrl'
      }
    }
  })

  .state('tab.job-group', {
    url: '/home/jobs/job-detail/job-group/:id',
    views: {
      'tab-home': {
        templateUrl: 'views/job/jobgroup.html',
        controller: 'JobGroupCtrl'
      }
    }
  })


  .state('tab.promote-job-detail', {
    url: '/home/job-detail/:id',
    views: {
      'tab-home': {
        templateUrl: 'views/job/job.html',
        controller: 'JobCtrl'
      }
    }
  })

  .state('tab.job-group_promote', {
    url: '/home/job-detail/job-group/:id',
    views: {
      'tab-home': {
        templateUrl: 'views/job/jobgroup.html',
        controller: 'JobGroupCtrl'
      }
    }
  })


  .state('tab.explore', {
    url: '/explore',
    views: {
      'tab-explore': {
        templateUrl: 'views/explore/explore.html',
        controller: 'ExploreCtrl'
      }
    }
  })


  .state('tab.group', {
    url: '/explore/group',
    views: {
      'tab-explore': {
        templateUrl: 'views/explore/group.html',
        controller: 'GroupCtrl'
      }
    }
  })

  .state('tab.group-detail', {
    url: '/explore/group/group-detail/:id',
    views: {
      'tab-explore': {
        templateUrl: 'views/explore/group-detail.html',
        controller: 'GroupDetailCtrl'
      }
    }
  }) 

  .state('tab.waitInterview',{
    url:'/explore/waitInterview/:id',
    views:{
      'tab-explore':{
        templateUrl:'views/explore/waitInterview.html',
        controller: 'WaitInterviewCtrl'
      }
    }
  })

  .state('tab.waitInterview-jobDetail',{
    url:'/explore/waitInterview/detail/:id',
    views:{
      'tab-explore':{
        templateUrl:'views/job/job.html',
        controller: 'JobCtrl'
      }
    }
  })


  .state('tab.waitApply',{
    url:'/explore/waitApply/:id',
    views:{
      'tab-explore':{
        templateUrl:'views/explore/waitApply.html',
        controller: 'WaitApplyCtrl'
      }
    }
  })

  .state('tab.waitApply-jobDetail',{
    url:'/explore/waitApply/detail/:id',
    views:{
      'tab-explore':{
        templateUrl:'views/job/job.html',
        controller: 'JobCtrl'
      }
    }
  })

  .state('tab.processing',{
    url:'/explore/processing/:id',
    views:{
      'tab-explore':{
        templateUrl:'views/explore/processing.html',
        controller: 'PrcessingCtrl'
      }
    }
  })


  .state('tab.processing-jobDetail',{
    url:'/explore/processing/detail/:id',
    views:{
      'tab-explore':{
        templateUrl:'views/job/job.html',
        controller: 'JobCtrl'
      }
    }
  })

  .state('tab.completed',{
    url:'/explore/completed/:id',
    views:{
      'tab-explore':{
        templateUrl:'views/explore/completed.html',
        controller: 'CompletedCtrl'
      }
    }
  }) 
  .state('tab.completed-jobDetail',{
    url:'/explore/processing/detail/:id',
    views:{
      'tab-explore':{
        templateUrl:'views/job/job.html',
        controller: 'JobCtrl'
      }
    }
  })

  
  .state('tab.my', {
    url: '/my',
    views: {
      'tab-my': {
        templateUrl: 'views/my/my.html',
        controller: 'MyCtrl'
      }
    }
  })

  .state('tab.resume',{
    url:'/my/resume',
    views:{
      'tab-my':{
        templateUrl:'views/my/resume.html',
        controller:'ResumeCtrl'
      }
    }
  })

  .state('tab.guide',{
    url:'/my/guide',
    views:{
      'tab-my':{
        templateUrl:'views/my/guide.html'
      }
    }
  })
  .state('tab.invite',{
    url:'/my/invite',
    views:{
      'tab-my':{
        templateUrl:'views/my/invite.html',
        controller:'InviteCtrl'
      }
    }
  })

  .state('tab.wallet',{
    url:'/my/wallet',
    views:{
      'tab-my':{
        templateUrl:'views/my/wallet.html',
        controller:'WalletCtrl'
      }
    }
  })

  .state('tab.addwallet',{
    url:'/my/wallet/add',
    views:{
      'tab-my':{
        templateUrl:'views/my/addwallet.html',
        controller:'AddWalletCtrl'
      }
    }
  })


  


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/home');
});






