$(function () {
    $('.delete').on('click', function (e) {
        const url = $(this).attr('href');
        e.preventDefault();
        Swal.fire({
            icon: 'warning',
            title: 'Do you want to continue',
            text: 'This record will be deleted permanently',
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
                        title: 'Deleted',
                        text: 'Record successfully deleted'
                    }).then(result => {
                        if (result.value) location.reload();
                        else setTimeout(function () {
                            location.reload();
                        }, 0);
                    })
                }).fail(() => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Operation failed',
                        text: 'Try again later'
                    });
                });
            }
        });
    });
});
