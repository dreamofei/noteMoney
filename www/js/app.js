// Ionic Starter App

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
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS tb_syncQueue(Id integer,OptionType integer,InDateTime text)");//用于数据云同步记录，OptionType 1：新增，-1：删除
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS tb_login(Id integer,UserName text,Email text,PhoneNumber text,Photo blob)");


        //----------
//        //双击退出
//        $ionicPlatform.registerBackButtonAction(function  {

//            //判断处于哪个页面时双击退出
//            if ($state.includes("app.main")) {
//                if ($rootScope.backButtonPressedOnceToExit) {
//                    ionic.Platform.exitApp();
//                } else {
//                    $rootScope.backButtonPressedOnceToExit = true;
//            //$mfaUIcontrol.showToast({ message: "Press once to exit the program!!!" }).then();
//            alert("Press once to exit the program!!!");
//            $timeout(function () {
//                $rootScope.backButtonPressedOnceToExit = false;
//            }, 2000);
//        }
//        }
//    else if ($ionicHistory.backView()) {
//                $ionicHistory.goBack();
//} else {
//                if ($rootScope.backButtonPressedOnceToExit) {
//                    ionic.Platform.exitApp();
//} else {
//    $rootScope.backButtonPressedOnceToExit = true;
//    //$mfaUIcontrol.showToast({ message: "Press once to exit the program!!!" }).then();
//    alert("!Press once to exit the program!!!");
//    $timeout(function () {
//        $rootScope.backButtonPressedOnceToExit = false;
//    }, 2000);
//}
//}
//e.preventDefault();
//return false;
//}, 101);
//});

        //----------

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

    //.state('tab.dash', {
    //    url: '/dash',
    //    views: {
    //        'tab-dash': {
    //            templateUrl: 'templates/test/tab-dash.html',
    //            controller: 'DashCtrl'
    //        }
    //    }
    //})

    //.state('tab.chats', {
    //    url: '/chats',
    //    views: {
    //        'tab-chats': {
    //            templateUrl: 'templates/test/tab-chats.html',
    //            controller: 'ChatsCtrl'
    //        }
    //    }
    //})
    //  .state('tab.chat-detail', {
    //      url: '/chats/:chatId',
    //      views: {
    //          'tab-chats': {
    //              templateUrl: 'templates/test/chat-detail.html',
    //              controller: 'ChatDetailCtrl'
    //          }
    //      }
    //  })

      .state('tab.note', {
          url: '/note',
          views: {
              'tab-note': {
                  templateUrl: 'templates/note/tab-note.html',
                  controller: 'NoteCtrl'
              }
          }
      })

      .state('tab.count', {
          url: '/count',
          views: {
              'tab-count': {
                  templateUrl: 'templates/count/tab-count.html',
                  //controller: 'countCtrl'
              }
          }
      })

      .state('tab.count-list', {
          url: '/countlist',
          views: {
              'tab-count': {
                  templateUrl: 'templates/count/count-list.html',
                  //controller: 'countCtrl'
              }
          }
      })

    .state('tab.count-detail', {
        url: '/countdetail/:pay',
        views: {
            'tab-count': {
                templateUrl: 'templates/count/count-detail.html',
                //controller: 'countCtrl'
            }
        }
    })

    .state('tab.account', {
        url: '/account',
        views: {
            'tab-account': {
                templateUrl: 'templates/account/tab-account.html',
                //controller: 'countCtrl'
            }
        }
    })

    .state('tab.account-backup', {
        url: '/backup',
        views: {
            'tab-account': {
                templateUrl: 'templates/account/account-backup.html',
                //controller: 'countCtrl'
            }
        }
    })

    .state('tab.account-detail', {
        url: '/accountDetail',
        views: {
            'tab-account': {
                templateUrl: 'templates/account/account-detail.html',
            }
        }
    })

    .state('tab.account-register', {
        url: '/accountRegister',
        views: {
            'tab-account': {
                templateUrl: 'templates/account/account-register.html',
            }
        }
    })

    //.state('tab.123account', {
    //    url: '/123account',
    //    views: {
    //        'tab-123account': {
    //            templateUrl: 'templates/tab-123account.html',
    //            controller: '123AccountCtrl'
    //        }
    //    }
    //})


    ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/note');

});
