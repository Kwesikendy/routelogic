export const mapTrip = (trip) => ({
    _id: trip.id,
    tripId: trip.trip_id,
    driverId: trip.driver_id,
    trotroId: trip.trotro_id,
    routeId: trip.route_id,
    routeName: trip.route_name,
    availableSeats: trip.available_seats,
    capacity: trip.capacity,
    fare: Number(trip.fare),
    status: trip.status
})
