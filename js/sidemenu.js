    var $sidemenu = $('.sidemenu');
    var $menuIcon = $('.menu-icon');

    // Hide and show sidemenu on 'click'
    $menuIcon.click(function() {
        if ($sidemenu.hasClass('sidemenu_hide')) {
            $sidemenu.removeClass('sidemenu_hide').addClass('sidemenu_show');
        } else {
            $sidemenu.removeClass('sidemenu_show').addClass('sidemenu_hide');
        }
    });

    $('.map, .places-list').click(function() {
        $sidemenu.removeClass('sidemenu_show').addClass('sidemenu_hide');
    });
