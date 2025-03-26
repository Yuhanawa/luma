function loadScript(url, opts = {}) {
  if (_loaded[url]) {
    return Promise.resolve();
  }
  url = cacheBuster(url);

  // Scripts should always load from CDN
  // CSS is type text, to accept it from a CDN we would need to handle CORS
  const fullUrl = opts.css ? getURL(url) : getURLWithCDN(url);
  document.querySelectorAll("script").forEach(element => {
    const src = element.getAttribute("src");
    if (src && src !== fullUrl && !_loading[src]) {
      _loaded[src] = true;
    }
  });
  return new Promise(function (resolve) {
    // If we already loaded this url
    if (_loaded[fullUrl]) {
      return resolve();
    }
    if (_loading[fullUrl]) {
      return _loading[fullUrl].then(resolve);
    }
    let done;
    _loading[fullUrl] = new Promise(function (_done) {
      done = _done;
    });
    _loading[fullUrl].then(function () {
      delete _loading[fullUrl];
    });
    const cb = function (data) {
      if (opts?.css) {
        const style = document.createElement("style");
        style.innerText = data;
        document.querySelector("head").appendChild(style);
      }
      done();
      resolve();
      _loaded[url] = true;
      _loaded[fullUrl] = true;
    };
    if (opts.css) {
      ajax({
        url: fullUrl,
        dataType: "text"
      }).then(cb);
    } else {
      // Always load JavaScript with script tag to avoid Content Security Policy inline violations
      loadWithTag(fullUrl, cb);
    }
  });
}

function (resolve) {
  // If we already loaded this url
  if (_loaded[fullUrl]) {
    return resolve();
  }
  if (_loading[fullUrl]) {
    return _loading[fullUrl].then(resolve);
  }
  let done;
  _loading[fullUrl] = new Promise(function (_done) {
    done = _done;
  });
  _loading[fullUrl].then(function () {
    delete _loading[fullUrl];
  });
  const cb = function (data) {
    if (opts?.css) {
      const style = document.createElement("style");
      style.innerText = data;
      document.querySelector("head").appendChild(style);
    }
    done();
    resolve();
    _loaded[url] = true;
    _loaded[fullUrl] = true;
  };
  if (opts.css) {
    ajax({
      url: fullUrl,
      dataType: "text"
    }).then(cb);
  } else {
    // Always load JavaScript with script tag to avoid Content Security Policy inline violations
    loadWithTag(fullUrl, cb);
  }
}