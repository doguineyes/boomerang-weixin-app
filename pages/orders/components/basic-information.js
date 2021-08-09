// pages/orders/components/basic-information.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    order: {
      type: Object,
      value: {},
    },
    isAdmin: {
      type: Boolean,
      value: false,
    }
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
    afterReadPhoto: function(event) {
      const option = {};
      this.triggerEvent("after-read-photo", event, option);
    },
    
    onDeletePhoto: function(event) {
      const option = {};
      this.triggerEvent("delete-photo", event, option);
    },
  }
})
