function setFlag(flag) {
  $.ajax({
    type: "POST",
    url: "/api/flag/" + flag.toLowerCase(),
    success: function () {},
    error: function (error) {
      console.error("Error updating flag: " + flag.toUpperCase());
      console.error(error);
    },
  });
}

function setProgress(percent) {
  $('.progress-bar').css('width', percent + '%');
}
