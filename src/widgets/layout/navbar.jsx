import React from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import {
  Navbar as MTNavbar,
  MobileNav,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import { 
  Bars3Icon, 
  XMarkIcon, 
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export function Navbar({ brandName, routes, action }) {
  const [openNav, setOpenNav] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleResize = () => window.innerWidth >= 960 && setOpenNav(false);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    
    // Get user data from localStorage
    const checkUserAuth = () => {
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Clear invalid data
          localStorage.removeItem('userData');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } else {
        setUser(null);
      }
    };

    // Check authentication on mount
    checkUserAuth();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkUserAuth();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Logout function
  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('rememberMe');
    
    // Update state
    setUser(null);
    
    // Redirect to home page
    navigate('/');
  };

  // Filter routes based on authentication status
  const filteredRoutes = routes.filter(route => {
    if (user) {
      // When logged in, only show home and booking
      return route.name.toLowerCase() === 'home' || route.name.toLowerCase() === 'booking';
    } else {
      // When not logged in, show home, sign in, and sign up
      return route.name.toLowerCase() === 'home' || 
             route.name.toLowerCase() === 'sign in' || 
             route.name.toLowerCase() === 'sign up';
    }
  });

  const navList = (
    <ul className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-12">
      {filteredRoutes.map(({ name, path, icon, href, target }) => (
        <Typography
          key={name}
          as="li"
          variant="small"
          className="font-medium text-white/80 hover:text-white transition-colors duration-200"
        >
          {href ? (
            <a
              href={href}
              target={target}
              className="group relative flex items-center gap-2 py-3 px-1 lg:py-2 lg:px-3 rounded-lg hover:bg-white/5 transition-all duration-200"
            >
              {icon &&
                React.createElement(icon, {
                  className: "w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity duration-200",
                })}
              <span className="text-sm lg:text-base tracking-wide">
                {name}
              </span>
            </a>
          ) : (
            <Link
              to={path}
              target={target}
              className="group relative flex items-center gap-2 py-3 px-1 lg:py-2 lg:px-3 rounded-lg hover:bg-white/5 transition-all duration-200"
            >
              {icon &&
                React.createElement(icon, {
                  className: "w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity duration-200",
                })}
              <span className="text-sm lg:text-base tracking-wide">
                {name}
              </span>
            </Link>
          )}
        </Typography>
      ))}
    </ul>
  );

  return (
    <MTNavbar 
      className={`fixed top-0 left-0 right-0 z-50 border-none p-0 w-full max-w-none transition-all duration-500 ${
        scrolled 
          ? "bg-black/80 backdrop-blur-md shadow-2xl border-b border-white/5" 
          : "bg-black/60 backdrop-blur-sm"
      }`}
      fullWidth
    >
      {/* Main Navigation Container */}
      <div className="w-full max-w-screen-2xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Brand Logo */}
        <Link to="/" className="group flex-shrink-0">
          <Typography className="text-xl lg:text-2xl font-bold text-white tracking-tight group-hover:text-[#EF495D] transition-colors duration-300">
            {brandName}
          </Typography>
        </Link>
        
        {/* Centered Navigation - Desktop Only */}
        <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2">
          {navList}
        </div>
        
        {/* Right Side Actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {user ? (
            <Menu>
              <MenuHandler>
                <div className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-white/10 transition-all duration-300">
                  <Avatar
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username)}&background=EF495D&color=ffffff&size=32`}
                    alt={user.full_name || user.username}
                    size="sm"
                    className="border-2 border-[#EF495D] shadow-lg"
                  />
                  <div className="text-left hidden lg:block">
                    <Typography variant="small" className="font-medium text-white text-sm">
                      {user.full_name || user.username}
                    </Typography>
                    <Typography variant="small" className="text-xs text-white/60">
                      {user.email}
                    </Typography>
                  </div>
                </div>
              </MenuHandler>
              <MenuList className="p-1 bg-black/95 backdrop-blur-lg border border-white/10 shadow-2xl rounded-xl">
                <MenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-all duration-200 text-red-400 hover:text-red-300"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <Typography variant="small" className="font-medium">
                    Logout
                  </Typography>
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <div className="hidden lg:block">
              {React.cloneElement(action, {
                className: "bg-[#EF495D] hover:bg-[#e63946] text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 border-none",
              })}
            </div>
          )}
          
          {/* Mobile Menu Button */}
          <IconButton
            variant="text"
            size="lg"
            className="lg:hidden text-white hover:bg-white/10 focus:bg-white/10 rounded-xl transition-all duration-300"
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? (
              <XMarkIcon strokeWidth={2} className="h-5 w-5" />
            ) : (
              <Bars3Icon strokeWidth={2} className="h-5 w-5" />
            )}
          </IconButton>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav
        className="bg-black/95 backdrop-blur-lg px-4 pt-4 pb-6 text-white shadow-2xl border-b border-white/10 rounded-none"
        open={openNav}
      >
        <div className="w-full space-y-6">
          
          {/* Mobile Navigation List */}
          <div className="flex flex-col items-center space-y-2">
            {navList}
          </div>
          
          {/* Mobile User Section */}
          <div className="border-t border-white/10 pt-6">
            {user ? (
              <div className="space-y-4">
                {/* User Info Card */}
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                  <Avatar
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username)}&background=EF495D&color=ffffff&size=40`}
                    alt={user.full_name || user.username}
                    size="md"
                    className="border-2 border-[#EF495D] shadow-lg"
                  />
                  <div className="flex-1">
                    <Typography variant="small" className="font-medium text-white">
                      {user.full_name || user.username}
                    </Typography>
                    <Typography variant="small" className="text-white/60 text-xs">
                      {user.email}
                    </Typography>
                  </div>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-all duration-200 text-red-400 hover:text-red-300"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <Typography variant="small" className="font-medium">
                    Logout
                  </Typography>
                </button>
              </div>
            ) : (
              <div className="text-center">
                {React.cloneElement(action, {
                  className: "w-full bg-[#EF495D] hover:bg-[#e63946] text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:shadow-lg border-none",
                })}
              </div>
            )}
          </div>
        </div>
      </MobileNav>
    </MTNavbar>
  );
}

Navbar.defaultProps = {
  brandName: "The League",
  action: (
    <Link to="/sign-in">
      <Button 
        variant="filled" 
        size="sm" 
        className="font-medium"
      >
        Sign In
      </Button>
    </Link>
  ),
};

Navbar.propTypes = {
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
  action: PropTypes.node,
};

Navbar.displayName = "/src/widgets/layout/navbar.jsx";

export default Navbar;