_processQueue() {
  if (_queue.length === 0) {
    return;
  }
  if (_processing >= MAX_CONCURRENCY) {
    return;
  }
  _processing++;
  const jobs = _queue.splice(0, MAX_JOB_SIZE);

  // if queue has still jobs after splice, we request a future processing
  if (_queue.length > 0) {
    discourseDebounce(this, this._processQueue, DEBOUNCING_DELAY);
  }
  let reports = {};
  jobs.forEach(job => {
    reports[job.type] = job.params;
  });
  ajax(BULK_REPORTS_ENDPOINT, {
    data: {
      reports
    }
  }).then(response => {
    jobs.forEach(job => {
      const report = response.reports.findBy("type", job.type);
      job.runnable()(report);
    });
  }).catch(data => {
    jobs.forEach(job => {
      if (data.jqXHR && data.jqXHR.status === 429) {
        job.runnable()(429);
      } else if (data.jqXHR && data.jqXHR.status === 500) {
        job.runnable()(500);
      } else {
        job.runnable()();
      }
    });
  }).finally(() => {
    _processing--;
    discourseDebounce(this, this._processQueue, DEBOUNCING_DELAY);
  });
}