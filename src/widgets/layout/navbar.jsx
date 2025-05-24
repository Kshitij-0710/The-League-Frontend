import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  Navbar as MTNavbar,
  MobileNav,
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export function Navbar({ brandName, routes, action }) {
  const [openNav, setOpenNav] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => window.innerWidth >= 960 && setOpenNav(false);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 text-inherit lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-8">
      {routes.map(({ name, path, icon, href, target }) => (
        <Typography
          key={name}
          as="li"
          variant="small"
          color="inherit"
          className="capitalize"
        >
          {href ? (
            <a
              href={href}
              target={target}
              className="group relative flex items-center gap-2 p-3 font-medium transition-all duration-300 hover:text-[#EF495D] lg:p-2"
            >
              {icon &&
                React.createElement(icon, {
                  className: "w-5 h-5 opacity-75 transition-all duration-300 group-hover:opacity-100",
                })}
              <span className="relative">
                {name}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#EF495D] transition-all duration-300 group-hover:w-full"></span>
              </span>
            </a>
          ) : (
            <Link
              to={path}
              target={target}
              className="group relative flex items-center gap-2 p-3 font-medium transition-all duration-300 hover:text-[#EF495D] lg:p-2"
            >
              {icon &&
                React.createElement(icon, {
                  className: "w-5 h-5 opacity-75 transition-all duration-300 group-hover:opacity-100",
                })}
              <span className="relative">
                {name}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#EF495D] transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
          )}
        </Typography>
      ))}
    </ul>
  );

  return (
    <MTNavbar 
      color="transparent" 
      className={`fixed top-0 z-50 border-none p-0 transition-all duration-300 ${
        scrolled 
          ? "bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200" 
          : "bg-transparent"
      }`}
      fullWidth
    >
      <div className={`container mx-auto flex items-center justify-between px-6 py-4 transition-colors duration-300 ${
        scrolled ? "text-gray-800" : "text-white"
      }`}>
        <Link to="/" className="group">
          <Typography className={`cursor-pointer py-2 text-2xl font-bold transition-all duration-300 group-hover:text-[#EF495D] ${
            scrolled ? "text-[#EF495D]" : "text-white"
          }`}>
            {brandName}
          </Typography>
        </Link>
        
        <div className="hidden lg:block">{navList}</div>
        
        <div className="hidden gap-4 lg:flex">
          {React.cloneElement(action, {
            className: "hidden lg:inline-block bg-[#EF495D] hover:bg-[#e63946] transition-all duration-300 hover:shadow-lg border-none",
          })}
        </div>
        
        <IconButton
          variant="text"
          size="lg"
          className={`group ml-auto transition-all duration-300 hover:bg-[#EF495D]/10 focus:bg-[#EF495D]/10 lg:hidden ${
            scrolled ? "text-gray-800 hover:text-[#EF495D]" : "text-white hover:text-[#EF495D]"
          }`}
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon strokeWidth={2} className="h-6 w-6 transition-transform duration-300" />
          ) : (
            <Bars3Icon strokeWidth={2} className="h-6 w-6 transition-transform duration-300" />
          )}
        </IconButton>
      </div>
      
      <MobileNav
        className="rounded-xl bg-white/95 backdrop-blur-sm px-6 pt-4 pb-6 text-gray-800 shadow-xl border border-gray-200"
        open={openNav}
      >
        <div className="container mx-auto">
          <div className="mb-4 h-px bg-gray-200"></div>
          {navList}
          <div className="mt-6">
            {React.cloneElement(action, {
              className: "w-full block bg-[#EF495D] hover:bg-[#e63946] transition-all duration-300 hover:shadow-lg border-none",
            })}
          </div>
        </div>
      </MobileNav>
    </MTNavbar>
  );
}

Navbar.defaultProps = {
  brandName: "The League",
  action: (
    <a
      href="https://www.creative-tim.com/product/material-tailwind-kit-react"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Button 
        variant="filled" 
        size="sm" 
        fullWidth
        className="font-medium"
      >
        Sports Shop
      </Button>
    </a>
  ),
};

Navbar.propTypes = {
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
  action: PropTypes.node,
};

Navbar.displayName = "/src/widgets/layout/navbar.jsx";

export default Navbar;