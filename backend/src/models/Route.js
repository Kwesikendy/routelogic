export const mapRoute = (route) => ({
    _id: route.id,
    routeId: route.id,
    routeName: route.route_name,
    name: route.route_name,
    pickup: route.pickup,
    destination: route.destination,
    distance: Number(route.distance),
    baseFare: Number(route.base_fare),
    coordinates: route.coordinates || [],
    stops: route.stops || []
})
