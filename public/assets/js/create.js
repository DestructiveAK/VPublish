$(function () {
    var currentStep = $('.step').first();
    currentStep.addClass('active');
    
    $('.new-submission input[type="text"], textarea, input[type="email"]').on('focus', function () {
        $(this).removeClass('input-error');
    });

    // next step
    $('.new-submission .btn-next').on('click', function () {
        var parent_fieldset = $(this).parents('fieldset');
        var next_step = true;

        parent_fieldset.find('input[type="text"],input[type="email"], textarea').each(function () {
            if ($(this).val() === "") {
                $(this).addClass('input-error');
                next_step = false;
            } else {
                $(this).removeClass('input-error');
            }
        });

        if (next_step) {
            parent_fieldset.fadeOut(400, function () {
                $(this).next().fadeIn();
                currentStep = currentStep.next();
                currentStep.addClass('active');
                currentStep.prev().addClass('finish');
            });
        }

    });

    // previous step
    $('.new-submission .btn-prev').on('click', function () {
        $(this).parents('fieldset').fadeOut(400, function () {
            $(this).prev().fadeIn();
            currentStep.removeClass('active');
            currentStep = currentStep.prev();
            currentStep.removeClass('finish').addClass('active');
        });
    });

    // submit
    $('.new-submission').on('submit', function (e) {

        $(this).find('input[type="text"],input[type="email"]').each(function () {
            if ($(this).val() === "") {
                e.preventDefault();
                $(this).addClass('input-error');
            } else {
                $(this).removeClass('input-error');
            }
        });

    });


    $('form').on('submit', function () {
        Swal.fire({
            title: 'Uploading Files',
            text: 'Please wait...',
            imageUrl: '/assets/img/loading.svg',
            imageWidth: 200,
            imageHeight: 200,
            imageAlt: 'Loading',
            showConfirmButton: false
        });
    });

});
