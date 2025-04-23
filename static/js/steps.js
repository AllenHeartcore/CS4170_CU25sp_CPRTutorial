const XIPHOID_VIDEO_ID = "uT3arOC9ZXc";
const COMPRESSION_VIDEO_ID = "2PngCv7NjaI";

$(document).ready(function () {
    // id = 5, flag = false: 4<-
    // id = 5, flag = true:  4<- ->6
    // id = 8, flag = any:       ->5

    if (id === 1 || id === 8) {
        $("#stepPrev").hide();
        $("#embeddedYoutubeVideo").src =
            "https://www.youtube.com/embed/" + XIPHOID_VIDEO_ID + "?autoplay=1";
    }
    if (id === 5) {
        if (flag_xiphoid_seen) {
            $("#embeddedYoutubeVideo").src =
                "https://www.youtube.com/embed/" +
                COMPRESSION_VIDEO_ID +
                "?autoplay=1";
        } else {
            $("#stepNext").hide();
        }
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

    $("#stepXiphoid").click(function () {
        window.location.href = "/steps/8";
        $.ajax({
            type: "POST",
            url: "/api/flag/xiphoid_seen",
            success: function () {},
            error: function (error) {
                console.error("Error updating flag: XIPHOID_SEEN");
                console.error(error);
            },
        });
    });
});
