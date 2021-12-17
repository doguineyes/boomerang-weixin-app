const app = getApp();

function getWarehouseAddressesPromise() {
  const token = "Bearer " + app.globalData.token;
  const baseUrl = app.globalData.baseUrl;
  const url = `${baseUrl}/orders/warehouse-addresses`;
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: "GET",
      header: {
        "content-type": "application/json",
        "Authorization": token,
      },
      success: function(response) {
        if (response.statusCode !== 200) {
          reject(response);
        }
        resolve(response.data);
      },
      fail(err) {
        reject(err);
      },
    })
  });
}

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
        resolve(newOrder);
      },
      fail(err) {
        reject(err);
      },
    });
  });
}

function getOrder(orderId, setOrder, setIdCardPhoto, setArrivalPhoto, setPackagePhoto) {
  const tasks = [];

  const getOrderTask = getOrderPromise(orderId)
  .then(
    (newOrder) => {
      setOrder(newOrder);
      return newOrder;
    }
  );
  tasks.push(getOrderTask);

  const getArrivalPhotoTasks = getOrderTask.then(
    (newOrder) => {
      return getArrivalPhotosPromises(newOrder, setArrivalPhoto);
    }
  );
  tasks.push(getArrivalPhotoTasks);

  const getPackagePhotosTasks = getOrderTask.then(
    (newOrder) => {
      if (newOrder.etkPackages && newOrder.etkPackages.length != 0) {
        return getPackagePhotosPromises(newOrder, setPackagePhoto);
      }
    }
  );
  tasks.push(getPackagePhotosTasks);
  
  const getIdCardFrontPhotoTask = getIdCardPhotoPromise(orderId, "id-card-front-photo")
  .then(
    (file) => {
      setIdCardPhoto(file, "front");
    }
  );
  tasks.push(getIdCardFrontPhotoTask);

  const getIdCardReversePhotoTask = getIdCardPhotoPromise(orderId, "id-card-reverse-side-photo")
  .then(
    (file) => {
      setIdCardPhoto(file, "reverse");
    }
  );
  tasks.push(getIdCardReversePhotoTask);

  return tasks;
}

function getIdCardPhotoPromise(orderId, sideUrl) {
  const token = "Bearer " + app.globalData.token;
  const baseUrl = app.globalData.baseUrl;
  const photoUrl = `${baseUrl}/orders/${orderId}/${sideUrl}`;
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: photoUrl,
      header: {
        "content-type": "application/json",
        "Authorization": token
      },
      success (res) {
        if (res.statusCode != 200) {
          reject(res);
        }
        resolve(res);
      },
      fail: function(err) {
        reject(err);
      },
    })
  });
}

function getPackagePhotosPromises(order, setPackagePhoto) {
  if (!order.etkPackages) return [];
  const token = "Bearer " + app.globalData.token;
  const baseUrl = app.globalData.baseUrl;
  const orderId = order.id;
  const tasks = [];
  for (let [packageIndex, etkPackage] of order.etkPackages.entries()) {
    if (!etkPackage.etkPackagePhotos) continue;
    for (let [photoIndex, photo] of etkPackage.etkPackagePhotos.entries()) {
      const packageId = etkPackage.id;
      const photoId = photo.id;
      const photoUrl = `${baseUrl}/orders/${orderId}/etk-packages/${packageId}/etk-package-photos/${photoId}`;
      let task = new Promise(
        (resolve, reject) => {
          wx.downloadFile({
            url: photoUrl,
            header: {
              "content-type": "application/json",
              "Authorization": token
            },
            success: function(res) {
              if (res.statusCode != 200) {
                reject(res);
              }
              setPackagePhoto(packageIndex, photoIndex, res.tempFilePath);
              resolve();
            },
            fail: function(err) {
              reject(err);
            },
          });
        }
      );
      tasks.push(task);
    }
  }
  return tasks;
}

function getArrivalPhotosPromises(order, setArrivalPhoto) {
  const token = "Bearer " + app.globalData.token;
  const baseUrl = app.globalData.baseUrl;
  const orderId = order.id;
  const tasks = [];
  for (let [index, photo] of order.arrivalPhotos.entries()) {
    const photoUrl = `${baseUrl}/orders/${orderId}/arrival-photos/${photo.id}`;
    let task = new Promise(
      (resolve, reject) => {
        wx.downloadFile({
          url: photoUrl,
          header: {
            "content-type": "application/json",
            "Authorization": token
          },
          success: function(res) {
            if (res.statusCode != 200) {
              reject(res);
            }
            setArrivalPhoto(index, res.tempFilePath);
            resolve();
          },
          fail: function(err) {
            reject(err);
          },
        });
      }
    );
    tasks.push(task);
  }
  return tasks;
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
          },
        });
      });
      downloadingPhotoTasks.push(task);
    }
  }
  let orderWithPhotosPromise = Promise.all(downloadingPhotoTasks);
  return orderWithPhotosPromise;
}

export {getWarehouseAddressesPromise, getOrderPromise, getPhotosPromise, getIdCardPhotoPromise, getArrivalPhotosPromises, getOrder};