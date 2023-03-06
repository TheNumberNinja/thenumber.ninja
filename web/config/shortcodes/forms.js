const airtable = code => {
  return `<iframe class='airtable-embed' src='https://airtable.com/embed/${code}?backgroundColor=teal' width='100%' height='533' style='background: transparent; border: 1px solid #ccc;'></iframe>`
}

module.exports = {
  airtable,
}
