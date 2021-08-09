import {isNewOrder} from "../../pages/orders/orderStatus.js";

test('given new order then is new order', () => {
  debugger;
  const order = {
    id: "123456",
    receiver: {
      address: "北京东路81号",
    },
    cargoRecords: [{
      name: "手机"
    }],
  };
  expect(isNewOrder(order)).toBe(true);
});