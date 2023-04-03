// hamburger toggler
const hamburgerToggle = document.getElementById('hamburger')
hamburgerToggle.addEventListener('click', function(e) {
  e.preventDefault()
  hamburgerToggle.classList.toggle('is-active')
})

// slideout menu
if (window.innerWidth <= 992) {
  const slideout = new Slideout({
    'panel': document.getElementById('main'),
    'menu': document.getElementById('mobile_sidebar'),
    'padding': 320,
    'tolerance': 70
  })

  const opener = document.getElementsByClassName('header--menu_opener').item(0)
  const closer = document.getElementsByClassName('mobile_sidebar--closer').item(0)

  opener.addEventListener('click', function(e) {
    slideout.toggle()
    e.preventDefault()
  })

  closer.addEventListener('click', function(e) {
    e.preventDefault()
    hamburgerToggle.classList.remove('is-active')
    slideout.close()
  })
}
