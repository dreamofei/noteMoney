angular.module('starter.services', [])

.factory('Chats', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var chats = [{
        id: 0,
        name: 'Ben Sparrow',
        lastText: 'You on your way?',
        face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
    }, {
        id: 1,
        name: 'Max Lynx',
        lastText: 'Hey, it\'s me',
        face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
    }, {
        id: 2,
        name: 'Adam Bradleyson',
        lastText: 'I should buy a boat',
        face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
    }, {
        id: 3,
        name: 'Perry Governor',
        lastText: 'Look at my mukluks!',
        face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
    }, {
        id: 4,
        name: 'Mike Harrington',
        lastText: 'This is wicked good ice cream.',
        face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
    }];

    return {
        all: function () {
            return chats;
        },
        remove: function (chat) {
            chats.splice(chats.indexOf(chat), 1);
        },
        get: function (chatId) {
            for (var i = 0; i < chats.length; i++) {
                if (chats[i].id === parseInt(chatId)) {
                    return chats[i];
                }
            }
            return null;
        }
    };
});

var ComSer = angular.module('dreamofei.ngCommon', []);
ComSer.factory('dfCommonService', ['$window', function ($window) {

    return {
        ConvertToDate: function (date) {
            return date.getFullYear() + '-' + this.Add0ForSingleNum(date.getMonth() + 1) + '-' + this.Add0ForSingleNum(date.getDate());
        },
        ConvertToDateTime: function (date) {
            return this.ConvertToDate(date) + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        },
        FirstDateOfCurrentMouth: function () {
            var date = new Date();
            return date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';
        },
        Add0ForSingleNum: function (num) {
            num = num.toString();
            if (num.length == 1) {
                num = '0' + num;
            }
            return num;
        }
    };
}]);

ComSer.factory('DataStorage', function () {
    var dataStorageService = {};

    //count和countDetail间共享payList
    var payList = [];
    dataStorageService.GetPayList = function () {
        return payList;
    }
    dataStorageService.SetPayList = function (data) {
        payList = data;
    }

    //count和countDetail间共享dataForChart
    //var dataForChart = [];
    //dataStorageService.GetDataForChart = function () {
    //    return dataForChart;
    //}
    //dataStorageService.SetDataForChart = function (data) {
    //    dataForChart = data;
    //}

    //count和countDetail间共享dataForChart
    var callBackFun_dataForChart = null;
    dataStorageService.GetCallBack_dataForChart = function () {
        //return dataForChart;
        callBackFun_dataForChart();
    }
    dataStorageService.SetCallBack_dataForChart = function (fun) {
        callBackFun_dataForChart = fun;
    }

    //account和accountDetail之间共享，当detail中退出登录时，回调account中查询登录用户方法刷新登录状态
    var callBackFun_LogOut = null;
    dataStorageService.GetCallBack_LogOut = function () {
        callBackFun_LogOut();
    }
    dataStorageService.SetCallBack_LogOut = function (fun) {
        callBackFun_LogOut = fun;
    }

    return dataStorageService;
});

ComSer.directive('setFocus', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(attrs.setFocus, function (value) {
                if (value == true) {
                    $timeout(function () {
                        element[0].focus();
                    },100);
                }
            });
        }
    };
});
