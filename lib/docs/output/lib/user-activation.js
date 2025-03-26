function resendActivationEmail(username) {
  return ajax(userPath("action/send_activation_email"), {
    type: "POST",
    data: {
      username
    }
  }).catch(popupAjaxError);
}

function changeEmail(data) {
  return ajax(userPath("update-activation-email"), {
    data,
    type: "PUT"
  });
}