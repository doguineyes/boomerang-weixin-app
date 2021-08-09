// pages/orders/orderPackagingPricing.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    order: {
      type: Object,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onOrderPackagePriceChange: function(event) {
      const option = {};
      this.triggerEvent("order-package-price-change", event, option);
    }
  }
})
