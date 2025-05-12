const XIPHOID_VID = "uT3arOC9ZXc";
const COMPRESSION_VID = "2PngCv7NjaI";

$(document).ready(function () {
  if (id === 8) {
    $("#embeddedYoutubeVideo").attr(
      "src",
      "https://www.youtube.com/embed/" + XIPHOID_VID + "?autoplay=1"
    );
  } else if (id === 5) {
    $("#embeddedYoutubeVideo").attr(
      "src",
      "https://www.youtube.com/embed/" + COMPRESSION_VID + "?autoplay=1"
    );
  } else if (id === 7) {
    setFlag("STEPS_COMPLETED");
  }

  // id = 5, flag = false: 4<-
  // id = 5, flag = true:  4<- ->6
  // id = 7, flag = any:   6<- ->/
  // id = 8, flag = any:       ->5

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
    setFlag("XIPHOID_SEEN");
  });
});
