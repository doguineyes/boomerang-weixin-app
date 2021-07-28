// pages/orders/orderDetails.js
import Dialog from "@vant/weapp/dialog/dialog";
import Toast from '@vant/weapp/toast/toast';

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    order: {},
    isAdmin: false,
    orderStatusNames: [],
    showOrderStatusPickerPopup: false,
    pickedOrderStatusName: "",
    photosNeedToBeDeletedRemotely: [],
    loading: false,
    submitting: false,
    costIsChanged: false,
  },

  onClickEditOrderStatusCell: function() {
    this.setData({
      showOrderStatusPickerPopup: true,
    });
  },

  onChangeOrderStatus: function(event) {
    const { picker, value, index } = event.detail;
    this.setData({
      pickedOrderStatusName: value,
    });
  },

  onConfirmOrderStatusPicker: function(event) {
    const { picker, value, index } = event.detail;
    this.setData({
      pickedOrderStatusName: value,
      "order.orderStatus": this.data.orderStatusNamesToOptions[value],
      showOrderStatusPickerPopup: false,
    });
  },

  onOrderCostChange: function(event) {
    const cost = event.detail;
    this.setData({
      "order.cost": cost,
      costIsChanged: true,
    });
  },

  onCargoNameBlur: function(event) {
    const cost = event.target.value;
    this.setData({
      "order.cost": cost,
      costIsChanged: true,
    });
  },

  onCancelOrderStatusPicker: function(event) {
    this.setData({
      showOrderStatusPickerPopup: false,
    });
  },

  onPayOrder: function() {
    const id = options.orderId;
    const that = this;
    const token = "Bearer " + app.globalData.token;
    const baseUrl = app.globalData.baseUrl;
    const orderUrl = baseUrl + `/orders/${id}`;

    let getPrepayIdTask = new Promise((resolve, reject) => {
      wx.request({
        url: orderUrl + "/prepay-info",
        method: "GET",
        header: {
          "content-type": "application/json",
          "Authorization": token
        },
        success: function(res) {
          if (res.statusCode !== 200) {
            reject(res);
          }
          that.setData({
            "order.prepayInfo": res.data, 
          });
          resolve(res.data);
        },
        fail(err) {
          reject(err);
        },
      });
      getPrepayIdTask.then(
        (response) => {
          let prepayInfo = that.order.prepayInfo;
          wx.requestPayment({
            nonceStr: prepayInfo.nonceStr,
            package: prepayInfo.package,
            paySign: prepayInfo.paySign,
            timeStamp: prepayInfo.timeStamp,
            signType: prepayInfo.signType,
            success: function(res) {
              wx.redirectTo({
                url: './pay-success',
              })
            },
          })
        }
      );
    });
    

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // Toast.loading({
    //   duration: 0,
    //   message: "加载中...",
    //   forbidClick: true,
    // });
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
      orderStatusNames: app.globalData.orderStatusNames,
      orderStatusNamesToOptions: app.globalData.orderStatusNamesToOptions,
      orderStatusOptionsToNames: app.globalData.orderStatusOptionsToNames,
      orderStatusToBePaidOption: app.globalData.orderStatusToBePaidOption,
      orderStatusToBePackedOption: app.globalData.orderStatusToBePackedOption,
    });

    const id = options.orderId;
    const that = this;
    const token = "Bearer " + app.globalData.token;
    const baseUrl = app.globalData.baseUrl;
    const orderUrl = baseUrl + `/orders/${id}`;

    let orderLoadingTask = new Promise((resolve, reject) => {
      wx.request({
        url: orderUrl,
        method: "GET",
        header: {
          "content-type": "application/json",
          "Authorization": token
        },
        success: function(res) {
          // if (res.statusCode === 403) {
          //   wx.reLaunch({
          //     url: '../login/login',
          //   });
          // }
          if (res.statusCode !== 200) {
            reject(res);
          }
          const newOrder = res.data;
          that.setData({
            order: newOrder,
            pickedOrderStatusName: that.data.orderStatusNamesToOptions[newOrder.orderStatus],
          });
          resolve(res);
        },
        fail(err) {
          reject(err);
        },
      });
    });

    orderLoadingTask.then(
      (res) => {
        let downloadingPhotoTasks = [];
        const orderId = that.data.order.id;
        for(let cargoIndex in that.data.order.cargoRecords) {
          for (let photoIndex in that.data.order.cargoRecords[cargoIndex].photos) {
            const photoUrl = baseUrl + `/orders/${orderId}/cargos/${that.data.order.cargoRecords[cargoIndex].id}/photos/${that.data.order.cargoRecords[cargoIndex].photos[photoIndex].id}`;
            that.setData({
              [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].originPath`]: that.data.order.cargoRecords[cargoIndex].photos[photoIndex].url,
              [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].url`]: "",
              [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].isImage`]: true,
              [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].status`]: "uploading",
              [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].type`]: "original",
            });
            let task = new Promise((resolve, reject) => {
              wx.downloadFile({
                url: photoUrl,
                header: {
                  "content-type": "application/json",
                  "Authorization": token
                },
                success (res) {
                  if (res.statusCode === 200) {
                    that.setData({
                      [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].url`]: res.tempFilePath,
                      [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].status`]: "done",
                    });
                  }
                  resolve();
                }
              });
            });
            downloadingPhotoTasks.push(task);
          }
        }
        Promise.all(downloadingPhotoTasks).then(
          (res) => {
            Toast.success("加载完成");
          }
        );
      }
    );


    // wx.request({
    //   url: queryUrl,
    //   method: "GET",
    //   header: {
    //     "content-type": "application/json",
    //     "Authorization": token
    //   },
    //   success: function(res) {
    //     if (res.statusCode === 403) {
    //       wx.reLaunch({
    //         url: '../login/login',
    //       });
    //     }
    //     if (res.statusCode !== 200) {
          
    //     }
    //     const newOrder = res.data;
    //     that.setData({
    //       order: newOrder,
    //       pickedOrderStatusName: that.data.orderStatusNamesToOptions[newOrder.orderStatus],
    //     });

    //     const orderId = that.data.order.id;
    //     for(let cargoIndex in that.data.order.cargoRecords) {
    //       for (let photoIndex in that.data.order.cargoRecords[cargoIndex].photos) {
    //         const photoPath = baseUrl + `/orders/${orderId}/cargos/${that.data.order.cargoRecords[cargoIndex].id}/photos/${that.data.order.cargoRecords[cargoIndex].photos[photoIndex].id}`;
    //         that.setData({
    //           [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].originPath`]: that.data.order.cargoRecords[cargoIndex].photos[photoIndex].url,
    //           [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].url`]: "",
    //           [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].isImage`]: true,
    //           [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].status`]: "uploading",
    //           [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].type`]: "original",
    //         });
            
    //         wx.downloadFile({
    //           url: photoPath,
    //           header: {
    //             "content-type": "application/json",
    //             "Authorization": token
    //           },
    //           success (res) {
    //             if (res.statusCode === 200) {
    //               that.setData({
    //                 [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].url`]: res.tempFilePath,
    //                 [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].status`]: "done",
    //               });
    //             }
    //           }
    //         })
    //       }
    //     }
    //   },
    //   fail(err) {
    //     that.setData({
    //       order: {},
    //     });
    //   }
    // });
  },

  afterReadUploadPhoto: function(event) {
    const { file } = event.detail;
    const cargoIndex = event.target.id;
    const photoIndex = this.data.order.cargoRecords[cargoIndex].photos.length;

    this.setData({
      [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].url`]: file.url,
      [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].isImage`]: true,
      [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].status`]: "done",
      [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].type`]: "new",
    });
  },

  onDeletePhoto: function(event) {
    const orderId = this.data.order.id;
    const cargoIndex = event.target.id;
    const cargoId = this.data.order.cargoRecords[cargoIndex].id;
    const photoIndex = event.detail.index;
    const photoId = this.data.order.cargoRecords[cargoIndex].photos[photoIndex].id;
    const baseUrl = app.globalData.baseUrl;
    if (this.data.order.cargoRecords[cargoIndex].photos[photoIndex].type === "original") {
      const queryUrl = `${baseUrl}/orders/${orderId}/cargos/${cargoId}/photos/${photoId}`;
      const needToBeDeleteIndex = this.data.photosNeedToBeDeletedRemotely.length;
      this.setData({
        [`photosNeedToBeDeletedRemotely[${needToBeDeleteIndex}].queryUrl`]: queryUrl,
      });
    }
    this.data.order.cargoRecords[cargoIndex].photos.splice(photoIndex, 1);
    this.setData({
      [`order.cargoRecords[${cargoIndex}].photos`]: this.data.order.cargoRecords[cargoIndex].photos, 
    });
  },

  onSubmitChanges: function() {
    this.setData({
      submitting: true,
    });

    const self = this;
    const token = "Bearer " + app.globalData.token;
    const baseUrl = app.globalData.baseUrl;
    const orderId = this.data.order.id;
    const orderStatusUpdateQuery = `${baseUrl}/orders/${orderId}?status=${this.data.order.orderStatus}`;

    let tasks = [];

    if (this.data.costIsChanged) {
      const orderCostUpdateQuery = `${baseUrl}/orders/${orderId}/cost?cost=${this.data.order.cost}`;
      let orderCostUpdateTask = new Promise((resolve, reject) => {
        wx.request({
          url: orderCostUpdateQuery,
          method: "PUT",
          header: {
            "content-type": "application/json",
            "Authorization": token
          },
          success: function(res) {
            resolve(res);
          },
        });
      });
      tasks.push(orderCostUpdateTask);
    } else {
      let orderStatusUpdateTask = new Promise((resolve, reject) => {
        wx.request({
          url: orderStatusUpdateQuery,
          method: "PUT",
          header: {
            "content-type": "application/json",
            "Authorization": token
          },
          success: function(res) {
            resolve(res);
          },
        });
      });
      tasks.push(orderStatusUpdateTask);
    }

    for (let photoNeedToBeDelete of this.data.photosNeedToBeDeletedRemotely) {
      let photoDeleteTask = new Promise((resolve, reject) => {
        wx.request({
          url: photoNeedToBeDelete.queryUrl,
          method: "Delete",
          header: {
            "content-type": "application/json",
            "Authorization": token
          },
          success: function(res) {
            resolve(res);
          }
        });
      });
      tasks.push(photoDeleteTask);
    }

    for (let [cargoIndex, cargo] of Object.entries(this.data.order.cargoRecords)) {
      const cargoId = cargo.id;
      const uploadUrl = `${baseUrl}/orders/${orderId}/cargos/${cargoId}/photos`;
      for (let [photoIndex, photo] of Object.entries(cargo.photos)) {
        if (photo.type === "new") {
          this.setData({
            [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].status`]: "uploading",
          });
          let uploadTask = new Promise(
            (resolve, reject) => {
              wx.uploadFile({
                url: uploadUrl,
                filePath: photo.url,
                header: {
                  "Authorization": token
                },
                name: "photo",
                success(res) {
                  if (res.statusCode === 200) {
                    const response = JSON.parse(res.data);
                    self.setData({
                      [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].id`]: response.id,
                      [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].originPath`]: response.url,
                      [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].status`]: "done",
                    });
                    resolve(response);
                  }
                },
              });
            }
          );
          tasks.push(uploadTask);
        }
      }
    }

    Promise.all(tasks)
    .then((responses) => {
      for (let response of responses) {
        console.log(response);
      }
      return Dialog.alert({
        message: "订单修改提交完毕",
      })
    })
    // .then(() => {
    //   if (this.data.order.orderStatus === this.data.orderStatusOptionsToNames) {
      
    //   }
    // })
    .then(() => {
      // on close
      self.setData({
        submitting: false,
      });
      wx.switchTab({
        url: 'orders'
      });
    });
  },

  onCancelEditOrder: function() {
    Dialog.confirm({
      message: "是否放弃修改",
    })
    .then(() => {
      wx.switchTab({
        url: 'orders'
      });
    })
    .catch(() => {
        // on cancel
    });
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
  },
})