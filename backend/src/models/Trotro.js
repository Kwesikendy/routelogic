export const mapTrotro = (trotro) => ({
    trotroId: trotro.trotro_id,
    routeId: trotro.route_id,
    status: trotro.status,
    capacity: trotro.capacity,
    availableSeats: trotro.available_seats,
    fare: Number(trotro.fare),
    batteryLevel: trotro.battery_level,
    location: trotro.location
})
