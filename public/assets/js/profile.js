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
