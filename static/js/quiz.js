/**
 * quiz.js
 */
$(function () {
  if (typeof $ === "undefined") {
    alert("jQuery failed to load. Please check your network.");
    return;
  }

  const _qid = qid;
  const _total = total;

  const $prev = $("#quizPrev");
  const $next = $("#quizNext");
  const $form = $("#quizForm");

  // hide Prev on first question
  if (_qid === 1) {
    $prev.hide();
  }

  // set Next button label/icon
  if (_qid === _total) {
    $next.html('Submit <i class="bi bi-arrow-right"></i>');
  } else {
    $next.html('Next <i class="bi bi-arrow-right"></i>');
  }

  // Prev
  $prev.on("click", () => {
    window.location.assign(`/quiz/${_qid - 1}`);
  });

  // Next
  $next.on("click", function (e) {
    e.preventDefault();
    // basic validation
    let valid = false;
    if (qType === "fill") {
      valid = $.trim($("input[name='answer_text']").val()).length > 0;
    } else {
      valid = $form.find("input[name='answer']:checked").length > 0;
    }
    if (!valid) {
      return alert("Please provide an answer 👍");
    }

    if (_qid === _total) {
      $form.submit();
    } else {
      window.location.assign(`/quiz/${_qid + 1}`);
    }
  });
});
