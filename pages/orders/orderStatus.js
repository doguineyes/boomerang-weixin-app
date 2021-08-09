function orderStatusNameToOption(name) {
  const orderStatusNamesToOptions = {
    "新订单": "NewOrder",
    "待支付": "UnPaid",
    "已支付": "PaymentCompleted",
    "已完成": "Mailed",
    "已取消": "Cancelled",
  };
  return orderStatusNamesToOptions[name];
}

function orderStatusOptionToName(status) {
  const orderStatusOptionsToNames = {
    "NewOrder": "新订单",
    "UnPaid": "待支付",
    "PaymentCompleted": "已支付",
    "Mailed": "已完成",
    "Cancelled": "已取消",
  };
  return orderStatusOptionsToNames[status];
}

function getOrderView(order) {
  const mapper = {
    "NewOrder": "/pages/orders/steps/new-order?orderId=",
    "UnPaid": "/pages/orders/steps/unpaid-order?orderId=",
    "PaymentCompleted": "/pages/orders/steps/paid-order?orderId=",
    "Mailed": "/pages/orders/steps/paid-order?orderId=",
    "Cancelled": "/pages/orders/steps/paid-order?orderId=",
  }
  return mapper[order.orderStatus];
}

function getOrderStatusName(order) {
  if (isNewOrder(order)) {
    return "新订单";
  } else if (isToBePaid(order)) {
    return "待支付";
  } else if (isPaid(order)) {
    return "已支付";
  } else if (isCompleted(order)) {
    return "已完成";
  } else if (isCancelled(order)) {
    return "已取消";
  }
}

function isNewOrder(order) {
  return (order.orderStatus === "NewOrder");
}

function isToBePaid(order) {
  return (order.orderStatus === "UnPaid");
}

function isPaid(order) {
  return (order.orderStatus === "PaymentCompleted");
}

function isCompleted(order) {
  return (order.orderStatus === "Mailed");
}

function isCancelled(order) {
  return (order.orderStatus === "Cancelled");
}

export {isPaid, isCompleted, orderStatusNameToOption, orderStatusOptionToName, getOrderView, isNewOrder, isToBePaid, getOrderStatusName};
