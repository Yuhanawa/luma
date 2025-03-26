file => {
  const data = {
    file_name: file.name,
    file_size: file.size,
    type: this.config.type
  };

  // the sha1 checksum is set by the UppyChecksum plugin, except
  // for in cases where the browser does not support the required
  // crypto mechanisms or an error occurs. it is an additional layer
  // of security, and not required.
  if (file.meta.sha1_checksum) {
    data.metadata = {
      "sha1-checksum": file.meta.sha1_checksum
    };
  }
  return ajax(`${this.config.uploadRootPath}/generate-presigned-put`, {
    type: "POST",
    data
  }).then(response => {
    this.uppyWrapper.uppyInstance.setFileMeta(file.id, {
      uniqueUploadIdentifier: response.unique_identifier
    });
    return {
      method: "put",
      url: response.url,
      headers: {
        ...response.signed_headers,
        "Content-Type": file.type
      }
    };
  }).catch(errResponse => {
    displayErrorForUpload(errResponse, this.siteSettings, file.name);
    this.#reset();
  });
}