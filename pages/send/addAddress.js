// pages/send/addAddress.js
import Toast from '@vant/weapp/toast/toast';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    refer: "",
    showAreaPopup: false,
    name: "",
    mobile: "",
    area: "",
    areaCode: "",
    address: "",
    areaList: {
      province_list: {
        110000: '北京市',
        120000: '天津市'
      },
      city_list: {
        110100: '北京市',
        110200: '县',
        120100: '天津市',
        120200: '县'
      },
      county_list: {
        110101: '东城区',
        110102: '西城区',
        110105: '朝阳区',
        110106: '丰台区',
        120101: '和平区',
        120102: '河东区',
        120103: '河西区',
        120104: '南开区',
        120105: '河北区',
        // ....
      }
    }
  },

  onNameChange: function (event) {
    this.setData({name: event.detail});
  },

  onNameBlur: function (event) {
    this.setData({name: event.detail.value});
  },

  onMobileChange: function (event) {
    this.setData({mobile: event.detail});
  },

  onMobileBlur: function (event) {
    this.setData({mobile: event.detail.value});
  },

  onAddressChange: function (event) {
    this.setData({address: event.detail});
  },

  onAddressBlur: function (event) {
    this.setData({address: event.detail.value})
  },

  onSubmit: function () {
    if (!this.data.name) {
      Toast("请填写姓名");
      return;
    }
    if (!this.data.mobile) {
      Toast("请填写手机号");
      return;
    }
    if (!this.data.area) {
      Toast("请选择地区");
      return;
    }
    if (!this.data.address) {
      Toast("请填写地址");
      return;
    }
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    if (this.data.refer === 'sender') {
      prevPage.setData({
        sender: {
          name: this.data.name,
          mobile: this.data.mobile,
          area: this.data.area,
          areaCode: this.data.areaCode,
          address: this.data.address
        }
      });
    } else {
      prevPage.setData({
        recipient: {
          name: this.data.name,
          mobile: this.data.mobile,
          area: this.data.area,
          areaCode: this.data.areaCode,
          address: this.data.address
        }
      });
    }
    wx.navigateBack({
      delta: 1
    });
  },

  onShowAreaPopup: function () {
    this.setData({showAreaPopup: true});
  },

  onCloseAreaPopup: function () {
    this.setData({showAreaPopup: false});
  },

  onConfirmArea: function (confirm) {
    const area = confirm.detail.values;
    const province = area[0].name;
    const city = area[1].name;
    const district = area[2].name;
    this.setData({
      area: province + city + district,
      areaCode: area[2].code
    });
    this.onCloseAreaPopup();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      refer: options.refer,
      name: options.name,
      mobile: options.mobile,
      area: options.area,
      areaCode: options.areaCode,
      address: options.address
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

  }
})