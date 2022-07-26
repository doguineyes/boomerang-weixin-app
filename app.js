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
    const authorities = wx.getStorageSync('authorities');
    const entryCode = wx.getStorageSync('entryCode');
    const now = new Date();

    if (token && now < expiredTime) {
      this.globalData.token = token;
      this.globalData.username = username;
      this.globalData.expiredTime = expiredTime;
      this.globalData.authorities = authorities;
      this.globalData.entryCode = entryCode;
    } else {
      wx.clearStorageSync();
    }
    
    this.globalData.orderStatusToBePaidOption = "UnPaid";
    this.globalData.orderStatusToBePackedOption = "NewOrder";
    this.globalData.orderStatusOptions = ["NewOrder", "UnPaid", "PaymentCompleted", "Mailed", "Cancelled"];
    this.globalData.orderStatusNames = ["已提交", "待支付", "已支付", "已寄出", "已取消"];
    this.globalData.orderStatusOptionsToNames = {
      "NewOrder": "已提交",
      "UnPaid": "待支付",
      "PaymentCompleted": "已支付",
      "Mailed": "已寄出",
      "Cancelled": "已取消",
    };
    this.globalData.orderStatusNamesToOptions = {
      "已提交": "NewOrder",
      "待支付": "UnPaid",
      "已支付": "PaymentCompleted",
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
