//jQuery to collapse the navbar on scroll
$(window).scroll(function() {
    if ($(".navbar").offset().top > 50) {
      $(".menu").addClass("fixed");
    } else {
      $(".menu").removeClass("fixed");
    }
});
