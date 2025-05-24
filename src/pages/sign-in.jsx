import React, { useState } from "react";
import {
  Input,
  Checkbox,
  Button,
  Typography,
  Alert,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import API_CONFIG from "../configs/api_config"; // Adjust path as needed

export function SignIn() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
    agreeTerms: false,
    subscribeNewsletter: false,
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (error) setError("");
  };

  // Form validation
  const validateForm = () => {
    if (!formData.email) {
      setError("Email is required");
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    
    if (!formData.agreeTerms) {
      setError("Please agree to the Terms and Conditions");
      return false;
    }
    
    return true;
  };

  // API call for login
  const loginUser = async (email, password) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Login failed');
    }

    return data;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    
    try {
      const response = await loginUser(formData.email, formData.password);
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', response.access);
      localStorage.setItem('refreshToken', response.refresh);
      localStorage.setItem('userData', JSON.stringify(response.user));
      
      // Store user preferences
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      setSuccess("Login successful! Redirecting...");
      
      // Redirect after successful login
      setTimeout(() => {
        navigate('/dashboard'); // Adjust route as needed
      }, 1500);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Sign In</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Enter your email and password to Sign In.
          </Typography>
        </div>
        
        <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleSubmit}>
          {/* Error Alert */}
          {error && (
            <Alert color="red" className="mb-4">
              {error}
            </Alert>
          )}
          
          {/* Success Alert */}
          {success && (
            <Alert color="green" className="mb-4">
              {success}
            </Alert>
          )}
          
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Your email
            </Typography>
            <Input
              size="lg"
              name="email"
              type="email"
              placeholder="name@mail.com"
              value={formData.email}
              onChange={handleInputChange}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              disabled={loading}
              required
            />
            
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Password
            </Typography>
            <Input
              type="password"
              size="lg"
              name="password"
              placeholder="********"
              value={formData.password}
              onChange={handleInputChange}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              disabled={loading}
              required
            />
          </div>
          
          <Checkbox
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleInputChange}
            disabled={loading}
            label={
              <Typography
                variant="small"
                color="gray"
                className="flex items-center justify-start font-medium"
              >
                I agree the&nbsp;
                <a
                  href="#"
                  className="font-normal text-black transition-colors hover:text-gray-900 underline"
                >
                  Terms and Conditions
                </a>
              </Typography>
            }
            containerProps={{ className: "-ml-2.5" }}
          />
          
          <Button 
            className="mt-6" 
            fullWidth 
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          <div className="flex items-center justify-between gap-2 mt-6">
            <Checkbox
              name="subscribeNewsletter"
              checked={formData.subscribeNewsletter}
              onChange={handleInputChange}
              disabled={loading}
              label={
                <Typography
                  variant="small"
                  color="gray"
                  className="flex items-center justify-start font-medium"
                >
                  Subscribe me to newsletter
                </Typography>
              }
              containerProps={{ className: "-ml-2.5" }}
            />
            <Typography variant="small" className="font-medium text-gray-900">
              <Link to="/forgot-password">
                Forgot Password
              </Link>
            </Typography>
          </div>
          
          <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
            Not registered?
            <Link to="/sign-up" className="text-gray-900 ml-1">Create account</Link>
          </Typography>
        </form>
      </div>
      
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="https://media.licdn.com/dms/image/v2/D5622AQEc5Hg3TQovRg/feedshare-shrink_800/feedshare-shrink_800/0/1731484392149?e=2147483647&v=beta&t=fIWLv5Ol-GRwidax1AEO16Z0bds8pxB4_UAiayED-jI"
          className="h-full w-full object-cover rounded-3xl"
          alt="Sign in pattern"
        />
      </div>
    </section>
  );
}

export default SignIn;