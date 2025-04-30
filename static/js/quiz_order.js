/**
 * quiz_order.js
 * Support mouse drag/drop and touch drag, prevent page scroll
 * Highlight drop-box only when dragged over (web and touch)
 */
$(function () {
    if (typeof $ === "undefined") {
        alert("jQuery failed to load");
        return;
    }
    const _qid = qid,
        _total = total;
    const $prev = $("#quizPrev"),
        $next = $("#quizNext"),
        $choices = $("#choices"),
        $boxes = $(".drop-box"),
        $form = $("#orderForm");

    // Prev/Next buttons
    if (_qid === 1) $prev.hide();
    else
        $prev
            .show()
            .on("click", () => window.location.assign(`/quiz/${_qid - 1}`));
    $next.html(
        _qid === _total
            ? 'Submit <i class="bi bi-arrow-right"></i>'
            : 'Next <i class="bi bi-arrow-right"></i>'
    );

    // Helpers
    function onDragStart($img) {
        $img.css("opacity", "0.5");
        $img.data("origInBox", $img.parent().hasClass("drop-box"));
        $img.data("dropped", false);
    }
    function onDragEnd($img) {
        $img.css("opacity", "");
        if ($img.data("origInBox") && !$img.data("dropped")) {
            $choices.append($img);
        }
    }
    function doDrop($img, $box) {
        $img.data("dropped", true).css("opacity", "");
        const $exist = $box.find("img.draggable");
        if ($exist.length) $choices.append($exist);
        $box.append($img);
    }

    // —— Mouse drag/drop ——
    $(document).on("dragstart", "img.draggable", (e) => {
        onDragStart($(e.target));
        e.originalEvent.dataTransfer.setData("text/plain", e.target.id);
    });
    $(document).on("dragend", "img.draggable", (e) => {
        onDragEnd($(e.target));
    });
    $boxes
        .on("dragover", (e) => {
            e.preventDefault();
            $(e.currentTarget).addClass("highlight");
        })
        .on("dragleave", (e) => {
            $(e.currentTarget).removeClass("highlight");
        })
        .on("drop", (e) => {
            e.preventDefault();
            const $box = $(e.currentTarget).removeClass("highlight");
            const id = e.originalEvent.dataTransfer.getData("text/plain");
            doDrop($("#" + id), $box);
        });

    // —— Touch drag ——
    let touchImg = null,
        touchBox = null;

    $(document).on("touchstart", "img.draggable", function (e) {
        touchImg = $(this);
        onDragStart(touchImg);
        touchBox = null;
        // disable scroll
        e.preventDefault();
    });

    $(document).on("touchmove", function (e) {
        if (!touchImg) return;
        e.preventDefault();
        const t = e.originalEvent.touches[0];
        touchImg.css({
            position: "fixed",
            left: t.clientX - touchImg.width() / 2 + "px",
            top: t.clientY - touchImg.height() / 2 + "px",
            "z-index": "1000",
        });

        // Real-time highlight & record box under finger
        touchBox = null;
        $boxes.removeClass("highlight");
        $boxes.each(function () {
            const rect = this.getBoundingClientRect();
            if (
                t.clientX >= rect.left &&
                t.clientX <= rect.right &&
                t.clientY >= rect.top &&
                t.clientY <= rect.bottom
            ) {
                $(this).addClass("highlight");
                touchBox = $(this);
            }
        });
    });

    $(document).on("touchend touchcancel", function (e) {
        if (!touchImg) return;
        // restore style
        touchImg.css({
            position: "",
            left: "",
            top: "",
            "z-index": "",
            opacity: "",
        });
        $boxes.removeClass("highlight");

        if (touchBox) {
            doDrop(touchImg, touchBox);
        } else {
            onDragEnd(touchImg);
        }

        touchImg = null;
        touchBox = null;
    });

    // —— Next/Submit logic ——
    $next.on("click", (e) => {
        e.preventDefault();
        let valid = true;
        $boxes.each(function () {
            if (!$(this).find("img.draggable").length) valid = false;
        });
        if (!valid) return alert("Please place all images into the boxes.");

        // collect order
        const order = [];
        $boxes.each(function () {
            order.push($(this).find("img.draggable").attr("id").split("-")[1]);
        });

        // write hidden inputs
        $form.find("input[name='order']").remove();
        order.forEach((num) => {
            $form.append(
                $("<input>")
                    .attr("type", "hidden")
                    .attr("name", "order")
                    .val(num)
            );
        });

        // submit or next
        if (_qid === _total) $form.submit();
        else window.location.assign(`/quiz/${_qid + 1}`);
    });
});
