angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('NoteCtrl', function ($scope, $cordovaDatePicker, $cordovaSQLite, dfCommonService, $cordovaDialogs) {

    //为了实现真正的双向绑定，先定义一个顶级对象,接下来所以得对象都定义到baseObj下，犹如baseObj的属性一样。
    $scope.baseObj = new Object();

    //选择日期,初始化今天
    $scope.baseObj.noteDate = dfCommonService.ConvertToDate(new Date());
    $scope.pickDate = function () {
        var options = {
            date: new Date(),
            mode: 'date', // or 'time'
            //minDate: new Date() - 10000,
            //maxDate:new Date()+10000,
            //allowOldDates: true,
            //allowFutureDates: true,
            //doneButtonLabel: 'DONE',
            //doneButtonColor: '#F2F3F4',
            //cancelButtonLabel: 'CANCEL',
            //cancelButtonColor: '#000000'
        };

        $cordovaDatePicker.show(options).then(function (date) {
            var finalDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            $scope.baseObj.noteDate = finalDate;
        });
    }

    //添加payType
    $scope.baseObj.newPayType = null;
    $scope.insertPayType = function () {
        var query = "INSERT INTO tb_payType(Name) VALUES(?)";
        $cordovaSQLite.execute(db, query, [$scope.baseObj.newPayType]).then(function (res) {
            alert("添加成功");
            $scope.selectPayType();
        }, function (err) {
            alert(err);
        });
    }
    //删除全部payType
    $scope.deletePayType = function () {
        var query = "delete from tb_payType";
        $cordovaSQLite.execute(db, query).then(function (res) {
            alert("payType已清空");
        }, function (err) {
            alert(err);
        });
    }
    //查询payType
    $scope.selectPayType = function () {
        var query = "SELECT Id,Name FROM tb_payType";
        var tempPayTypes = [{ Id: '100', Name: '餐饮' }, { Id: '101', Name: '服饰' }, { Id: '102', Name: '交通' }];
        $cordovaSQLite.execute(db, query).then(function (res) {
            if (res.rows.length > 0) {
                //console.log("count->" + res.rows.length);
                for (var i = 0; i < res.rows.length; i++) {
                    //console.log(angular.toJson(res.rows));
                    //tempPayTypes.push({ Id: "'" + res.rows.item(i).Id + "'", Name: "'" + res.rows.item(i).Name + "'" });
                    tempPayTypes.push({ Id: res.rows.item(i).Id , Name: res.rows.item(i).Name });
                }
            } else {
                alert("0条记录");
            }
            //alert(angular.toJson(tempPayTypes));
            $scope.payTypes = tempPayTypes.concat([{ Id: '-1', Name: '✚' }]);
        }, function (err) {
            alert(err);
        });
    }

    $scope.selectPayType();

    $scope.selectIndex = 0;
    $scope.payTypeSelect = function (index) {
        if (index == -1) {
            alert("add...");
        } else {
            $scope.selectIndex = index;
        }
        //alert($scope.payTypes[$scope.selectIndex]);
    }

    

})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
