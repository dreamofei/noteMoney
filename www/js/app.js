﻿// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

var db = null;//使用本地数据库SQLite

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova', 'dreamofei.ngCommon'])

.run(function ($ionicPlatform, $cordovaSQLite) {
    $ionicPlatform.ready(function () {
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

        db = $cordovaSQLite.openDB("Note.db");
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS tb_payType(Id integer primary key,Name text)");
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS tb_pays(Id integer primary key,PayDay text,PayOut real,PayType integer,Remark text,InDateTime text)");
    });
})

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    //设置安卓和ios上的tab显示样式
    $ionicConfigProvider.platform.ios.tabs.style('standard');
    $ionicConfigProvider.platform.ios.tabs.position('bottom');
    $ionicConfigProvider.platform.android.tabs.style('standard');
    $ionicConfigProvider.platform.android.tabs.position('bottom');

    $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
    $ionicConfigProvider.platform.android.navBar.alignTitle('center');

    $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
    $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

    $ionicConfigProvider.platform.ios.views.transition('ios');
    $ionicConfigProvider.platform.android.views.transition('android');

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

    // Each tab has its own nav history stack:

    .state('tab.dash', {
        url: '/dash',
        views: {
            'tab-dash': {
                templateUrl: 'templates/tab-dash.html',
                controller: 'DashCtrl'
            }
        }
    })

    .state('tab.chats', {
        url: '/chats',
        views: {
            'tab-chats': {
                templateUrl: 'templates/tab-chats.html',
                controller: 'ChatsCtrl'
            }
        }
    })
      .state('tab.chat-detail', {
          url: '/chats/:chatId',
          views: {
              'tab-chats': {
                  templateUrl: 'templates/chat-detail.html',
                  controller: 'ChatDetailCtrl'
              }
          }
      })

      .state('tab.note', {
          url: '/note',
          views: {
              'tab-note': {
                  templateUrl: 'templates/tab-note.html',
                  controller: 'NoteCtrl'
              }
          }
      })

      .state('tab.count', {
          url: '/count',
          views: {
              'tab-count': {
                  templateUrl: 'templates/tab-count.html',
                  //controller: 'countCtrl'
              }
          }
      })

      .state('tab.count-list', {
          url: '/countlist',
          views: {
              'tab-count': {
                  templateUrl: 'templates/count-list.html',
                  //controller: 'countCtrl'
              }
          }
      })

    .state('tab.count-detail', {
        url: '/countdetail/:pay',
        views: {
            'tab-count': {
                templateUrl: 'templates/count-detail.html',
                //controller: 'countCtrl'
            }
        }
    })

    .state('tab.account', {
        url: '/account',
        views: {
            'tab-account': {
                templateUrl: 'templates/tab-account.html',
                //controller: 'countCtrl'
            }
        }
    })

    .state('tab.123account', {
        url: '/123account',
        views: {
            'tab-123account': {
                templateUrl: 'templates/tab-123account.html',
                controller: '123AccountCtrl'
            }
        }
    })


    ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');
    //$urlRouterProvider.otherwise('/tab/note');

});
