$(document).ready(function () {
    if (id === 1) {
        $("#stepPrev").hide();
    }

    $("#stepPrev").click(function () {
        window.location.href = "/steps/" + (id - 1);
    });

    $("#stepNext").click(function () {
        if (id == 7) {
            window.location.href = "/";
        } else {
            window.location.href = "/steps/" + (id + 1);
        }
    });
});
