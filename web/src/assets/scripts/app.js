window.addEventListener('load', function() {
  const hamburgerToggle = document.getElementById('hamburger')
  const opener = document.getElementsByClassName('header--menu_opener').item(0)
  const closer = document.getElementsByClassName('mobile_sidebar--closer').item(0)

  hamburgerToggle.addEventListener('click', function(e) {
    e.preventDefault()
    hamburgerToggle.classList.toggle('is-active')
  })

  const slideout = new Slideout({
    'panel': document.getElementById('main'),
    'menu': document.getElementById('mobile_sidebar'),
    'padding': 320,
    'tolerance': 70
  })

  opener.addEventListener('click', function(e) {
    e.preventDefault()
    slideout.toggle()
  })

  closer.addEventListener('click', function(e) {
    e.preventDefault()
    hamburgerToggle.classList.remove('is-active')
    slideout.close()
  })
})
