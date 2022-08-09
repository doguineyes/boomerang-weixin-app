// pages/send/warehouse.js
import { getWarehouseAddressesPromise } from "../orders/orderHelper";

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: {
    },
    showWarehouseAddressPopup: false,
    warehouseAddressesOptions: [],
    entryCode: "",
  },

  onShowWarehouseAddressPopup() {
    this.setData({
      showWarehouseAddressPopup: true,
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
      ["order.arrivalExpressInfo.warehouseAddress"]: this.createAddress(value, this.data.entryCode),
      arrivalExpressWarehouseAddressErrorMsg: "",
      showWarehouseAddressPopup: false,
    });
  },

  createAddress(address, entryCode) {
    return `ECWT+(${entryCode}) ${address}`;
  },

  onCopyWarehouseAddressToClipboard() {
    if (!this.data.order || !this.data.order?.arrivalExpressInfo?.warehouseAddress) {
      Toast.fail("请选择仓库");
      return;
    }
    // const warehouseAddress = this.data.order.arrivalExpressInfo.warehouseAddress + " (" + this.data.entryCode + ")";
    // const warehouseAddress = this.createAddress(this.data.order.arrivalExpressInfo.warehouseAddress, this.data.entryCode);
    wx.setClipboardData({
      data: this.data.order.arrivalExpressInfo.warehouseAddress,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const token = app.globalData.token || wx.getStorageSync('token');
    const expiredTime = app.globalData.expiredTime || wx.getStorageSync('expiredtime');
    const userName = app.globalData.username || wx.getStorageSync('username');
    const now = new Date();
    if (!token || now > expiredTime || !userName) {
      wx.reLaunch({
        url: '../login/login',
      });
      return;
    }

    this.setData({
      entryCode: app.globalData.entryCode,
    });

    getWarehouseAddressesPromise()
    .then(
      (data) => {
        this.setData({
          warehouseAddressesOptions: data,
        });
        if (data.length === 1) {
          this.setData({
            ["order.arrivalExpressInfo.warehouseAddress"]: this.createAddress(data[0], this.data.entryCode),
          });
        }
      }
    )
    .catch(
      (error) => {
        console.log(error);
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