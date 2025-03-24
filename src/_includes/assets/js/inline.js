$(document).ready(function () {
  $('html').addClass('js');

  // Open and close loop for main navigation on mobile.
  $('button.header-main__menu').click(function () {
    // when user clicks on nav btn..
    if ($('.open-mobile').length) {
      // .. if nav is already open..
      $('body').removeClass('open-mobile'); // .. remove the class..
      $('button.header-main__menu').attr('aria-expanded', 'false');
    } else {
      // .. if not ..
      $('body').addClass('open-mobile'); // .. add the open on mobile class..
      $('button.header-main__menu').attr('aria-expanded', 'true');
    }
  });
});
