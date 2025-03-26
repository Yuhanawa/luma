function sendSubscriptionToServer(subscription, sendConfirmation) {
  ajax("/push_notifications/subscribe", {
    type: "POST",
    data: {
      subscription: subscription.toJSON(),
      send_confirmation: sendConfirmation
    }
  });
}

function unsubscribe(user, callback) {
  if (!isPushNotificationsSupported()) {
    return;
  }
  keyValueStore.setItem(userSubscriptionKey(user), "");
  return navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
    serviceWorkerRegistration.pushManager.getSubscription().then(subscription => {
      if (subscription) {
        subscription.unsubscribe().then(successful => {
          if (successful) {
            ajax("/push_notifications/unsubscribe", {
              type: "POST",
              data: {
                subscription: subscription.toJSON()
              }
            });
          }
        });
      }
    }).catch(e => {
      // eslint-disable-next-line no-console
      console.error(e);
    });
    if (callback) {
      callback();
    }
    return true;
  });
}

serviceWorkerRegistration => {
  serviceWorkerRegistration.pushManager.getSubscription().then(subscription => {
    if (subscription) {
      subscription.unsubscribe().then(successful => {
        if (successful) {
          ajax("/push_notifications/unsubscribe", {
            type: "POST",
            data: {
              subscription: subscription.toJSON()
            }
          });
        }
      });
    }
  }).catch(e => {
    // eslint-disable-next-line no-console
    console.error(e);
  });
  if (callback) {
    callback();
  }
  return true;
}

subscription => {
  if (subscription) {
    subscription.unsubscribe().then(successful => {
      if (successful) {
        ajax("/push_notifications/unsubscribe", {
          type: "POST",
          data: {
            subscription: subscription.toJSON()
          }
        });
      }
    });
  }
}

successful => {
  if (successful) {
    ajax("/push_notifications/unsubscribe", {
      type: "POST",
      data: {
        subscription: subscription.toJSON()
      }
    });
  }
}