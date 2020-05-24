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

    $('.paper-accept, .paper-reject, .paper-review').on('click', function (e) {
        e.preventDefault();
        const url = $(this).attr('href');
        Swal.fire({
            icon: 'warning',
            title: 'Do you really want to continue?',
            text: 'This action cannot be undone',
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(result => {
            if (result.value) {
                $.ajax({
                    type: 'get',
                    url: url
                }).done(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Operation successful'
                    }).then(() => {
                        location.reload();
                    });
                }).fail(() => {
                    Swal.fire({
                        icon: 'danger',
                        title: 'Operation failed',
                        text: 'Try again later'
                    }).then(() => {
                        location.reload();
                    })
                });
            }
        });
    });

    $('.paper-revision').on('click', function (e) {
        e.preventDefault();
        const url = $(this).attr('href');
        Swal.fire({
            icon: 'warning',
            title: 'Type your message here:',
            input: 'textarea',
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel'
        }).then(result => {
            $.ajax({
                type: 'post',
                url: url,
                data: {message: result.value}
            }).done(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Operation Successful'
                }).then(() => {
                    location.reload();
                });
            }).fail(() => {
                Swal.fire({
                    icon: 'danger',
                    title: 'Operation failed'
                });
            });
        });
    });
});
