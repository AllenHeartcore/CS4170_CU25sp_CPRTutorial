$(function () {
  let answered = false;

  const _qid = qid;
  const _total = total;

  // const $prev = $("#quizPrev");
  const $next = $("#quizNext");
  const $form = $("#quizForm");

  // hide Prev on first question
  // if (_qid === 1) {
  //   $prev.hide();
  // }

  // set button text
  if (_qid === _total) {
    $next.html('Finish <i class="bi bi-arrow-right"></i>');
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
          return $(this).val();
        }).get();
        valid = userAnswer.length > 0;
      }

      if (!valid) {
        return alert("Please provide an answer 👍");
      }

  
      let isCorrect = false;
      let displayAnswer = "";
      let userDisplay = "";

      if (qType === "fill") {
        if (Array.isArray(correct)) {
          userAnswer = userAnswer.split(/[\s,，|]+/)
                                                .map(s => parseInt(s))
                                                .filter(n => !isNaN(n));

          isCorrect = userAnswer.length === correct.length &&
            userAnswer.every((v, i) => v === correct[i]);
          userDisplay = `<b>Your answer:</b> ${userAnswer.join(', ')}`;
          displayAnswer = `<b>Correct answer:</b> ${correct.join(', ')}`;
        }
        else {
          isCorrect = userAnswer.trim().toLowerCase() === correct.trim().toLowerCase();
          userDisplay = `<b>Your answer:</b> ${userAnswer}`;
          displayAnswer = `<b>Correct answer:</b> ${correct}`;
        }
      } else if (qType === "multi") {
        console.log('I am here for multi');
        // userAnswer: e.g. ["A","B"]
        // correct:     e.g. ["A","B"]
        const ua = userAnswer;
        const ca = Array.isArray(correct) ? correct : [correct];
      
        // 多选按字母排序再对比
        const sortedU = [...ua].sort().join(",");
        const sortedC = [...ca].sort().join(",");
        isCorrect = sortedU === sortedC;
      
        // 只 display key，不去拿 label 文本
        userDisplay   = `<b>Your answer:</b> ${ua.join(", ")}`;
        displayAnswer = `<b>Correct answer:</b> ${ca.join(", ")}`;
      }
      else {  // 单选题
        console.log('I am here for single');
        const ua = userAnswer[0];    // e.g. "C"
        const ca = correct;          // e.g. "C"
        isCorrect    = ua === ca;
        userDisplay   = `<b>Your answer:</b> ${ua}`;
        displayAnswer = `<b>Correct answer:</b> ${ca}`;
      }

      let resultPrefix = isCorrect
      ? `<span class="text-success fw-bold">✅ Correct! </span>`
      : `<span class="text-danger fw-bold">❌ Incorrect! </span>`;

      let finalHtml = userDisplay + "<hr>" + displayAnswer;

      $('#collapseTitle').html(resultPrefix);

      $("#correctAnswerText").html(finalHtml);
      $form.append(
        $("<input>")
          .attr("type", "hidden")
          .attr("name", "is_correct")
          .val(isCorrect ? "1" : "0")  
      );
      


      $("#answerAccordion").removeClass("d-none");


      const collapseEl = document.getElementById('collapseAnswer');
      const btn        = document.querySelector('#headingAnswer button');

      btn.addEventListener('click', function(e) {
        e.preventDefault();

        const isOpen = collapseEl.classList.toggle('show');
        btn.classList.toggle('collapsed', !isOpen);
        btn.setAttribute('aria-expanded', isOpen);
      });

      

      $('html, body').animate({
        scrollTop: $('#collapseAnswer').offset().top - 100
      }, 300);

      $form.find('input[name="answer"]').prop('disabled', true);
      $form.find('input[name="answer_text"]').prop('disabled', true);

      answered = true;
      
      return;


      // if (!answered) {
      //   $("#correctAnswerText").html(finalHtml);
      //   $("#answerCard").removeClass("d-none");
      //   answered = true;
      
      //   $('html, body').animate({
      //     scrollTop: $("#answerCard").offset().top - 100
      //   }, 300);
      //   return;  // ✅ 防止立即跳转
      // }
      


    }

    // 第二次点击 → 跳转
    
    $form.submit();
    console.log(window.score)
  });
});
