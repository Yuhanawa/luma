async _toggleQuote(aside) {
  if (this.expanding) {
    return;
  }
  this.expanding = true;
  const blockQuote = aside.querySelector("blockquote");
  if (!blockQuote) {
    return;
  }
  if (aside.dataset.expanded) {
    delete aside.dataset.expanded;
  } else {
    aside.dataset.expanded = true;
  }
  const quoteId = blockQuote.id;
  if (aside.dataset.expanded) {
    this._updateQuoteElements(aside, "chevron-up");

    // Show expanded quote
    this.originalQuoteContents.set(quoteId, blockQuote.innerHTML);
    const originalText = blockQuote.textContent.trim() || this.attrs.cooked.querySelector("blockquote").textContent.trim();
    blockQuote.innerHTML = spinnerHTML;
    const topicId = parseInt(aside.dataset.topic || this.attrs.topicId, 10);
    const postId = parseInt(aside.dataset.post, 10);
    try {
      const result = await ajax(`/posts/by_number/${topicId}/${postId}`);
      const post = this._post();
      const quotedPosts = post.quoted || {};
      quotedPosts[result.id] = result;
      post.set("quoted", quotedPosts);
      const div = createDetachedElement("div");
      div.classList.add("expanded-quote");
      div.dataset.postId = result.id;
      div.innerHTML = result.cooked;
      this._decorateAndAdopt(div);
      highlightHTML(div, originalText, {
        matchCase: true
      });
      blockQuote.innerHTML = "";
      blockQuote.appendChild(div);
    } catch (e) {
      if ([403, 404].includes(e.jqXHR.status)) {
        const icon = e.jqXHR.status === 403 ? "lock" : "trash-can";
        blockQuote.innerHTML = `<div class='expanded-quote icon-only'>${iconHTML(icon)}</div>`;
      }
    }
  } else {
    // Hide expanded quote
    this._updateQuoteElements(aside, "chevron-down");
    blockQuote.innerHTML = this.originalQuoteContents.get(blockQuote.id);
  }
  this.expanding = false;
}