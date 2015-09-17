﻿angular.module('starter.controllers', [])

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

.controller('NoteCtrl', function ($scope, $cordovaDatePicker, $cordovaSQLite, dfCommonService, $cordovaDialogs, $cordovaToast, $ionicActionSheet) {

    //为了实现真正的双向绑定，先定义一个顶级对象,接下来所以得对象都定义到baseObj下，犹如baseObj的属性一样。
    $scope.baseObj = new Object();

    //选择日期,初始化今天
    $scope.baseObj.noteDate = dfCommonService.ConvertToDate(new Date());
    $scope.pickDate = function () {
        var options = {
            date: new Date(),
            mode: 'date'
        };

        $cordovaDatePicker.show(options).then(function (date) {
            var finalDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            $scope.baseObj.noteDate = finalDate;
        });
    }

    //添加payType
    //$scope.baseObj.newPayType = null;
    $scope.insertPayType = function (newPayType) {
        var query = "INSERT INTO tb_payType(Name) VALUES(?)";
        $cordovaSQLite.execute(db, query, [newPayType]).then(function (res) {
            $cordovaToast.show('添加成功', 'short', 'center').then(function (success) { }, function (error) { });
            $scope.selectPayType();
        }, function (err) {
            alert(err);
        });
    }
    //删除全部payType
    $scope.deleteAllPayType = function () {
        var query = "delete from tb_payType";
        $cordovaSQLite.execute(db, query).then(function (res) {
            alert("payType已清空");
            $scope.selectPayType();
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
                    tempPayTypes.push({ Id: res.rows.item(i).Id , Name: res.rows.item(i).Name });
                }
            } else {
                alert("0条记录");
            }
            $scope.payTypes = tempPayTypes.concat([{ Id: '-1', Name: '✚' }]);
        }, function (err) {
            alert(err);
        });
    }

    //初始化类别
    $scope.selectPayType();

    //用户选择类别
    $scope.selectIndex = 100;
    $scope.payTypeSelect = function (index) {
        if (index == -1) {
            $cordovaDialogs.prompt('简约的名字更时尚', '添加新类别', ['取消', '确定'], '新类别').then(function (result) {
                var btnIndex = result.buttonIndex;
                if (btnIndex == 2) {
                    $scope.insertPayType(result.input1);
                } else {
                    return;
                }
            });
        } else {
            $scope.selectIndex = index;
        }
    }

    //长按类别，删除类别
    $scope.payTypeOnHold = function (index,name) {
        //当index==-1的是添加按钮，不需要删除
        if (index != -1) {
            $ionicActionSheet.show({
                buttons: [
                    { text: '编辑名称' },
                    { text: '删除' }
                ],
                buttonClicked: function (btnIndex) {
                    if (btnIndex == 0) {
                        alert('编辑 '+name);
                    }
                    if (btnIndex == 1) {
                        //删除按钮被点击，执行删除操作
                        $cordovaDialogs.confirm('确定要删除吗?','危险操作',['取消','确定']).then(function (buttonIndex) {
                            if (buttonIndex == 2) {
                                alert('真删除了');
                            } else {
                                return;
                            }
                        });
                    }
                    return true;
                }
            });
        }
    }

    //-----begin 隐藏功能

    //长按类别字样，触发清空类别功能
    $scope.hideUtil_payTypeOnHold = function () {
        $cordovaDialogs.confirm('你触发了“清空所有类别”隐藏功能，确定清空吗?', '危险操作', ['取消', '确定']).then(function (buttonIndex) {
            if (buttonIndex == 2) {
                $scope.deleteAllPayType();
            } else {
                return;
            }
        });
    }

    //-----End 隐藏功能

})

.controller('AccountCtrl', function ($scope, $ionicPopup) {
  $scope.settings = {
    enableFriends: true
  };

  $scope.showConfirm = function () {
      var confirmPopup = $ionicPopup.confirm({
          title: 'Consume Ice Cream',
          template: 'Are you sure you want to eat this ice cream?'
      });
      confirmPopup.then(function (res) {
          if (res) {
              console.log('You are sure');
          } else {
              console.log('You are not sure');
          }
      });

  };

  $scope.showPopup = function () {
      $scope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
          template: '<input type="password" ng-model="data.wifi">',
          title: 'Enter Wi-Fi Password',
          subTitle: 'Please use normal things',
          scope: $scope,
          buttons: [
            { text: 'Cancel' },
            {
                text: '<b>Save</b>',
                type: 'button-positive',
                onTap: function (e) {
                    if (!$scope.data.wifi) {
                        //don't allow the user to close unless he enters wifi password
                        e.preventDefault();
                    } else {
                        return $scope.data.wifi;
                    }
                }
            }
          ]
      });
      myPopup.then(function (res) {
          console.log('Tapped!', res);
      });
      $timeout(function () {
          myPopup.close(); //close the popup after 3 seconds for some reason
      }, 3000);
  };
});
