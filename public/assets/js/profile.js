(function ($) {
    "use strict"; // Start of use strict

    // Scroll to top button appear
    $(document).on('scroll', function () {
        const scrollDistance = $(this).scrollTop();
        if (scrollDistance > 100) {
            $('.scroll-to-top').fadeIn();
        } else {
            $('.scroll-to-top').fadeOut();
        }
    });

    // Smooth scrolling using jQuery easing
    $(document).on('click', 'a.scroll-to-top', function (e) {
        const $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top)
        }, 1000, 'easeInOutExpo');
        e.preventDefault();
    });

})(jQuery); // End of use strict

$(function () {
    $('.btn-change-details').on('click', () => {
        $('input[name="firstname"]').removeAttr('readonly');
        $('input[name="lastname"]').removeAttr('readonly');
        $('input[name="email"]').removeAttr('readonly');
        $('.btn-change-details').hide();
        $('.btn-submit-details').show();
    });

    const form = $('form#change-password');
    form.on('submit', (e) => {
        e.preventDefault();
        $.ajax({
            type: 'post',
            url: form.attr('action'),
            data: form.serialize()
        }).done(response => {
            Swal.fire({
                icon: 'success',
                title: response
            });
        }).fail(response => {
            Swal.fire({
                icon: 'danger',
                title: response
            });
        });
    });
});
