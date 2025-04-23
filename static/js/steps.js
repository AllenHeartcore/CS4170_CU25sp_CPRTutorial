const XIPHOID_VIDEO_ID = "uT3arOC9ZXc";
const COMPRESSION_VIDEO_ID = "2PngCv7NjaI";

$(document).ready(function () {
    // id = 5, flag = false: 4<-
    // id = 5, flag = true:  4<- ->6
    // id = 8, flag = any:       ->5

    if (id === 1 || id === 8) {
        $("#stepPrev").hide();
    }
    if (id === 5 && !flag_xiphoid_seen) {
        $("#stepNext").hide();
    }

    $("#stepPrev").click(function () {
        window.location.href = "/steps/" + (id - 1);
    });

    $("#stepNext").click(function () {
        if (id === 7) {
            window.location.href = "/";
        } else if (id === 8) {
            window.location.href = "/steps/5";
        } else {
            window.location.href = "/steps/" + (id + 1);
        }
    });
});
