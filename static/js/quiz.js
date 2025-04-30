$(function () {
  let answered = false;

  const _qid = qid;
  const _total = total;

  const $prev = $("#quizPrev");
  const $next = $("#quizNext");
  const $form = $("#quizForm");

  // hide Prev on first question
  if (_qid === 1) {
    $prev.hide();
  }

  // set button text
  if (_qid === _total) {
    $next.html('Submit <i class="bi bi-arrow-right"></i>');
  } else {
    $next.html('<i class="bi bi-arrow-right"></i>');
  }

  const correct = window.correctAnswer;

  $next.on("click", function (e) {
    e.preventDefault();

    if (!answered) {
      let valid = false;
      let userAnswer = null;

      // 用户答案提取
      if (qType === "fill") {
        userAnswer = $.trim($("input[name='answer_text']").val());
        valid = userAnswer.length > 0;
      } else {
        userAnswer = $form.find("input[name='answer']:checked").map(function () {
          return parseInt($(this).val());
        }).get();
        valid = userAnswer.length > 0;
      }

      if (!valid) {
        return alert("Please provide an answer 👍");
      }

      // ✅ 检查是否正确
      // ✅ 判断对错 + 构造答案对比内容
      let isCorrect = false;
      let displayAnswer = "";
      let userDisplay = "";

      if (qType === "fill") {
        isCorrect = userAnswer.trim().toLowerCase() === correct.trim().toLowerCase();
        userDisplay = `<b>Your answer:</b> ${userAnswer}`;
        displayAnswer = `<b>Correct:</b> ${correct}`;
      } else if (Array.isArray(correct)) {
        const userSorted = [...userAnswer].sort().join(",");
        const correctSorted = [...correct].sort().join(",");
        isCorrect = userSorted === correctSorted;

        userDisplay = `<b>Your answer:</b><br>` + userAnswer.map(i => $("label").eq(i).text().trim()).join("<br>");
        displayAnswer = `<b>Correct:</b><br>` + correct.map(i => $("label").eq(i).text().trim()).join("<br>");
      } else {
        isCorrect = userAnswer[0] === correct;
        userDisplay = `<b>Your answer:</b> ${$("label").eq(userAnswer[0]).text().trim()}`;
        displayAnswer = `<b>Correct:</b> ${$("label").eq(correct).text().trim()}`;
      }

      // ✅ 添加对错提示前缀
      let resultPrefix = isCorrect
        ? `<div class="text-success fw-bold mb-2">✅ You answered correctly!</div>`
        : `<div class="text-danger fw-bold mb-2">❌ That's incorrect.</div>`;

      // ✅ 拼接所有展示内容
      let finalHtml = resultPrefix + userDisplay + "<hr>" + displayAnswer;

      $("#correctAnswerText").html(finalHtml);
      $("#answerCard").removeClass("d-none");  // ✅ 显示卡片
      $('html, body').animate({
        scrollTop: $("#answerCard").offset().top - 100
      }, 300);  // ✅ 滚动到卡片位置

      answered = true;
      return;


      if (!answered) {
        $("#correctAnswerText").html(finalHtml);
        $("#answerCard").removeClass("d-none");
        answered = true;
      
        $('html, body').animate({
          scrollTop: $("#answerCard").offset().top - 100
        }, 300);
        return;  // ✅ 防止立即跳转
      }
      


    }

    // 第二次点击 → 跳转
    if (_qid === _total) {
      $form.submit();
    } else {
      window.location.assign(`/quiz/${_qid + 1}`);
    }
  });
});
