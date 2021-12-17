// pages/orders/steps/paid-order.js
import Toast from "@vant/weapp/toast/toast";
import Dialog from "@vant/weapp/dialog/dialog";
import {getOrder} from "../orderHelper.js";
import {getOrderStatusName} from "../orderStatus.js";

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  afterReadPackagePhoto: function(event) {
    const packageIndex = event.target.id;
    const photoIndex = event.detail.index;
    const localUrl = event.detail.file.url;
    this.setData({
      [`order.etkPackages[${packageIndex}].etkPackagePhotos[${photoIndex}].isImage`]: true,
      [`order.etkPackages[${packageIndex}].etkPackagePhotos[${photoIndex}].status`]: "uploading",
      [`order.etkPackages[${packageIndex}].etkPackagePhotosErrorMessage`]: "",
    });
    const self = this;
    wx.compressImage({
      src: localUrl,
      quality: 1,
      success: function(res) {
        self.setData({
          [`order.etkPackages[${packageIndex}].etkPackagePhotos[${photoIndex}].url`]: res.tempFilePath,
          [`order.etkPackages[${packageIndex}].etkPackagePhotos[${photoIndex}].status`]: "done",
        });
      },
      fail: function() {
        self.setData({
          [`order.etkPackages[${packageIndex}].etkPackagePhotos[${photoIndex}].url`]: localUrl,
          [`order.etkPackages[${packageIndex}].etkPackagePhotos[${photoIndex}].status`]: "done",
        });
      },
    });
  },

  onDeletePackagePhoto: function(event) {
    const packageIndex = event.target.id;
    const photoIndex = event.detail.index;
    this.data.order.etkPackages[packageIndex].etkPackagePhotos.splice(photoIndex, 1);
    this.setData({
      [`order.etkPackages[${packageIndex}].etkPackagePhotos`]: this.data.order.etkPackages[packageIndex].etkPackagePhotos,
    });
  },

  onEtkNumberChange: function(event) {
    const packageIndex = event.target.id;
    this.setData({
      [`order.etkPackages[${packageIndex}].etkNumber`]: event.detail,
      [`order.etkPackages[${packageIndex}].etkNumberErrorMessage`]: "",
    });
  },

  onSentCheckedChange: function(event) {
    const packageIndex = event.target.id;
    this.setData({
      [`order.etkPackages[${packageIndex}].sentChecked`]: event.detail,
    });
  },

  packagePhotosAndEtkNumberIsOk: function(packageIndex, etkPackage) {
    let somethingError = false;
    if (!etkPackage.etkPackagePhotos || etkPackage.etkPackagePhotos.length === 0) {
      this.setData({
        [`order.etkPackages[${packageIndex}].etkPackagePhotosErrorMessage`]: "请上传打包和寄出照片",
      });
      somethingError = true;
    }
    if (!etkPackage.etkNumber) {
      this.setData({
        [`order.etkPackages[${packageIndex}].etkNumberErrorMessage`]: "请填写ETK订单号码",
      });
      somethingError = true;
    }
    if (etkPackage.etkNumber?.length > 64) {
      this.setData({
        [`order.etkPackages[${packageIndex}].etkNumberErrorMessage`]: "ETK订单号码过长",
      });
      somethingError = true;
    }
    return !somethingError;
  },

  onSave: function() {
    this.setData({
      submitting: true,
    });
    let willSendPackageIndexes = [];
    let somePackageError = false;
    for (const [packageIndex, etkPackage] of this.data.order.etkPackages.entries()) {
      if (etkPackage.alreadySentOut || !etkPackage.sentChecked) {
        continue;
      }
      if (!this.packagePhotosAndEtkNumberIsOk(packageIndex, etkPackage)) {
        somePackageError = true;
        continue;
      }
      willSendPackageIndexes.push(packageIndex);
    }
    if (somePackageError) {
      Dialog.alert({
        message: "部分包裹投递信息错误",
      })
      .then(
        () => {
          this.setData({
            submitting: false,
          });
        }
      );
      return;
    }

    if (willSendPackageIndexes.length === 0) {
      Dialog.alert({
        message: "没有需要提交的包裹信息",
      })
      .then(
        () => {
          this.setData({
            submitting: false,
          });
        }
      );
      return;
    }

    Toast.loading({
      message: "正在提交",
      forbidClick: true,
    });
    const tasks = [];
    const self = this;
    const token = "Bearer " + app.globalData.token;
    const baseUrl = app.globalData.baseUrl;
    const orderId = this.data.order.id;
    for (const willSendPackageIndex of willSendPackageIndexes) {
      const etkPackage = this.data.order.etkPackages[willSendPackageIndex];
      const packageId = etkPackage.id;
      const sendEtkNumberTask = new Promise(
        (resolve, reject) => {
          wx.request({
            url: `${baseUrl}/orders/${orderId}/etk-packages/${packageId}/etk-number`,
            method: "POST",
            data: {
              etkNumber: etkPackage.etkNumber,
            },
            header: {
              "content-type": "application/json",
              "Authorization": token,
            },
            success: function(res) {
              if (res.statusCode != 200) {
                reject(res);
              }
              resolve(res);
            },
            fail: function(err) {
              reject(err);
            },
          })
        }
      );
      tasks.push(sendEtkNumberTask);

      for (let [photoIndex, photo] of etkPackage.etkPackagePhotos.entries()) {
        this.setData({
          [`order.etkPackages[${willSendPackageIndex}].etkPackagePhotos[${photoIndex}].status`]: "uploading",
        });
        let uploadTask = new Promise(
          (resolve, reject) => {
            wx.uploadFile({
              url: `${baseUrl}/orders/${orderId}/etk-packages/${packageId}/etk-package-photos`,
              filePath: photo.url,
              header: {
                "Authorization": token
              },
              name: "photo",
              success: function(res) {
                if (res.statusCode != 200) {
                  reject(res);
                }
                const response = JSON.parse(res.data);
                self.setData({
                  [`order.etkPackages[${willSendPackageIndex}].etkPackagePhotos[${photoIndex}].id`]: response.id,
                  [`order.etkPackages[${willSendPackageIndex}].etkPackagePhotos[${photoIndex}].originPath`]: response.url,
                  [`order.etkPackages[${willSendPackageIndex}].etkPackagePhotos[${photoIndex}].status`]: "done",
                });
                resolve(response);
              },
              fail: function(err) {
                reject(err);
              }
            });
          }
        );
        tasks.push(uploadTask);
      }
    }

    Promise.all(tasks)
    .then(
      () => {
        Toast.success("上传完成");
        self.setData({
          submitting: false,
        });
        wx.reLaunch({
          url: `/pages/orders/steps/paid-order?orderId=${orderId}`,
        });
      }
    );
  },

  onNotifyCustomerOrderComplete: function() {
    this.setData({
      submitting: true,
    });
    const everyPackageSentOut = this.data.order.etkPackages
    .every(
      (etkPackage) => {
        return (etkPackage.alreadySentOut ? true : false);
      }
    );
    if (!everyPackageSentOut) {
      Dialog.alert({
        message: "部分包裹还未寄出，不能完成订单",
      })
      .then(
        () => {
          this.setData({
            submitting: false,
          });
        }
      );
      return;
    }

    const token = "Bearer " + app.globalData.token;
    const baseUrl = app.globalData.baseUrl;
    const orderId = this.data.order.id;
    new Promise(
      (resolve, reject) => {
        wx.request({
          url: `${baseUrl}/orders/${orderId}/notify-complete`,
          method: "GET",
          header: {
            "content-type": "application/json",
            "Authorization": token
          },
          success: function(res) {
            if (res.statusCode != 200) {
              reject(res);
            }
            resolve(res);
          },
          fail: function(err) {
            reject(err);
          }
        });
      }
    )
    .then(
      () => {
        Toast.success("订单完成");
        this.setData({
          submitting: false,
        });
        wx.switchTab({
          url: '../orders',
        });
      }
    );
  },

  // onSaveOld: function() {
  //   if (!this.data.order.etkNumber) {
  //     Dialog.confirm({
  //       message: "请填写ETK快递号码",
  //     });
  //     return;
  //   }
  //   this.setData({
  //     submitting: true,
  //   });
  //   const self = this;
  //   const token = "Bearer " + app.globalData.token;
  //   const baseUrl = app.globalData.baseUrl;
  //   const orderId = this.data.order.id;
  //   const etkNumber = this.data.order.etkNumber;
  //   const setEtkNumberUrl = `${baseUrl}/orders/${orderId}/etk/${etkNumber}`;
  //   new Promise((resolve, reject) => {
  //     wx.request({
  //       url: setEtkNumberUrl,
  //       method: "PUT",
  //       header: {
  //         "content-type": "application/json",
  //         "Authorization": token
  //       },
  //       success: function(res) {
  //         resolve(res);
  //       },
  //       fail: function(err) {
  //         reject(err);
  //       }
  //     });
  //   })
  //   .then(() => {
  //     return Dialog.alert({
  //       message: "订单修改提交完毕",
  //     });
  //   })
  //   .then(() => {
  //     // on close
  //     self.setData({
  //       submitting: false,
  //     });
  //     wx.switchTab({
  //       url: "../orders"
  //     });
  //   });
  // },

  setPackagePhoto: function(packageIndex, photoIndex, localUrl) {
    this.setData({
      [`order.etkPackages[${packageIndex}].etkPackagePhotos[${photoIndex}].url`]: localUrl,
      [`order.etkPackages[${packageIndex}].etkPackagePhotos[${photoIndex}].status`]: "done",
    });
  },

  setArrivalPhoto: function(photoIndex, localUrl) {
    this.setData({
      [`order.arrivalPhotos[${photoIndex}].url`]: localUrl,
      [`order.arrivalPhotos[${photoIndex}].status`]: "done",
    });
  },

  setOrder(newOrder) {
    this.setData({
      order: newOrder,
    });
    const orderStatusName = getOrderStatusName(newOrder);
    this.setData({
      ["order.orderStatusName"]: orderStatusName,
      ["idCardPhotos.front[0].isImage"]: true,
      ["idCardPhotos.front[0].status"]: "uploading",
      ["idCardPhotos.reverse[0].isImage"]: true,
      ["idCardPhotos.reverse[0].status"]: "uploading",
    });
    if (this.data.order.arrivalPhotos) {
      for (let photoIndex = 0; photoIndex < this.data.order.arrivalPhotos.length; photoIndex++) {
        const originalUrl = this.data.order.arrivalPhotos[photoIndex].url;
        this.setData({
          [`order.arrivalPhotos[${photoIndex}].originalUrl`]: originalUrl,
          [`order.arrivalPhotos[${photoIndex}].status`]: "uploading",
          [`order.arrivalPhotos[${photoIndex}].isImage`]: true,
        });
      }
    }
    if (!this.data.order.etkPackages || this.data.order.etkPackages.length === 0) {
      const emptyPackages = [{
        etkCargoRecords:[{name: "", count: 1,},
        ],
      }];
      this.setData({
        ["order.etkPackages"]: emptyPackages,
      })
    } else {
      for (let [packageIndex, etkPackage] of this.data.order.etkPackages.entries()) {
        let feeList = etkPackage.feeList;
        this.setData({
          [`order.etkPackages[${packageIndex}].feeList.packingFeeInYuan`]: feeList.packingFeeInCent ? feeList.packingFeeInCent / 100 : 0.0,
          [`order.etkPackages[${packageIndex}].feeList.expressFeeInYuan`]: feeList.expressFeeInCent ? feeList.expressFeeInCent / 100 : 0.0,
          [`order.etkPackages[${packageIndex}].feeList.taxesInYuan`]: feeList.taxesInCent ? feeList.taxesInCent / 100 : 0.0,
          [`order.etkPackages[${packageIndex}].feeList.insuranceInYuan`]: feeList.insuranceInCent ? feeList.insuranceInCent / 100 : 0.0,
        });
        if (etkPackage.etkPackagePhotos && etkPackage.etkPackagePhotos.length != 0) {
          for (let photoIndex = 0; photoIndex < etkPackage.etkPackagePhotos.length; photoIndex++) {
            const originalUrl = this.data.order.etkPackages[packageIndex].etkPackagePhotos[photoIndex].url;
            this.setData({
              [`order.etkPackages[${packageIndex}].etkPackagePhotos[${photoIndex}].originalUrl`]: originalUrl,
              [`order.etkPackages[${packageIndex}].etkPackagePhotos[${photoIndex}].status`]: "uploading",
              [`order.etkPackages[${packageIndex}].etkPackagePhotos[${photoIndex}].isImage`]: true, 
            });
          }
        }
        if (etkPackage.etkNumber) {
          this.setData({
            [`order.etkPackages[${packageIndex}].alreadySentOut`]: true,
          });
        }
      }
      this.calculateTotalFee();
    }
  },

  setIdCardPhoto(photo, side) {
    if (side === "front") {
      this.setData({
        ["idCardPhotos.front[0].url"]: photo.tempFilePath,
        ["idCardPhotos.front[0].status"]: "done",
      });
    } else if (side === "reverse") {
      this.setData({
        ["idCardPhotos.reverse[0].url"]: photo.tempFilePath,
        ["idCardPhotos.reverse[0].status"]: "done",
      });
    }
  },

  calculateTotalFee() {
    let sumInCent = 0;
    for (let [packageIndex, etkPackage] of this.data.order.etkPackages.entries()) {
      const feeList = etkPackage.feeList;
      if (!feeList) {
        continue;
      }
      const packageTotalCostInCent = (feeList.packingFeeInCent ? feeList.packingFeeInCent : 0) + 
      (feeList.expressFeeInCent ? feeList.expressFeeInCent : 0) +
      (feeList.taxesInCent ? feeList.taxesInCent : 0) + 
      (feeList.insuranceInCent ? feeList.insuranceInCent : 0);
      this.setData({
        [`order.etkPackages[${packageIndex}].feeList.packageTotalCostInCent`]: Math.floor(packageTotalCostInCent),
        [`order.etkPackages[${packageIndex}].feeList.packageTotalCostInYuan`]: Math.floor(packageTotalCostInCent) / 100,
        [`order.etkPackages[${packageIndex}].feeList.feesErrorMessage`]: "",
      });
      sumInCent += packageTotalCostInCent;
    }
    this.setData({
      ["order.totalCostInYuan"]: Math.floor(sumInCent) / 100.0,
      ["order.totalCostInCent"]: Math.floor(sumInCent),
      ["order.totalCostInCentErrorMessage"]: "",
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.isAdmin()) {
      this.setData({
        isAdmin: true,
      });
    } else {
      this.setData({
        isAdmin: false,
      });
    }
    this.setData({
      loginUsername: app.globalData.username,
    });
    const id = options.orderId;
    this.setData({
      ["order.id"]: id,
    });
    const tasks = getOrder(id, this.setOrder, this.setIdCardPhoto, this.setArrivalPhoto, this.setPackagePhoto);

    Promise.all(tasks)
    .then(
      () => {
        Toast.success("加载完成");
      }
    );
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