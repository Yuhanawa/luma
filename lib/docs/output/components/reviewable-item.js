@bind
async _performConfirmed(performableAction, additionalData = {}) {
  let reviewable = this.reviewable;
  let performAction = async () => {
    this.disabled = true;
    let version = reviewable.get("version");
    this.set("updating", true);
    const data = {
      send_email: reviewable.sendEmail,
      reject_reason: reviewable.rejectReason,
      ...additionalData
    };
    (pluginReviewableParams[reviewable.type] || []).forEach(param => {
      if (reviewable[param]) {
        data[param] = reviewable[param];
      }
    });
    return ajax(`/review/${reviewable.id}/perform/${performableAction.server_action}?version=${version}`, {
      type: "PUT",
      dataType: "json",
      data
    }).then(result => this._performResult(result.reviewable_perform_result, performableAction, reviewable)).catch(popupAjaxError).finally(() => {
      this.set("updating", false);
      this.disabled = false;
    });
  };
  if (performableAction.client_action) {
    let actionMethod = this[`client${classify(performableAction.client_action)}`];
    if (actionMethod) {
      if (!this.reviewable.claimed_by) {
        const claim = this.store.createRecord("reviewable-claimed-topic");
        try {
          await claim.save({
            topic_id: this.reviewable.topic.id,
            automatic: true
          });
          this.reviewable.set("claimed_by", {
            user: this.currentUser,
            automatic: true
          });
        } catch (e) {
          popupAjaxError(e);
          return;
        }
      }
      return actionMethod.call(this, reviewable, performAction);
    } else {
      // eslint-disable-next-line no-console
      console.error(`No handler for ${performableAction.client_action} found`);
      return;
    }
  } else {
    return performAction();
  }
}

async () => {
  this.disabled = true;
  let version = reviewable.get("version");
  this.set("updating", true);
  const data = {
    send_email: reviewable.sendEmail,
    reject_reason: reviewable.rejectReason,
    ...additionalData
  };
  (pluginReviewableParams[reviewable.type] || []).forEach(param => {
    if (reviewable[param]) {
      data[param] = reviewable[param];
    }
  });
  return ajax(`/review/${reviewable.id}/perform/${performableAction.server_action}?version=${version}`, {
    type: "PUT",
    dataType: "json",
    data
  }).then(result => this._performResult(result.reviewable_perform_result, performableAction, reviewable)).catch(popupAjaxError).finally(() => {
    this.set("updating", false);
    this.disabled = false;
  });
}

async _penalize(adminToolMethod, reviewable, performAction) {
  let adminTools = this.adminTools;
  if (adminTools) {
    let createdBy = reviewable.get("target_created_by");
    let postId = reviewable.get("post_id");
    let postEdit = reviewable.get("raw");
    let claimed_by = reviewable.get("claimed_by");
    const data = await adminTools[adminToolMethod](createdBy, {
      postId,
      postEdit,
      before: performAction
    });
    if (!data?.success && claimed_by?.automatic) {
      try {
        await ajax(`/reviewable_claimed_topics/${this.reviewable.topic.id}`, {
          type: "DELETE",
          data: {
            automatic: true
          }
        });
        this.reviewable.set("claimed_by", null);
      } catch (e) {
        popupAjaxError(e);
      }
    }
    return data;
  }
}