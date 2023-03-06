/** Returns services that should be displayed on /services/. */
const getServicesForList = collection => collection
    .getAll()[0].data.services
    .filter((service) => service.includeOnServicesPage)

module.exports = {
  getServicesForList
}
