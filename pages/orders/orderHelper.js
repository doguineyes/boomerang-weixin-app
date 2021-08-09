const app = getApp();

function getOrderPromise (id) {
  const token = "Bearer " + app.globalData.token;
  const baseUrl = app.globalData.baseUrl;
  const orderUrl = baseUrl + `/orders/${id}`;
  return new Promise((resolve, reject) => {
    wx.request({
      url: orderUrl,
      method: "GET",
      header: {
        "content-type": "application/json",
        "Authorization": token
      },
      success: function(res) {
        if (res.statusCode !== 200) {
          reject(res);
        }
        const newOrder = res.data;
        for (let cargo of newOrder.cargoRecords) {
          for (let photo of cargo.photos) {
            photo.originPath = photo.url;
            photo.url = "";
            photo.isImage = true;
            photo.deletable = false;
            photo.status = "uploading";
            photo.type = "original";
          }
        }
        resolve(newOrder);
      },
      fail(err) {
        reject(err);
      },
    });
  });
}

function getPhotosPromise(order, setPhotoOk) {
  const token = "Bearer " + app.globalData.token;
  const baseUrl = app.globalData.baseUrl;
  let downloadingPhotoTasks = [];
  const orderId = order.id;
  for(let cargoIndex in order.cargoRecords) {
    for (let photoIndex in order.cargoRecords[cargoIndex].photos) {
      const cargo = order.cargoRecords[cargoIndex];
      const photo = cargo.photos[photoIndex];
      const photoUrl = baseUrl + `/orders/${orderId}/cargos/${cargo.id}/photos/${photo.id}`;
      let task = new Promise((resolve, reject) => {
        wx.downloadFile({
          url: photoUrl,
          header: {
            "content-type": "application/json",
            "Authorization": token
          },
          success (res) {
            if (res.statusCode === 200) {
              photo.url = res.tempFilePath;
              photo.status = "done";
              photo.deletable = true;
            }
            setPhotoOk(cargoIndex, photoIndex, photo);
            resolve();
          },
          fail: function(err) {
            reject(err);
          }
        });
      });
      downloadingPhotoTasks.push(task);
    }
  }
  let orderWithPhotosPromise = Promise.all(downloadingPhotoTasks)
  // .then(
  //   (res) => {
  //     return order;
  //   }
  // );
  return orderWithPhotosPromise;
}

export {getOrderPromise, getPhotosPromise};