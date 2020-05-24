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
            }).then(() => {
                location.reload();
            });
        }).fail((response) => {
            Swal.fire({
                icon: 'error',
                title: response.responseText
            }).then(() => {
                location.reload();
            });
        });
    });

    $('button.change-image').on('click', function (e) {
        e.preventDefault();
        $(this).siblings('form.change-image').show();
        $(this).hide();
    });


    const passwordField = $('input[id="new_password"]');
    const confirmPasswordField = $('input[id="confirm_password"]');

    function validatePassword() {
        if (passwordField.get(0).validity.patternMismatch) {
            passwordField.get(0).setCustomValidity('Password must contain at least one uppercase,' +
                'one lowercase and one digit, and must have at least 8 characters');
        } else {
            passwordField.get(0).setCustomValidity('');
        }
        if (passwordField.val() !== confirmPasswordField.val()) {
            confirmPasswordField.get(0).setCustomValidity('Passwords do not match');
        } else {
            confirmPasswordField.get(0).setCustomValidity('');
        }
    }

    $('button.btn-change-password').on('click', function () {
        validatePassword();
    });
});
