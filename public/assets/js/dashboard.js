$(function () {
    $('.toggle').on('click', function () {
        $('.svg_icon').toggleClass('expanded');
        $(this).siblings().slideToggle(300);
    });
});
