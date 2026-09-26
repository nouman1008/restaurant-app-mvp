/**
 * @type {{
 *   id: string,
 *   fullName: string,
 *   email: string,
 *   password: string,
 *   role: "customer" | "manager"
 * }[]}
 */
const users = [
  {
    id: "U001",
    fullName: "Nouman Customer",
    email: "customer@restaurant.com",
    password: "Customer123",
    role: "customer",
  },
  {
    id: "U002",
    fullName: "Restaurant Manager",
    email: "manager@restaurant.com",
    password: "Manager123",
    role: "manager",
  },
];

export default users;
