import { Home, SignIn, SignUp, Booking } from "@/pages";

export const routes = [
  {
    name: "Home",
    path: "/home",
    element: <Home />,
  },
  {
    name: "Sign In",
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    name: "Sign Up",
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    name: "Booking",
    path: "/bookings",
    element: <Booking />,
  },
];

export default routes;
