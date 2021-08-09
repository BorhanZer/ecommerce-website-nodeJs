$(function() {
    if ($('textarea#ta').length) {
        CKEDITOR.replace('ta');
    }
    $('a.confirmDeletion').on('click', function() {
        if (!confirm('Confirm deletion')) {
            return false;
        }
    })
    $('a.confirmClearCart').on('click', function() {
        if (!confirm('do you want to clear your cart?')) {
            return false;
        }
    })
    if ($("[data-fancybox]").length) {
        $("[data-fancybox]").fancybox({
            loop: false,
        });
    }
    //buynow
    $('a.buynow').on('click', function(e) {
        e.preventDefault();
        $.get('/cart/buynow', function() {
            $('form.pp input[type=image]').click();
            $('.ajaxbg').show();
        })
    })
});