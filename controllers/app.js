let app = getApp()

export default class APPController {
  constructor(props) {
  }

  callhandler(d) {
    if (d.code == 401) {
      this.logout();
    } else {
      let msg = d.msg;
      if (msg && msg != "") {
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 2000
        })
      }
    }

    return;
  }

  logout() {
    try {
      wx.removeStorageSync('token');
      wx.removeStorageSync('phone');
      wx.removeStorageSync('decrypted');
      wx.removeStorageSync('role');
      wx.removeStorageSync('level');
      wx.removeStorageSync('socialname');

      let base_url = app.globalData.base_url;
      let appcontroller = app.globalData.appController;

      app.globalData = {};
      app.globalData.base_url = base_url;
      app.globalData.appController = appcontroller;
    } catch (e) {

    }

    wx.reLaunch({
      url: '../login/login',
    });
  }

  showmsg(d){
    let msg = d.msg;
    if (msg && msg != "") {
      wx.showToast({
        title: msg,
        icon: 'none',
        duration: 2000
      })
    }

    return;
  }

  formatDate(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    return y + '-' + m + '-' + d;
  }

  formatDateYM(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? '0' + m : m;

    return y + '-' + m;
  }
}