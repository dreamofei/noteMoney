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

.controller('NoteCtrl', function ($scope, $cordovaDatePicker, $cordovaSQLite, dfCommonService, $cordovaDialogs, $cordovaToast, $ionicActionSheet, $ionicPopup,$timeout) {

    //为了实现真正的双向绑定，先定义一个顶级对象,接下来所以得对象都定义到baseObj下，犹如baseObj的属性一样。
    $scope.baseObj = new Object();

    //选择日期,初始化今天
    $scope.baseObj.payDate = dfCommonService.ConvertToDate(new Date());
    $scope.pickDate = function () {
        var options = {
            date: new Date(),
            mode: 'date'
        };

        $cordovaDatePicker.show(options).then(function (date) {
            //var finalDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            var finalDate = dfCommonService.ConvertToDate(date);
            $scope.baseObj.payDate = finalDate;
        });
    }

    //添加payType
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
            $cordovaToast.show('类型已清空', 'short', 'center').then(function (success) { }, function (error) { });
            $scope.selectPayType();
        }, function (err) {
            alert(err);
        });
    }
    //删除指定payType
    $scope.deletePayTypeById = function (id) {
        var query = "delete from tb_payType where Id=?";
        $cordovaSQLite.execute(db, query,[id]).then(function (res) {
            $cordovaToast.show('删除成功', 'short', 'center').then(function (success) { }, function (error) { });
            $scope.selectPayType();
        }, function (err) {
            alert(err);
        });
    }
    //修改指定payType
    $scope.updatePayType = function (modifiedPayType) {
        var query = "update tb_payType set Name=? where Id=?";
        $cordovaSQLite.execute(db, query, [modifiedPayType.Name,modifiedPayType.Id]).then(function (res) {
            $cordovaToast.show('修改成功', 'short', 'center').then(function (success) { }, function (error) { });
            $scope.selectPayType();
        }, function (err) {
            alert(err);
        });
    }
    //查询payType
    $scope.selectPayType = function () {
        var query = "SELECT Id,Name FROM tb_payType";
        //var tempPayTypes = [{ Id: '100', Name: '餐饮' }, { Id: '101', Name: '服饰' }, { Id: '102', Name: '交通' }];
        var tempPayTypes = [];
        $cordovaSQLite.execute(db, query).then(function (res) {
            if (res.rows.length > 0) {
                //console.log("count->" + res.rows.length);
                for (var i = 0; i < res.rows.length; i++) {
                    //console.log(angular.toJson(res.rows));
                    tempPayTypes.push({ Id: res.rows.item(i).Id , Name: res.rows.item(i).Name });
                }
                $scope.baseObj.selectIndex = tempPayTypes[0].Id;//设置默认选中类型
            } else {
                $cordovaToast.show('没有任何类别', 'short', 'center').then(function (success) { }, function (error) { });
            }
            $scope.payTypes = tempPayTypes.concat([{ Id: '-1', Name: '✚' }]);
        }, function (err) {
            alert(err);
        });
    }

    //$scope.payTypes = [{ Id: '-1', Name: '<i class="icon ion-ios-plus-empty">::before</i>' }];

    //初始化类别
    $timeout($scope.selectPayType, 300);
    $timeout($scope.selectPayType, 1000);//防止第一次300毫秒没加载完，再试一次。
    //$scope.selectPayType();

    //用户选择类别
    $scope.payTypeSelect = function (index) {
        if (index == -1) {
            $ionicPopup.prompt({
                title: '添加新类别',
                inputPlaceholder: '简约的名字更时尚...',
                cancelText: '取消',
                okText: '确定',
                okType:'button-balanced'
            }).then(function (res) {
                if (res != undefined) {
                    if (res != '') {
                        $scope.insertPayType(res);
                    } else {
                        $cordovaToast.show('类别名不能为空', 'short', 'center').then(function (success) { }, function (error) { });
                    }
                }
            });

        } else {
            $scope.baseObj.selectIndex = index;
        }
    }
    //判断pays表中是否有指定id的payType（删除payType时判断，如果存在就不能删除）
    var safeDeletePayType = function (id) {
        var query = "SELECT Id FROM tb_pays WHERE PayType=?";
        $cordovaSQLite.execute(db, query, [id]).then(function (res) {
            if (res.rows.length > 0) {
                $ionicPopup.alert({ title: '注意', template: '该类型存在账单数据，不能删除',okText:'确定',okType:'button-balanced' }).then(function (res) { });
            } else {
                $scope.deletePayTypeById(id);
            }
        }, function (err) {
            alert(err);
        });
    }

    //长按类别，删除/修改类别
    $scope.payTypeOnHold = function (index,name) {
        //当index==-1的是添加按钮，不需要删除
        if (index != -1) {
            $ionicActionSheet.show({
                buttons: [
                    { text: '修改名称' },
                    { text: '删除' }
                ],
                buttonClicked: function (btnIndex) {
                    if (btnIndex == 0) {
                        //修改按钮被点击，执行修改操作
                        $ionicPopup.prompt({
                            title: '修改类别名称',
                            inputPlaceholder: name,
                            cancelText: '取消',
                            okText: '确定',
                            okType:'button-balanced'
                        }).then(function (res) {
                            if (res != undefined) {
                                if (res != '') {
                                    $scope.updatePayType({Id:index,Name:res});
                                } else {
                                    $cordovaToast.show('类别名不能为空', 'short', 'center').then(function (success) { }, function (error) { });
                                }
                            }
                        });
                    }
                    if (btnIndex == 1) {
                        //删除按钮被点击，执行删除操作.当点击确定时res返回true，否则返回false
                        $ionicPopup.confirm({
                            title: '危险操作',
                            template: '确定要删除吗?',
                            cancelText: '取消',
                            okText: '确定',
                            okType:'button-assertive'
                        }).then(function (res) {
                            if (res) {
                                safeDeletePayType(index);
                            }
                        });
                    }
                    return true;
                }
            });
        }
    }
    //记录一笔账
    $scope.insertACost = function () {
        var query = "INSERT INTO tb_pays(PayDay,PayOut,PayType,Remark,InDateTime) VALUES(?,?,?,?,?)";
        //alert($scope.baseObj.payOut);
        
        if ($scope.baseObj.payOut == undefined) {
            $ionicPopup.alert({ title: '注意', template: '请输入正确的金额',okText:'确定',okType:'button-balanced' }).then(function (res) {
                $scope.isFocus = true;//自定义directive来实现获取焦点
                //$timeout(function () {
                //    document.getElementById('payOutID').focus();
                //},100);
            });
            return;
        } 

        $cordovaSQLite.execute(db, query, [$scope.baseObj.payDate, $scope.baseObj.payOut, $scope.baseObj.selectIndex, $scope.baseObj.remark, dfCommonService.ConvertToDateTime(new Date())]).then(function (res) {
            $cordovaToast.show('记账成功', 'short', 'center').then(function (success) { }, function (error) { });
            resetModels();
        }, function (err) {
            alert(err);
        });
    }
    //为了当金额不合法时获取焦点，在失去焦点时设置isFocus为false
    $scope.payOutBlur = function () {
        $scope.isFocus = false;
    }

    //重置表单
    var resetModels = function () {
        $scope.baseObj.payOut = '';
        $scope.baseObj.remark = '';
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

.controller('CountCtrl', function ($scope, $rootScope, dfCommonService, $cordovaSQLite, DataStorage, $ionicPopup,$timeout) {
    $scope.name = 'this is COuntCtrl';

    $scope.baseObj = new Object();
    $scope.baseObj.startDate =new Date(dfCommonService.FirstDateOfCurrentMouth());
    $scope.baseObj.endDate = new Date();
    
    //得到指定日期区间的合计金额
    var SetSumPay = function (startDate,endDate) {
        var query = "SELECT SUM(PayOut) AS SumPay FROM tb_pays WHERE date(PayDay) BETWEEN date(?) AND date(?)";
        $cordovaSQLite.execute(db, query, [startDate, endDate]).then(function (res) {
            $scope.baseObj.sumPay = res.rows.item(0).SumPay;
        }, function (err) {
            alert(err);
        });
    }
    //得到指定时间区间内每个类别的花销合计，结果转化成chart所需数据格式
    var SetDataForChart = function (startDate, endDate) {
        var query = "SELECT SUM(PayOut) GrpSumPay,B.Name PayType"+
            " FROM tb_pays AS A JOIN tb_payType AS B ON A.payType=B.Id"+
            " WHERE date(PayDay) BETWEEN date(?) AND date(?) GROUP BY B.Name";
        $cordovaSQLite.execute(db, query, [startDate, endDate]).then(function (res) {
            //alert(JSON.stringify(res.rows.items));
            var groupCount = [];
            for (var i = 0; i < res.rows.length; i++) {
                var temp = { name: res.rows.item(i).PayType, y: res.rows.item(i).GrpSumPay };
                groupCount.push(temp);
            }
            $scope.baseObj.dataForChart = groupCount;
        }, function (err) {
            alert(err);
        });
    }
    //得到指定区间的消费详情列表
    var SetPayList = function (startDate, endDate) {
        var query = "SELECT A.Id,A.PayDay,A.PayOut,B.Name AS PayType,A.Remark,A.InDateTime"+
                    " FROM tb_pays AS A"+
                    " JOIN tb_payType AS B"+
                    " ON A.PayType=B.Id"+
                    " WHERE date(PayDay) BETWEEN date(?) AND date(?)"+
                    " ORDER BY A.PayDay";
        $cordovaSQLite.execute(db, query, [startDate, endDate]).then(function (res) {
            var tempPayList = [];
            for (var i = 0; i < res.rows.length; i++) {
                var tempItem=res.rows.item(i);
                var temp = {Id:tempItem.Id,PayDay:tempItem.PayDay,PayOut:tempItem.PayOut, PayType: tempItem.PayType, Remark:tempItem.Remark,InDateTime:tempItem.InDateTime };
                tempPayList.push(temp);
            }
            $scope.baseObj.payList = tempPayList;
            //alert(JSON.stringify(tempPayList));
            //通过service共享payList
            DataStorage.SetPayList(tempPayList);

        }, function (err) {
            alert(err);
        });
    }
    //获取sumPay,DataForChart,PayList，并显示chart
    $scope.GetCountData = function () {
        var startDate = dfCommonService.ConvertToDate($scope.baseObj.startDate);
        var endDate = dfCommonService.ConvertToDate($scope.baseObj.endDate);

        SetSumPay(startDate, endDate);
        SetDataForChart(startDate, endDate);
        SetPayList(startDate, endDate);

        //如果有数据才显示报表区域,因为数据都是异步加载，所以给个延迟（先这么用，如果数据量大的话会有问题）-------------需修改-------
        $timeout(function () {
            if ($scope.baseObj.dataForChart.length > 0) {
                $scope.isShowCountArea = true;
                $scope.showChart();
            } else {
                $scope.isShowCountArea = false;
                $ionicPopup.alert({ title: '提示', template: '该时间段没有账单' }).then(function (res) { });
            }
        }, 50);
        
        
    }

    $scope.showChart = function () {
        var charts=new Highcharts.Chart({
            chart: {
                renderTo: 'chartContainer'
            },
            title: {
                //floating:true,
                //text: '各类花费的百分比'
                text: null,
                floating: true,
                margin:-1000
            },
            tooltip: {
                pointFormat: '{series.name}:<b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        color: '#000000',
                        connectorColor: '#000000',
                        format: '<b>{point.name}</b>: {point.y}，{point.percentage:.1f}%'
                    }
                }
            },
            credits:{
                enabled: true // 是否禁用版权信息
                ,text:'消费分布'
            },
            //series: [{
            //    type: 'pie',
            //    name: '占总花费',
            //    data: [
            //        ['Firefox', 45.0],
            //        ['IE', 26.8],
            //        {
            //            name: 'Chrome',
            //            y: 12.8,
            //            sliced: true,
            //            selected: true
            //        },
            //        ['Safari', 8.5],
            //        ['Opera', 6.2],
            //        {
            //            name: '吃饭'
            //            ,y:0.7
            //        }
            //    ]
            //}]

            series: [{
                type: 'pie',
                name: '占总花费',
                data: $scope.baseObj.dataForChart
            }]
        });
    }


})

.controller('CountDetailCtrl', function ($scope, $stateParams) {
    $scope.payDetail = JSON.parse($stateParams.pay);
})

.controller('CountListCtrl', function ($scope, $rootScope, DataStorage, $ionicPopup) {
    //通过service共享payList
    $scope.payList = DataStorage.GetPayList();

    //--begin 隐藏功能
    $scope.deleteAllPays = function () {
        $ionicPopup.confirm({
            title: '危险操作',
            template: '你触发了“清空账单”隐藏功能,确定清空所有账单数据吗?',
            cancelText: '取消',
            okText: '确定',
            okType:''
        }).then(function (res) {
            if (res) {
                var query = "DELETE FROM tb_pays";
                $cordovaSQLite.execute(db, query).then(function (res) {
                    alert("已清除");
                }, function (err) {
                    alert(err);
                });
            }
        });
    }
    //--End 隐藏功能

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
