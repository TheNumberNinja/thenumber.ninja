const query = `*[_type == "service" && defined(fontAwesomeSixIcon) && !(_id in path("drafts.**"))]|order(orderRank) {
    _id,
    icon,
    fontAwesomeSixIcon,
}`

const patch = function (doc) {
  return {
    set: {icon: doc.fontAwesomeSixIcon},
    unset: ['fontAwesomeSixIcon'],
  }
}

export {
  query,
  patch,
}
