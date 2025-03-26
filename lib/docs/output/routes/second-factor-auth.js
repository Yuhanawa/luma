model(params) {
  if (PreloadStore.data.has("2fa_challenge_data")) {
    return PreloadStore.getAndRemove("2fa_challenge_data");
  } else {
    return ajax("/session/2fa.json", {
      type: "GET",
      data: {
        nonce: params.nonce
      }
    }).catch(errorResponse => {
      const error = extractError(errorResponse);
      if (error) {
        return {
          error
        };
      } else {
        throw errorResponse;
      }
    });
  }
}