$(document).ready(function () {
  var newsletterModal = $('#newsletter-modal');
  var modalCookie = Cookies.get('newsletter-modal');
  
  if (modalCookie == undefined) {
    setTimeout(function() {
      newsletterModal.modal();
    }, 2000);
  }

  newsletterModal.on($.modal.BEFORE_CLOSE, function(e, m) {
    // Cookies.set('newsletter-modal', 'closed', { expires: 7 });
  });
});