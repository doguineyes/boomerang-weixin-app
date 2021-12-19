// pages/orders/orders.js
import {getOrderView} from "./orderStatus.js";

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orders: [],
    orderStatusOptions: [
      { text: "全部订单", value: "" },
      { text: "新订单", value: "NewOrder" },
      { text: "已到达", value: "Arrival" },
      { text: "待支付", value: "UnPaid" },
      { text: "已支付", value: "PaymentCompleted" },
      { text: "已完成", value: "Mailed" },
      { text: "已取消", value: "Cancelled" },
    ],
    requestOrderStatus: "",
    nextPage: 0,
    perPage: 20,
    hasMore: true,
    loading: false,
    isAdmin: false,
    searchKeyWord: "",
  },

  loadOrders: function() {
    this.setData({
      loading: true
    });

    if(this.data.hasMore === false) {
      this.setData({
        loading: false
      });
      return;
    }
    const that = this;
    const token = "Bearer " + app.globalData.token;
    let queryUrl = app.globalData.baseUrl + `/orders?page=${this.data.nextPage}&per-page=${this.data.perPage}`;
    if (this.data.requestOrderStatus !== "") {
      queryUrl += `&status=${this.data.requestOrderStatus}`;
    }
    if (this.data.searchKeyWord) {
      queryUrl += `&query=${this.data.searchKeyWord}`;
    }
    wx.request({
      url: queryUrl,
      method: "GET",
      header: {
        "content-type": "application/json",
        "Authorization": token
      },
      success: function(res) {
        if (res.statusCode === 403) {
          wx.reLaunch({
            url: '../login/login',
          });
        }
        if (res.statusCode !== 200) {
          //TODO
          return;
        }
        const newOrders = res.data.filter(Boolean);
        if (newOrders.length < that.data.perPage) {
          that.setData({
            hasMore: false,
          });
        } else {
          that.setData({
            nextPage: that.data.nextPage + 1
          });
        }
        if (newOrders.length > 0) {
          newOrders.forEach(
            (order) => {
              const url = getOrderView(order);
              order.stepUrl = url;
              that.data.orders.push(order);
            });
          that.setData({
            orders: that.data.orders
          });
        }
      },
      // fail(err) {
      //   console.log(err);
      // },
      complete(res) {
        that.setData({
            loading: false
        })
      }
    });
  },

  clearPage: function() {
    this.setData({
      orders: [],
      nextPage: 0,
      hasMore: true,
    });
  },

  onSearchKeyWordChange: function(event) {
    this.setData({
      searchKeyWord: event.detail,
    });
  },

  onKeyWordSearch: function() {
    this.clearPage();
    this.loadOrders();
  },

  onClickKeyWordSearch: function() {
    this.clearPage();
    this.loadOrders();
  },

  orderStatusOptionsChange: function(event) {
    this.setData({
      requestOrderStatus: event.detail,
    });
    this.clearPage();
    this.loadOrders();
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
    this.clearPage();
    this.loadOrders();
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
    this.clearPage();
    this.loadOrders();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.loading && this.data.hasMore) {
      this.loadOrders();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})