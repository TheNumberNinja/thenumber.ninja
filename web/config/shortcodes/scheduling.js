const trafft = uuid => {
  return `<iframe 
    src="https://bookings.thenumber.ninja/booking-embedded?t=s&uuid=${uuid}" 
    style="border: none; width: 100%; max-width:1200px; min-height: 655px; margin: 0 auto; display: block;">
  </iframe>`
}

module.exports = {
  trafft,
}
