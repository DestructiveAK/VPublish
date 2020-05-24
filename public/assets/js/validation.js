$(function () {
    const passwordField = $('input[name="password"]');
    const confirmPasswordField = $('input[name="passwordrepeat"]');

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

    $('button[type="submit"]').on('click', function () {
        validatePassword();
    });
});
