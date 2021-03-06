﻿angular.module('starter.controllers', [])

.controller('DashCtrl', function ($scope) { })

.controller('ChatsCtrl', function ($scope, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
        Chats.remove(chat);
    };
})

.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})

.controller('NoteCtrl', function ($scope, $cordovaDatePicker, $cordovaSQLite, dfCommonService, $cordovaDialogs, $cordovaToast, $ionicActionSheet, $ionicPopup, $timeout) {

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
        $cordovaSQLite.execute(db, query, [id]).then(function (res) {
            $cordovaToast.show('删除成功', 'short', 'center').then(function (success) { }, function (error) { });
            $scope.selectPayType();
        }, function (err) {
            alert(err);
        });
    }
    //修改指定payType
    $scope.updatePayType = function (modifiedPayType) {
        var query = "update tb_payType set Name=? where Id=?";
        $cordovaSQLite.execute(db, query, [modifiedPayType.Name, modifiedPayType.Id]).then(function (res) {
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
                    tempPayTypes.push({ Id: res.rows.item(i).Id, Name: res.rows.item(i).Name });
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
                okType: 'button-balanced'
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
                $ionicPopup.alert({ title: '注意', template: '该类型存在账单数据，不能删除', okText: '确定', okType: 'button-balanced' }).then(function (res) { });
            } else {
                $scope.deletePayTypeById(id);
            }
        }, function (err) {
            alert(err);
        });
    }

    //长按类别，删除/修改类别
    $scope.payTypeOnHold = function (index, name) {
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
                            okType: 'button-balanced'
                        }).then(function (res) {
                            if (res != undefined) {
                                if (res != '') {
                                    $scope.updatePayType({ Id: index, Name: res });
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
                            okType: 'button-assertive'
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
            $ionicPopup.alert({ title: '注意', template: '请输入正确的金额', okText: '确定', okType: 'button-balanced' }).then(function (res) {
                $scope.isFocus = true;//自定义directive来实现获取焦点
                //$timeout(function () {
                //    document.getElementById('payOutID').focus();
                //},100);
            });
            return;
        }

        var tempInDateTime = dfCommonService.ConvertToDateTime(new Date());
        $cordovaSQLite.execute(db, query, [$scope.baseObj.payDate, $scope.baseObj.payOut, $scope.baseObj.selectIndex, $scope.baseObj.remark, tempInDateTime]).then(function (res) {
            $cordovaToast.show('记账成功', 'short', 'center').then(function (success) { }, function (error) { });
            resetModels();
            //记账成功后，在同步队列中做记录
            selectPayByInDateTime(tempInDateTime);
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

    //插入数据成功后，将这一信息记录到 同步队列的表中用来做云同步的依据（OptionType 1：新增，-1：删除）
    var insertSyncQueue = function (Id, InDateTime) {
        var query = "INSERT INTO tb_syncQueue(Id,OptionType,InDateTime) values(?,?,?)";
        $cordovaSQLite.execute(db, query, [Id, 1, InDateTime]).then(function (res) {
        }, function (err) {
            alert(err);
        });
    }
    var selectPayByInDateTime = function (InDateTime) {
        var query = "SELECT Id FROM tb_pays WHERE InDateTime=?";
        $cordovaSQLite.execute(db, query, [InDateTime]).then(function (res) {
            if (res.rows.length > 0) {
                insertSyncQueue(res.rows.item(0).Id, InDateTime);
            }
        }, function (err) {
            alert(err);
        });
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

.controller('CountCtrl', function ($scope, $rootScope, dfCommonService, $cordovaSQLite, DataStorage, $ionicPopup, $timeout) {

    $scope.baseObj = new Object();
    $scope.baseObj.startDate = new Date(dfCommonService.FirstDateOfCurrentMouth());
    $scope.baseObj.endDate = new Date();
    $scope.isShowCountArea = false;

    //得到指定日期区间的合计金额
    var SetSumPay = function (startDate, endDate) {
        var query = "SELECT SUM(PayOut) AS SumPay FROM tb_pays WHERE date(PayDay) BETWEEN date(?) AND date(?)";
        $cordovaSQLite.execute(db, query, [startDate, endDate]).then(function (res) {
            $scope.baseObj.sumPay = res.rows.item(0).SumPay;
        }, function (err) {
            alert(err);
        });
    }
    //得到指定时间区间内每个类别的花销合计，结果转化成chart所需数据格式
    var SetDataForChart = function (startDate, endDate) {
        var query = "SELECT SUM(PayOut) GrpSumPay,B.Name PayType" +
            " FROM tb_pays AS A JOIN tb_payType AS B ON A.payType=B.Id" +
            " WHERE date(PayDay) BETWEEN date(?) AND date(?) GROUP BY B.Name";
        $cordovaSQLite.execute(db, query, [startDate, endDate]).then(function (res) {
            //alert(JSON.stringify(res.rows.items));
            var groupCount = [];
            for (var i = 0; i < res.rows.length; i++) {
                var temp = { name: res.rows.item(i).PayType, y: res.rows.item(i).GrpSumPay };
                groupCount.push(temp);
            }
            $scope.baseObj.dataForChart = groupCount;
            JudgeHasData();
        }, function (err) {
            alert(err);
        });
    }
    //得到指定区间的消费详情列表
    var SetPayList = function (startDate, endDate) {
        var query = "SELECT A.Id,A.PayDay,A.PayOut,B.Name AS PayType,A.Remark,A.InDateTime" +
                    " FROM tb_pays AS A" +
                    " JOIN tb_payType AS B" +
                    " ON A.PayType=B.Id" +
                    " WHERE date(PayDay) BETWEEN date(?) AND date(?)" +
                    " ORDER BY A.PayDay";
        $cordovaSQLite.execute(db, query, [startDate, endDate]).then(function (res) {
            var tempPayList = [];
            for (var i = 0; i < res.rows.length; i++) {
                var tempItem = res.rows.item(i);
                var temp = { Id: tempItem.Id, PayDay: tempItem.PayDay, PayOut: tempItem.PayOut, PayType: tempItem.PayType, Remark: tempItem.Remark, InDateTime: tempItem.InDateTime };
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

    }
    //判断是否有账单数据
    var JudgeHasData = function () {
        if ($scope.baseObj.dataForChart.length > 0) {
            $scope.isShowCountArea = true;
            $scope.showChart();
        } else {
            $scope.isShowCountArea = false;
            $ionicPopup.alert({ title: '提示', template: '该时间段没有账单', okText: '确定', okType: 'button-balanced' }).then(function (res) { });
        }
    }

    $scope.showChart = function () {
        var charts = new Highcharts.Chart({
            chart: {
                renderTo: 'chartContainer'
            },
            title: {
                //floating:true,
                //text: '各类花费的百分比'
                text: null,
                floating: true,
                margin: -1000
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
            credits: {
                enabled: true // 是否禁用版权信息
                , text: '消费分布'
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
    //将GetCountData通过service共享为回调函数，当List页面有删除数据操作时，回调该方法进行报表数据刷新
    DataStorage.SetCallBack_dataForChart($scope.GetCountData);

})

.controller('CountDetailCtrl', function ($scope, $stateParams) {
    $scope.payDetail = JSON.parse($stateParams.pay);
})

.controller('CountListCtrl', function ($scope, DataStorage, $ionicPopup, $cordovaToast, $cordovaSQLite) {
    //通过service共享payList
    $scope.payList = DataStorage.GetPayList();

    //删除一笔记录
    $scope.deletePayById = function (id, inDateTime) {
        $ionicPopup.confirm({
            title: '危险操作',
            template: '确定要删除吗？',
            cancelText: '取消',
            okText: '确定',
            okType: 'button-assertive'
        }).then(function (res) {
            if (res) {
                var query = "DELETE FROM tb_pays WHERE Id=?";
                $cordovaSQLite.execute(db, query, [id]).then(function (res) {
                    //数据库中删除成功后，直接移除前台model数据即可
                    deletePayFromPayList(id);
                    $cordovaToast.show('删除成功', 'short', 'center').then(function (success) { }, function (error) { });
                    DataStorage.GetCallBack_dataForChart();//回调，刷新上一个页面报表数据
                    insertSyncQueue(id, inDateTime);//删除操作记录到syncQueue，待云同步使用
                }, function (err) {
                    alert(err);
                });

            }
        });
    }
    //当数据库删除成功后，直接从前台model中移除该条数据即可，不需要再重新查询
    var deletePayFromPayList = function (id) {
        for (var i in $scope.payList) {
            if ($scope.payList[i].Id == id) {
                $scope.payList.splice(i, 1);
                break;
            }
        }
    }
    //删除数据成功后，将这一信息记录到 同步队列的表中用来做云同步的依据（OptionType 1：新增，-1：删除）
    var insertSyncQueue = function (id, inDateTime) {
        var query = "INSERT INTO tb_syncQueue(Id,OptionType,InDateTime) values(?,?,?)";
        $cordovaSQLite.execute(db, query, [id, -1, inDateTime]).then(function (res) {
            alert("同步了");
        }, function (err) {
            alert(err);
        });
    }

    //--begin 隐藏功能

    //清空所以账单记录
    $scope.deleteAllPays = function () {
        $ionicPopup.confirm({
            title: '危险操作',
            template: '你触发了“清空账单”隐藏功能,确定清空所有账单数据吗?',
            cancelText: '取消',
            okText: '确定',
            okType: 'button-assertive'
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

.controller('AccountCtrl', function ($scope, $cordovaSQLite, $ionicPopup, $http, $state, $rootScope, $timeout, DataStorage) {

    $scope.baseObj = new Object();

    var deleteSyncQueue = function (callBack) {
        var query = "DELETE FROM tb_syncQueue";
        $cordovaSQLite.execute(db, query).then(function (res) {
            callBack();
        }, function (err) {
            alert(err);
        });
    }

    //用于记录是否登录，view根据该值进行切换
    $scope.isLogin = false;
    $scope.userName = null;

    $scope.LogIn = function () {
        $ionicPopup.loginPop({
            title: '登录',
            cancelText: '取消',
            okText: '确定',
            okType: 'button-balanced'
        }).then(function (res) {
            if (res != undefined) {
                $http({
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'   //'Content-Type':'application/x-www-form-urlencoded;charset=utf-8'
                    },
                    //url: "http://localhost:6282/user/ValidateUser",
                    url: "http://10.202.101.170:6282/user/ValidateUser",
                    data:{
                            UserName: res.userName,
                            PhoneNumber: res.userName,
                            Email: res.userName,
                            Password:res.password
                        }
                }).success(function (data, status, headers, config) {
                    if (data.ResultType == 'Success') {
                        //$state.go("tab.account-backup");
                        storeUserInfo(data.Data);
                    }else{
                        alert("用户名或密码错误");
                    }
                }).error(function (data, status, headers, config) {
                    alert(data);
                });
            } else {
                //$cordovaToast.show('类别名不能为空', 'short', 'center').then(function (success) { }, function (error) { });
            }
        });
    }

    var storeUserInfo = function (userInfo) {
        var query = "INSERT INTO tb_login(Id,UserName,Email,PhoneNumber) VALUES(?,?,?,?)";
        $cordovaSQLite.execute(db, query,[userInfo.Id,userInfo.UserName,userInfo.Email,userInfo.PhoneNumber]).then(function (res) {
            selectUserInfo();
        }, function (err) {
            alert(err);
        });
    }

    var selectUserInfo = function () {
        $scope.isLogin = false;
        var query = "SELECT Id,UserName,Email,PhoneNumber FROM tb_login";
        $cordovaSQLite.execute(db, query).then(function (res) {
            if (res.rows.length > 0) {
                $rootScope.userInfo = {
                    Id: res.rows.item(0).Id,
                    UserName: res.rows.item(0).UserName,
                    Email: res.rows.item(0).Email,
                    PhoneNumber: res.rows.item(0).PhoneNumber
                };
                $scope.userName = $rootScope.userInfo.UserName;
                $scope.isLogin = true;
            }
        }, function (err) {
            alert(err);
        })
    }

    $timeout(selectUserInfo, 100);

    //当detail中退出登录时，回调selectUserInfo方法刷新登录状态
    DataStorage.SetCallBack_LogOut(selectUserInfo);

    //--begin 隐藏功能

    //清空备份缓存队列记录
    $scope.clearSyncQueue = function () {
        $ionicPopup.confirm({
            title: '危险操作',
            template: '你触发了“清空云同步队列”隐藏功能,清空后部分数据（上次同步之后的记账信息）将无法同步到云上。确定清空吗?',
            cancelText: '取消',
            okText: '确定',
            okType: 'button-assertive'
        }).then(function (res) {
            if (res) {
                deleteSyncQueue(function () { alert("已清除"); });
            }
        });
    }
    //--End 隐藏功能
})

.controller('BackupCtrl', function ($scope, $cordovaSQLite) {

    var selectAllInsertDate = function () {
        var query = "SELECT Id,InDateTime FROM tb_syncQueue WHERE OptionType=1";
        $cordovaSQLite.execute(db, query).then(function (res) {

        }, function (err) {
            alert(err);
        });
    }

    $scope.Backup = function () {

    }
})

.controller('AccountDetailCtrl', function ($scope, $cordovaSQLite, $state, $ionicPopup, DataStorage,$rootScope) {

    $scope.logOut = function () {
        $ionicPopup.confirm({
            title:"退出",
            template:"确定要退出当前账号吗？",
            okText: "确定",
            okType: "button-assertive",
            cancelText:"取消"
        }).then(function (res) {
            if (res) {
                clearUserInfo();
            }
        });
    }

    var clearUserInfo = function () {
        var query = "DELETE FROM tb_login";
        $cordovaSQLite.execute(db, query).then(function (res) {
            DataStorage.GetCallBack_LogOut();//回调selectUserInfo方法刷新登录状态
            $state.go("tab.account");
        }, function (err) {
            alert(err);
        });
    }
})

.controller('AccountRegisterCtrl', function ($scope, dfCommonService,$http) {
    $scope.baseObj = new Object();
    $scope.registerWithEmail = true;

    $scope.baseObj.email = null;
    $scope.baseObj.emailPwd = null;
    $scope.baseObj.emailPwdCfrm = null;
    $scope.baseObj.phone = null;
    $scope.baseObj.phonePwd = null;
    $scope.baseObj.phonePwdCfrm = null;
    //type=1:邮箱注册 type=2：手机注册
    $scope.changeRegisterType = function (type) {
        if (type == 1) {
            $scope.registerWithEmail = true;
        } else {
            $scope.registerWithEmail = false;
        }
    }

    $scope.checkExistEmail = function () {
        alert($scope.baseObj.email);
        $http({
            method: "POST",
            headers: {
                'Content-Type':'application/json'
            },
            url: dfCommonService.GetHttpServer(cloudIp, cloudPort) + "/user/CheckExistEmail",
            data: {
                email:$scope.baseObj.email
            }
            //data: $scope.baseObj.email
        }).success(function (data, status, headers, config) {
            if (data.ResultType == "Success") {
                alert(data.Msg);
            } else {
                alert(data.Msg);
            }
        }).error(function (data, status, headers, config) {
            alert(data);
        });
    }
})

.controller('123AccountCtrl', function ($scope, $ionicPopup) {
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
