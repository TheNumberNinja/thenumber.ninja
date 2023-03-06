const calendly = type => {
  return `<div class='calendly-inline-widget' data-url='https://calendly.com/thenumberninja/${type}'
     style='min-width:320px;height:630px;'></div>
<script type='text/javascript' src='https://assets.calendly.com/assets/external/widget.js' async></script>
`
}

module.exports = calendly
