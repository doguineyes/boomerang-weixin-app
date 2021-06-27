// app.js
import APPController from './controllers/app.js'

App({
  globalData: {
    baseUrl: "https://api.easy-cwt.com",
  },

  onLaunch() {
    this.globalData.appController = new APPController({})

    const token = wx.getStorageSync('token');
    const username = wx.getStorageSync('username');
    const expiredTime = wx.getStorageSync('expiredtime');
    const authorities = wx.getStorageInfoSync('authorities');
    const now = new Date();

    if (token && now < expiredTime) {
      this.globalData.token = token;
      this.globalData.username = username;
      this.globalData.expiredTime = expiredTime;
      this.globalData.authorities = authorities;
    } else {
      wx.clearStorageSync();
    }
    
    this.globalData.orderStatusToBePaidOption = "ToBePaid";
    this.globalData.orderStatusOptions = ["ToBePacked", "ToBePaid", "Mailed", "Cancelled"];
    this.globalData.orderStatusNames = ["已提交", "待支付", "已寄出", "已取消"];
    this.globalData.orderStatusOptionsToNames = {
      "ToBePacked": "已提交",
      "ToBePaid": "待支付",
      "Mailed": "已寄出",
      "Cancelled": "已取消",
    };
    this.globalData.orderStatusNamesToOptions = {
      "已提交": "ToBePacked",
      "待支付": "ToBePaid",
      "已寄出": "Mailed",
      "已取消": "Cancelled",
    };
  },

  isAdmin() {
    if (this.globalData.authorities.includes("ADMIN") || this.globalData.authorities.includes("SUPER_ADMIN")) {
      return true;
    } else {
      return false;
    }
  },
})
