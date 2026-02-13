export const mapBooking = (booking) => ({
    _id: booking.id,
    bookingId: booking.booking_id,
    trotroId: booking.trotro_id,
    routeId: booking.route_id,
    driverId: booking.driver_id,
    passengerId: booking.passenger_id,
    passengerName: booking.passenger_name,
    pickupStop: booking.pickup_stop,
    dropoffStop: booking.dropoff_stop,
    fare: Number(booking.fare),
    status: booking.status,
    createdAt: booking.created_at
})
