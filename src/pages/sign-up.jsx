import React, { useState } from "react";
import {
  Input,
  Checkbox,
  Button,
  Typography,
  Alert,
  Select,
  Option,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import API_CONFIG from "../configs/api_config"; // Adjust path as needed

export function SignUp() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    mobile: "",
    branch: "",
    course: "",
    password: "",
    password2: "",
    agreeTerms: false,
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Choices from Django model
  const BRANCH_CHOICES = [
    { value: 'CSE', label: 'Computer Science Engineering' },
    { value: 'AIML', label: 'Artificial Intelligence and Machine Learning' },
    { value: 'DS', label: 'Data Science' },
    { value: 'CS', label: 'Cyber Security' },
    { value: 'IT', label: 'Information Technology' },
  ];

  const COURSE_CHOICES = [
    { value: 'BTECH', label: 'Bachelor of Technology' },
    { value: 'BBA', label: 'Bachelor of Business Administration' },
    { value: 'BARCH', label: 'Bachelor of Architecture' },
    { value: 'BA', label: 'Bachelor of Arts' },
    { value: 'BDES', label: 'Bachelor of Design' },
    { value: 'LLB', label: 'Bachelor of Laws' },
    { value: 'MBA', label: 'Master of Business Administration' },
  ];

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

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError("");
  };

  // Form validation
  const validateForm = () => {
    // Required field validation
    const requiredFields = ['username', 'email', 'full_name', 'mobile', 'branch', 'course', 'password', 'password2'];
    
    for (let field of requiredFields) {
      if (!formData[field]) {
        const fieldName = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        setError(`${fieldName} is required`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Mobile validation (basic)
    const mobileRegex = /^[0-9]{10,15}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setError("Please enter a valid mobile number (10-15 digits)");
      return false;
    }

    // Password validation
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    // Password confirmation
    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      return false;
    }

    // Terms agreement
    if (!formData.agreeTerms) {
      setError("Please agree to the Terms and Conditions");
      return false;
    }
    
    return true;
  };

  // API call for registration
  const registerUser = async (userData) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle validation errors from Django
      if (data.username) {
        throw new Error(`Username: ${data.username[0]}`);
      }
      if (data.email) {
        throw new Error(`Email: ${data.email[0]}`);
      }
      if (data.password) {
        throw new Error(`Password: ${data.password[0]}`);
      }
      if (data.non_field_errors) {
        throw new Error(data.non_field_errors[0]);
      }
      throw new Error('Registration failed. Please check your information.');
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
      const userData = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        mobile: formData.mobile,
        branch: formData.branch,
        course: formData.course,
        password: formData.password,
        password2: formData.password2,
      };

      const response = await registerUser(userData);
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', response.access);
      localStorage.setItem('refreshToken', response.refresh);
      localStorage.setItem('userData', JSON.stringify(response.user));
      
      setSuccess("Registration successful! Redirecting...");
      
      // Redirect after successful registration
      setTimeout(() => {
        navigate('/dashboard'); // Adjust route as needed
      }, 1500);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign Up (placeholder)
  const handleGoogleSignUp = () => {
    setError("Google Sign Up not implemented yet");
  };

  // Handle Twitter Sign Up (placeholder)
  const handleTwitterSignUp = () => {
    setError("Twitter Sign Up not implemented yet");
  };

  return (
    <section className="m-8 flex">
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
          alt="Sign up pattern"
        />
      </div>
      
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Join Us Today</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Enter your details to create your account.
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
            {/* Username */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Username
              </Typography>
              <Input
                size="lg"
                name="username"
                placeholder="johndoe123"
                value={formData.username}
                onChange={handleInputChange}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                disabled={loading}
                required
              />
            </div>

            {/* Full Name */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Full Name
              </Typography>
              <Input
                size="lg"
                name="full_name"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={handleInputChange}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                disabled={loading}
                required
              />
            </div>

            {/* Email */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Email Address
              </Typography>
              <Input
                size="lg"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                disabled={loading}
                required
              />
            </div>

            {/* Mobile */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Mobile Number
              </Typography>
              <Input
                size="lg"
                name="mobile"
                type="tel"
                placeholder="1234567890"
                value={formData.mobile}
                onChange={handleInputChange}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                disabled={loading}
                required
              />
            </div>

            {/* Course */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Course
              </Typography>
              <Select
                size="lg"
                value={formData.course}
                onChange={(value) => handleSelectChange('course', value)}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                disabled={loading}
                required
              >
                {COURSE_CHOICES.map((course) => (
                  <Option key={course.value} value={course.value}>
                    {course.label}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Branch */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Branch
              </Typography>
              <Select
                size="lg"
                value={formData.branch}
                onChange={(value) => handleSelectChange('branch', value)}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                disabled={loading}
                required
              >
                {BRANCH_CHOICES.map((branch) => (
                  <Option key={branch.value} value={branch.value}>
                    {branch.label}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Password */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
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

            {/* Confirm Password */}
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Confirm Password
              </Typography>
              <Input
                type="password"
                size="lg"
                name="password2"
                placeholder="********"
                value={formData.password2}
                onChange={handleInputChange}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                disabled={loading}
                required
              />
            </div>
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
                I agree to the&nbsp;
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
            {loading ? "Creating Account..." : "Register Now"}
          </Button>

          <div className="space-y-4 mt-8">
            <Button 
              size="lg" 
              color="white" 
              className="flex items-center gap-2 justify-center shadow-md" 
              fullWidth
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
            >
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1156_824)">
                  <path d="M16.3442 8.18429C16.3442 7.64047 16.3001 7.09371 16.206 6.55872H8.66016V9.63937H12.9813C12.802 10.6329 12.2258 11.5119 11.3822 12.0704V14.0693H13.9602C15.4741 12.6759 16.3442 10.6182 16.3442 8.18429Z" fill="#4285F4" />
                  <path d="M8.65974 16.0006C10.8174 16.0006 12.637 15.2922 13.9627 14.0693L11.3847 12.0704C10.6675 12.5584 9.7415 12.8347 8.66268 12.8347C6.5756 12.8347 4.80598 11.4266 4.17104 9.53357H1.51074V11.5942C2.86882 14.2956 5.63494 16.0006 8.65974 16.0006Z" fill="#34A853" />
                  <path d="M4.16852 9.53356C3.83341 8.53999 3.83341 7.46411 4.16852 6.47054V4.40991H1.51116C0.376489 6.67043 0.376489 9.33367 1.51116 11.5942L4.16852 9.53356Z" fill="#FBBC04" />
                  <path d="M8.65974 3.16644C9.80029 3.1488 10.9026 3.57798 11.7286 4.36578L14.0127 2.08174C12.5664 0.72367 10.6469 -0.0229773 8.65974 0.000539111C5.63494 0.000539111 2.86882 1.70548 1.51074 4.40987L4.1681 6.4705C4.8001 4.57449 6.57266 3.16644 8.65974 3.16644Z" fill="#EA4335" />
                </g>
                <defs>
                  <clipPath id="clip0_1156_824">
                    <rect width="16" height="16" fill="white" transform="translate(0.5)" />
                  </clipPath>
                </defs>
              </svg>
              <span>Sign up With Google</span>
            </Button>
            
            <Button 
              size="lg" 
              color="white" 
              className="flex items-center gap-2 justify-center shadow-md" 
              fullWidth
              type="button"
              onClick={handleTwitterSignUp}
              disabled={loading}
            >
              <img src="/img/twitter-logo.svg" height={24} width={24} alt="" />
              <span>Sign up With Twitter</span>
            </Button>
          </div>
          
          <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
            Already have an account?
            <Link to="/sign-in" className="text-gray-900 ml-1">Sign in</Link>
          </Typography>
        </form>
      </div>
    </section>
  );
}

export default SignUp;