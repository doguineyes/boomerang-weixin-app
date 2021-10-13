// pages/send/send.js
import Dialog from "@vant/weapp/dialog/dialog";
import Toast from "@vant/weapp/toast/toast";

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    order: {
      cargoRecords: [
        {name: "", count: 1},
      ],
    },
    showWarehouseAddressPopup: false,
    warehouseAddressesOptions: ["香港大道1155号", "香港很远很远大区卡达格兰大道115号北国风光大厦11层100299室第A区3柜台"],

    order: {
        arrivalExpressInfo: {
          arrivalExpressNumber: "DHL10092900",
          name: "李师傅",
          warehouseAddress: "香港大道1155号",
        },
        receiver: {
          name: "伏虎",
          mobile: "19820012002",
          address: "北京东路100021号",
          province: "北京市",
          city: "北京市",
          district: "海淀区",
        },
        receiverIdCardNumber: "320102198610092899",
        cargoRecords: [
          {name: "手机", count: 10},
          {name: "包包", count: 9},
        ],
    },
  },

  onArrivalExpressNumberChange(event) {
    this.setData({
      ["order.arrivalExpressInfo.arrivalExpressNumber"]: event.detail,
      arrivalExpressNumberErrorMsg: "",
    });
  },

  onArrivalExpressNameChange(event) {
    this.setData({
      ["order.arrivalExpressInfo.name"]: event.detail,
      arrivalExpressNameErrorMsg: "",
    });
  },

  onWarehouseAddressCancel() {
    this.setData({
      showWarehouseAddressPopup: false,
    });
  },

  onWarehouseAddressConfirm(event) {
    const { picker, value, index } = event.detail;
    this.setData({
      ["order.arrivalExpressInfo.warehouseAddress"]: value,
      arrivalExpressWarehouseAddressErrorMsg: "",
      showWarehouseAddressPopup: false,
    });
  },

  onShowWarehouseAddressPopup() {
    this.setData({
      showWarehouseAddressPopup: true,
    });
  },

  onReceiverNameChange(event) {
    this.setData({
      ["order.receiver.name"]: event.detail,
      receiverNameErrorMsg: "",
    });
  },

  onReceiverProvinceChange(event) {
    this.setData({
      ["order.receiver.province"]: event.detail,
      receiverProvinceErrorMsg: "",
    });
  },

  onReceiverCityChange(event) {
    this.setData({
      ["order.receiver.city"]: event.detail,
      receiverCityErrorMsg: "",
    });
  },

  onReceiverDistrictChange(event) {
    this.setData({
      ["order.receiver.district"]: event.detail,
      receiverDistrictErrorMsg: "",
    });
  },

  onReceiverAddressChange(event) {
    this.setData({
      ["order.receiver.address"]: event.detail,
      receiverAddressErrorMsg: "",
    });
  },

  onReceiverMobileChange(event) {
    this.setData({
      ["order.receiver.mobile"]: event.detail,
      receiverMobileErrorMsg: "",
    });
  },

  onReceiverIdCardNumberChange(event) {
    this.setData({
      ["order.receiverIdCardNumber"]: event.detail,
      receiverIdCardNumberErrorMsg: "",
    });
  },

  afterReadIdCardFrontPhoto(event) {
    const { file } = event.detail;
    this.setData({
      ["receiverIdCardFrontPhoto[0].isImage"]: true,
      receiverIdCardFrontErrorMsg: "",
    });
    this.addIdCardPhoto(file, "receiverIdCardFrontPhoto");
  },

  addIdCardPhoto(file, side) {
    this.setData({
      [`${side}[0].status`]: "uploading",
    });
    const self = this;
    wx.compressImage({
      src: file.url,
      quality: 1,
      success: function(res) {
        self.setData({
          [`${side}[0].url`]: res.tempFilePath,
          [`${side}[0].status`]: "done",
        });
      },
      fail: function(res) {
        self.setData({
          [`${side}[0].url`]: file.url,
          [`${side}[0].isImage`]: true,
          [`${side}[0].status`]: "done",
        });
      },
    });
  },

  onDeleteIdCardFrontPhoto() {
    this.setData({
      ["receiverIdCardFrontPhoto"]: null,
    });
  },

  afterReadIdCardReversePhoto(event) {
    const { file } = event.detail;
    this.setData({
      ["receiverIdCardReversePhoto[0].isImage"]: true,
      receiverIdCardReverseErrorMsg: "",
    });
    this.addIdCardPhoto(file, "receiverIdCardReversePhoto");
  },

  onDeleteIdCardReversePhoto() {
    this.setData({
      ["receiverIdCardReversePhoto"]: null,
    });
  },

  onPhotoOversize() {
    Dialog.alert({
      message: "上传图片过大",
    });
  },

  onAddCargoField: function() {
    const size = this.data.order.cargoRecords.filter(Boolean).length;
    const maxCargoSize = 5;
    if (size >= maxCargoSize) {
      Dialog.alert({
        message: `每个订单至多包含${maxCargoSize}条物品记录`,
      }).then(() => {
        // just close
      });
      return;
    }
    const last = this.data.order.cargoRecords.length;
    this.setData({
      [`order.cargoRecords[${last}]`]: {name: "", count: 1}
    });
  },

  onCargoNameChange: function(event) {
    const index = event.target.id;
    const name = event.detail;
    this.setData({
      [`order.cargoRecords[${index}].name`]: name,
      [`cargoRecordsErrorMsgs[${index}]`]: "",
    });
  },

  onCargoNameBlur: function(event) {
    const index = event.target.id;
    const name = event.detail.value;
    this.setData({
      [`order.cargoRecords[${index}].name`]: name,
      [`cargoRecordsErrorMsgs[${index}]`]: "",
    });
  },

  onCargoCountChange: function(event) {
    const index = event.target.id;
    const inputCount = event.detail;
    this.setData({
      [`order.cargoRecords[${index}].count`]: inputCount
    });
  },

  onIncomingCourierNumberChange: function(event) {
    this.setData({
      incomingCourierNumber: event.detail,
    });
  },

  onDeleteCargoRecord: function(event) {
    const { position, instance, name } = event.detail;
    switch (position) {
      case 'left':
        break;
      case 'cell':
        instance.close();
        break;
      case 'right':
        const size = this.data.order.cargoRecords.length;
        if (size <= 1) {
          Dialog.alert({
            message: "至少保留一件物品",
          }).then(() => {
            // just close
          });
          instance.close();
          return;
        }
        Dialog.confirm({
          message: "确定删除吗?",
        })
        .then(() => {
          this.data.order.cargoRecords.splice(name, 1);
          this.setData({
            ["order.cargoRecords"]: this.data.order.cargoRecords,
          });
          if (this.data.cargoRecordsErrorMsgs && this.data.cargoRecordsErrorMsgs[name]) {
            this.data.cargoRecordsErrorMsgs.splice(name, 1);
            this.setData({
              cargoRecordsErrorMsgs: this.data?.cargoRecordsErrorMsgs,
            });
          }
          instance.close();
        })
        .catch(() => {
          instance.close();
        });
        break;
    }
  },

  onSubmitOrder: function() {
    this.setData({
      submitting: true,
    });
    Toast.loading({
      mask: true,
      message: '处理中...'
    });
    if (!app.globalData.username) {
      wx.reLaunch({
        url: '../login/login',
      });
    }
    this.setData({
      ["order.customerName"]: app.globalData.username,
    });

    let somethingError = false;
    const order = this.data.order;
    const nameOrAddressPattern = /^[\p{Unified_Ideograph}\w .,，。-]+$/u;
    if (!order?.arrivalExpressInfo?.arrivalExpressNumber || order?.arrivalExpressInfo?.arrivalExpressNumber.length > 64 || !order?.arrivalExpressInfo?.arrivalExpressNumber.match(nameOrAddressPattern)) {
      somethingError = true;
      this.setData({
        arrivalExpressNumberErrorMsg: "请输入正确的国际快递单号",
      });
    }
    if (!order?.arrivalExpressInfo?.name || order?.arrivalExpressInfo?.name.length > 32 || !order?.arrivalExpressInfo?.name.trim().match(nameOrAddressPattern)) {
      somethingError = true;
      this.setData({
        arrivalExpressNameErrorMsg: "请输入正确的国际快递收件人姓名",
      });
    }
    if (!order?.arrivalExpressInfo?.warehouseAddress || order?.arrivalExpressInfo?.warehouseAddress.length > 128) {
      somethingError = true;
      this.setData({
        arrivalExpressWarehouseAddressErrorMsg: "请输入正确的仓库地址",
      });
    }
    if (!order?.receiver?.name || order?.receiver?.name.length > 64 || !order?.receiver?.name.match(nameOrAddressPattern)) {
      somethingError = true;
      this.setData({
        receiverNameErrorMsg: "请输入正确的收件人姓名",
      });
    }
    if (!order?.receiver?.province || order?.receiver?.province.length > 32 || !order?.receiver?.province.match(nameOrAddressPattern)) {
      somethingError = true;
      this.setData({
        receiverProvinceErrorMsg: "请输入正确的省",
      });
    }
    if (!order?.receiver?.city || order?.receiver?.city.length > 32 || !order?.receiver?.city.match(nameOrAddressPattern)) {
      somethingError = true;
      this.setData({
        receiverCityErrorMsg: "请输入正确的城市",
      });
    }
    if (!order?.receiver?.district || order?.receiver?.district.length > 32 || !order?.receiver?.district.match(nameOrAddressPattern)) {
      somethingError = true;
      this.setData({
        receiverDistrictErrorMsg: "请输入正确的区县",
      });
    }
    if (!order?.receiver?.address || order?.receiver?.address.length > 128 || !order?.receiver?.address.match(nameOrAddressPattern)) {
      somethingError = true;
      this.setData({
        receiverAddressErrorMsg: "请输入正确的详细地址",
      });
    }
    if (!order?.receiver?.mobile || order?.receiver?.mobile.length > 32 || !order?.receiver?.mobile.match(/^[\d ()+-]+$/)) {
      somethingError = true;
      this.setData({
        receiverMobileErrorMsg: "请输入正确的手机号码",
      });
    }
    if (!order?.receiverIdCardNumber || order?.receiverIdCardNumber.length > 32 || !order?.receiverIdCardNumber.match(/^[\dxX]+$/)) {
      somethingError = true;
      this.setData({
        receiverIdCardNumberErrorMsg: "请输入正确的证件号码",
      });
    }
    if (!this.data.receiverIdCardFrontPhoto || !this.data.receiverIdCardFrontPhoto[0] || !this.data.receiverIdCardFrontPhoto[0]?.url) {
      somethingError = true;
      this.setData({
        receiverIdCardFrontErrorMsg: "请上传证件正面照片",
      });
    }
    if (!this.data.receiverIdCardReversePhoto || !this.data.receiverIdCardReversePhoto[0] || !this.data.receiverIdCardReversePhoto[0]?.url) {
      somethingError = true;
      this.setData({
        receiverIdCardReverseErrorMsg: "请上传证件反面照片",
      });
    }
    for (let i = 0; i < order?.cargoRecords.length; i++) {
      const cargo = order?.cargoRecords[i];
      if (cargo && !cargo?.name.trim()) {
        this.setData({
          [`cargoRecordsErrorMsgs[${i}]`]: "请输入正确的货物名称",
        });
      }
    }
    if (somethingError) {
      Toast.fail("订单存在错误");
      this.setData({
        submitting: false,
      });
      return;
    }

    const requestSubscribeMessageTask = new Promise(
      (resolve) => {
        wx.requestSubscribeMessage({
          tmplIds: [
            "fcXFO32mH_XqFkYtU4ZeGmQOozj5yCoB6-4MyCA1vdY",
            "loJMx4AGyLQnmP6WO3l7CX_sE8ZEGS7nnrGEVNpLAP4",
            "6-aMAe08S_Svtb7fIq9AxaCQVaXSMqpFAitteQULFXs",
          ],
          success: (res) => {
            resolve(res);
          },
          fail: (err) => {
            resolve(err);
          },
        });
      }
    );
    
    const self = this;
    const token = "Bearer " + app.globalData.token;
    const submitOrderTask = requestSubscribeMessageTask
    .then(
      () => {
        return new Promise((resolve, reject) => {
          wx.request({
            url: `${app.globalData.baseUrl}/orders/`,
            method: "POST",
            data: self.data.order,
            header: {
              "content-type": "application/json",
              "Authorization": token
            },
            success: (response) => {
              if (response.statusCode != 201) {
                Toast.clear();
                reject(response);
              }
              resolve(response);
            },
            fail: (err) => {
              reject(err);
              // if (res.data.code != 200) {
              //   app.globalData.appController.callhandler(res.data);
              //   return;
              // }
            },
          });
        });
      }
    );

    const uploadPhotoTask = submitOrderTask
    .then(
      (res) => {
        const orderId = res.data.id;
        self.setData({
          ["receiverIdCardFrontPhoto[0].status"]: "uploading",
        });
        return new Promise((resolve, reject) => {
          wx.uploadFile({
            url: `${app.globalData.baseUrl}/orders/${orderId}/id-card-front-photo`,
            filePath: self.data.receiverIdCardFrontPhoto[0].url,
            header: {
              "Authorization": token,
              "accept": "application/json;charset=UTF-8",
            },
            name: "photo",
            success: function(res) {
              if (res.statusCode != 200) {
                reject(res);
              }
              self.setData({
                ["receiverIdCardFrontPhoto[0].status"]: "done",
              });
              resolve(res);
            },
            fail: function(res) {
              self.setData({
                ["receiverIdCardFrontPhoto[0].status"]: "done",
              });
              reject(res);
            },
          });
        });
      }
    ).then(
      (res) => {
        const response = JSON.parse(res.data);
        const orderId = response.id;
        self.setData({
          ["receiverIdCardReversePhoto[0].status"]: "uploading",
        });
        wx.uploadFile({
          url: `${app.globalData.baseUrl}/orders/${orderId}/id-card-reverse-side-photo`,
          filePath: self.data.receiverIdCardReversePhoto[0].url,
          header: {
            "Authorization": token,
            "accept": "application/json;charset=UTF-8",
          },
          name: "photo",
          success: function(res) {
            if (res.statusCode != 200) {
              reject(res);
            }
            self.setData({
              ["receiverIdCardReversePhoto[0].status"]: "done",
            });
            resolve(res);
          },
          fail: function(err) {
            self.setData({
              ["receiverIdCardReversePhoto[0].status"]: "done",
            });
            reject(err);
          },
        });
      }
    ).then(
      () => {
        Toast.success("订单提交成功");
        this.setData({
          submitting: false,
        });
        wx.redirectTo({
          url: './success',
        });
      }
    ).catch(
      () => {
        Toast.fail("提交失败");
        this.setData({
          submitting: false,
        });
      }
    );
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const token = app.globalData.token;
    const expiredTime = app.globalData.expiredTime;
    const userName = app.globalData.username;
    const now = new Date();
    
    if (!token || now > expiredTime || !userName) {
      wx.reLaunch({
        url: '../login/login',
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // const token = app.globalData.token;
    // const expiredTime = app.globalData.expiredTime;
    // const userName = app.globalData.username;
    // const now = new Date();
    
    // if (!token || now > expiredTime || !userName) {
    //   wx.reLaunch({
    //     url: '../login/login',
    //   })
    // }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})