// pages/orders/components/basic-information.js
import {getOrderPromise, getPhotosPromise, getIdCardPhotoPromise, getArrivalPhotosPromises} from "../orderHelper.js";
import {getOrderStatusName} from "../orderStatus.js";

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    order: {
      type: Object,
      value: {},
    },
    idCardPhotos: {
      type: Object,
      value: {},
    },
    // isAdmin: {
    //   type: Boolean,
    //   value: false,
    // }
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
  }
})
