// hamburger toggler
if ($('.c-hamburger').length) {
  var toggleHandler = function toggleHandler(toggle) {
    toggle.addEventListener("tap", function (e) {
      e.preventDefault();
      this.classList.contains("is-active") === true ? this.classList.remove("is-active") : this.classList.add("is-active");
    });
  };

  var toggles = document.querySelectorAll(".c-hamburger");

  for (var i = toggles.length - 1; i >= 0; i--) {
    var toggle = toggles[i];
    toggleHandler(toggle);
  };
}

// slideout menu
if ($('.mobile_sidebar').length) {

  if ($(window).width() <= 992) {
    (function () {

      var slideout = new Slideout({
        'panel': document.getElementById('main'),
        'menu': document.getElementById('mobile_sidebar'),
        'padding': 320,
        'tolerance': 70
      });

      if ($('.header--menu_opener').length) {
        $('.header--menu_opener').on('click', function (e) {
          slideout.toggle();
          e.preventDefault();
        });

        // $('.header--menu_opener button').on('click', (e) => {
        // 	e.preventDefault()
        // });
      }

      if ($('.mobile_sidebar--closer').length) {
        $('.mobile_sidebar--closer').on('click', function (e) {
          e.preventDefault();
          $('.c-hamburger').removeClass('is-active');
          slideout.close();
        });
      }

      $('.mobile_menu .menu-item > a').on('click', function (e) {
        var $item = $(e.target);
        $item.parent('.menu-item').toggleClass('-active');
      });
    })();
  }
}
