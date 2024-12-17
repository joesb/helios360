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

  if ($('.testimonials--container')[0] && $('.testimonials--container').data('testimonial-count') > 1) {
    var container = $('.testimonials--container');
    var testimonialsContainer = container.find('.testimonials');
    var count = container.data('testimonial-count');
    var rand = Math.floor((Math.random() * count) + 1);
    var name = '.testimonial--' + rand;
    if (rand > 1) {
      var testimonial = $(name);
      testimonialsContainer.scrollLeft(testimonial.offset().left);
    }
  }

  $('.modal-contact-form-button').click(() => {
    $('.modal-contact-form').addClass('open-modal-contact').attr('aria-expanded', 'true').removeClass('close-modal-slide');
  });

  $('.modal-close').click(() => {
    let mCF = $('.modal-contact-form');
    if (mCF.hasClass('open-modal-contact')) {
      mCF.addClass('close-modal-slide').done(() => {
        this.removeClass('open-modal-contact');
      });
    }
  });

  $(document).on('keyup', function(event) { 
    if (event.key == "Escape") { 
      let mCF = $('.modal-contact-form');
      if (mCF.hasClass('open-modal-contact')) {
        mCF.addClass('close-modal-slide').done(() => {
          this.removeClass('open-modal-contact');
        });
      }
      let oM = $('.open-mobile');
      if (oM.length) {
        oM.removeClass('open-mobile');
        $('button.header-main__menu').attr('aria-expanded', 'false');
      }
    } 
  }); 
});
