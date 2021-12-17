// pages/login/area-code-picker.js
import { areaCodes } from "./area-codes"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ckeys:[],
    sortedcountry:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '选择国家与地区'
    });

    let cc = areaCodes;
    let ck = [];
    let cv = {};

    cc.forEach(c => {
      c['v'] = `${c.name} ${c.tel}`;
      let p = c.pinyin.substr(0,1).toUpperCase();
      if(ck.indexOf(p) < 0){
        ck.push(p);
        cv[p] = [];
        
        cv[p].push(c);
      }else{
        cv[p].push(c);
      }
    });

    ck.sort();

    this.setData({
      ckeys: ck,
      sortedcountry: cv
    });
  },

  selectcountry(o){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    prevPage.setData({
      country:o.currentTarget.dataset.country
    });

    wx.navigateBack({
      delta: 1
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