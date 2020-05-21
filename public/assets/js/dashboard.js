$(function () {
    $('.toggle').on('click', function () {
        $(this).find('.svg_icon').toggleClass('expanded');
        $(this).siblings().slideToggle(300);
    });

    $('.paper-delete').on('click', function (e) {
        e.preventDefault();
        Swal.fire({
            icon: 'warning',
            title: 'Do you really want to continue?',
            text: 'This action cannot be undone',
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.value) {
                $.ajax({
                    type: 'get',
                    url: $(this).attr('href'),
                }).done(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Paper successfully deleted.'
                    }).then((result) => {
                        if (result.value) location.reload();
                        else setTimeout(function () {
                            location.reload();
                        }, 0);
                    })
                }).fail(() => {
                    Swal.fire({
                        icon: 'danger',
                        title: 'Unable to process request',
                        text: 'Try again later'
                    });
                });
            }
        });
    });
});
