export const mapUser = (user) => ({
    _id: user.id,
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role
})
