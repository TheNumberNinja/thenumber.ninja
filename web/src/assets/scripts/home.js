// promo_slider
	if ($('.js-promo_slider').length) {
		(function () {

			var $carousel = $('.js-promo_slider'),
			    $nav = $('.js-promo_slider_nav');

			$carousel.slick({
				slidesToShow: 1,
				slidesToScroll: 1,
				arrows: false,
				speed: 250,
				asNavFor: $nav.length ? '.js-promo_slider_nav' : false,
				autoplay: true,
				autoplaySpeed: 6000
			});

			if ($nav.length) {

				$nav.slick({
					slidesToShow: 4,
					asNavFor: '.js-promo_slider',
					infinite: false,
					draggable: true,
					focusOnSelect: true,
					waitForAnimate: false,
					prevArrow: '\n\t\t\t\t\t<button class="slick-prev" type="button">\n\t\t\t\t\t\t<span class="icons8-long-arrow-right"></span>\n\t\t\t\t\t</button>\n\t\t\t\t\t',
					nextArrow: '\n\t\t\t\t\t<button class="slick-next" type="button">\n\t\t\t\t\t\t<span class="icons8-long-arrow-right"></span>\n\t\t\t\t\t</button>\n\t\t\t\t\t',
					responsive: [{
						breakpoint: 1260,
						settings: {
							slidesToShow: 4,
							arrows: false
						}
					}, {
						breakpoint: 1200,
						settings: {
							slidesToShow: 3,
							arrows: true
						}
					}, {
						breakpoint: 992,
						settings: {
							slidesToShow: 2
						}
					}, {
						breakpoint: 600,
						settings: {
							slidesToShow: 1
						}
					}]
				});

				$carousel.on('beforeChange', function (event, slick, currentSlide, nextSlide) {

					if (nextSlide === 0 || nextSlide === slick.slideCount - 1) {
						$nav.slick('slickGoTo', nextSlide, false);
					}
				});
			}
		})();
	}
