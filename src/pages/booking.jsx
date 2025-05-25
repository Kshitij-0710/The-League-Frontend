import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  Typography, 
  Button, 
  Alert,
  Input,
  Badge,
  Spinner
} from '@material-tailwind/react';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import API_CONFIG from '@/configs/api_config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  console.log('Auth token:', token ? 'Present' : 'Missing'); // Debug log
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

export default function Booking() {
  // State management
  const [step, setStep] = useState(1);
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState({});
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Sports data with icons and colors
  const SPORTS = [
    { 
      value: 'badminton', 
      label: 'Badminton', 
      icon: '🏸', 
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      accent: 'text-blue-600'
    },
    { 
      value: 'squash', 
      label: 'Squash', 
      icon: '🎾', 
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      accent: 'text-green-600'
    },
    { 
      value: 'football', 
      label: 'Football', 
      icon: '⚽', 
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      accent: 'text-orange-600'
    },
    { 
      value: 'basketball', 
      label: 'Basketball', 
      icon: '🏀', 
      color: 'bg-red-50 border-red-200 hover:bg-red-100',
      accent: 'text-red-600'
    },
    { 
      value: 'cricket', 
      label: 'Cricket', 
      icon: '🏏', 
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      accent: 'text-purple-600'
    },
  ];

  const TIME_SLOTS = [
    { value: '9:00', label: '9:00 AM', period: 'morning' },
    { value: '10:00', label: '10:00 AM', period: 'morning' },
    { value: '11:00', label: '11:00 AM', period: 'morning' },
    { value: '12:00', label: '12:00 PM', period: 'afternoon' },
    { value: '13:00', label: '1:00 PM', period: 'afternoon' },
    { value: '14:00', label: '2:00 PM', period: 'afternoon' },
    { value: '15:00', label: '3:00 PM', period: 'afternoon' },
    { value: '16:00', label: '4:00 PM', period: 'afternoon' },
    { value: '17:00', label: '5:00 PM', period: 'evening' },
  ];

  // Get minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Fetch user's bookings
  const fetchMyBookings = async () => {
    if (!isAuthenticated()) {
      console.log('User not authenticated, skipping booking fetch');
      return;
    }
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}bookings/`, {
        headers: getAuthHeaders(),
      });
      
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.clear();
        console.log('Authentication failed, cleared tokens');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setMyBookings(data.results || data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  // Fetch available time slots
  const fetchAvailableSlots = async (sport, date) => {
    if (!sport || !date) return;
    
    // Check authentication first
    if (!isAuthenticated()) {
      setError('Please sign in to view available time slots');
      return;
    }
    
    setLoadingSlots(true);
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}bookings/available_timeslots/?sport=${sport}&date=${date}`,
        { headers: getAuthHeaders() }
      );
      
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.clear();
        setError('Session expired. Please sign in again.');
        // Optionally redirect to login
        // window.location.href = '/sign-in';
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to fetch available slots');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error while fetching slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Create booking
  const createBooking = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}bookings/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          sport: selectedSport,
          time_slot: selectedTimeSlot,
          booking_date: selectedDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Booking confirmed successfully!');
        setStep(4); // Go to confirmation step
        fetchMyBookings(); // Refresh bookings
        // Reset form
        setTimeout(() => {
          setSelectedSport('');
          setSelectedDate('');
          setSelectedTimeSlot('');
          setStep(1);
          setSuccess('');
        }, 3000);
      } else {
        if (data.non_field_errors) {
          setError(data.non_field_errors[0]);
        } else if (data.detail) {
          setError(data.detail);
        } else {
          setError('Booking failed. Please try again.');
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Load bookings on component mount
  useEffect(() => {
    fetchMyBookings();
  }, []);

  // Fetch slots when sport and date are selected
  useEffect(() => {
    if (selectedSport && selectedDate) {
      fetchAvailableSlots(selectedSport, selectedDate);
    }
  }, [selectedSport, selectedDate]);

  // Get selected sport details
  const selectedSportDetails = SPORTS.find(sport => sport.value === selectedSport);

  // Status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-36 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Typography variant="h2" className="font-bold text-gray-800 mb-2">
            Book Your Sports Session
          </Typography>
          <Typography variant="paragraph" className="text-gray-600">
            Reserve your preferred time slot for your favorite sport
          </Typography>
        </div>

        {/* Authentication Check */}
        {!isAuthenticated() && (
          <Alert color="amber" className="mb-6">
            <div className="flex items-center justify-between">
              <span>Please sign in to make bookings and view available time slots.</span>
              <a href="/sign-in" className="underline font-semibold">
                Sign In
              </a>
            </div>
          </Alert>
        )}

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold
                  ${step >= stepNum 
                    ? 'bg-[#EF495D] text-white' 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <ArrowRightIcon className={`w-5 h-5 mx-2 ${
                    step > stepNum ? 'text-[#EF495D]' : 'text-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error/Success Alerts */}
        {error && (
          <Alert color="red" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert color="green" className="mb-6" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardBody className="p-8">
                {/* Step 1: Sport Selection */}
                {step === 1 && (
                  <div>
                    <Typography variant="h4" className="mb-6 font-bold text-gray-800">
                      Choose Your Sport
                    </Typography>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {SPORTS.map((sport) => (
                        <div
                          key={sport.value}
                          onClick={() => setSelectedSport(sport.value)}
                          className={`
                            p-6 rounded-xl border-2 cursor-pointer transition-all duration-300
                            ${selectedSport === sport.value 
                              ? 'border-[#EF495D] bg-red-50 shadow-lg scale-105' 
                              : sport.color
                            }
                          `}
                        >
                          <div className="text-center">
                            <div className="text-4xl mb-3">{sport.icon}</div>
                            <Typography variant="h6" className={`
                              font-semibold 
                              ${selectedSport === sport.value ? 'text-[#EF495D]' : sport.accent}
                            `}>
                              {sport.label}
                            </Typography>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {selectedSport && (
                      <div className="mt-8 text-center">
                        <Button 
                          onClick={() => setStep(2)}
                          className="bg-[#EF495D] hover:bg-[#e63946] px-8 py-3"
                          size="lg"
                        >
                          Continue to Date Selection
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Date Selection */}
                {step === 2 && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <Typography variant="h4" className="font-bold text-gray-800">
                        Select Date
                      </Typography>
                      <Button 
                        variant="text" 
                        onClick={() => setStep(1)}
                        className="text-gray-600"
                      >
                        ← Back
                      </Button>
                    </div>

                    {selectedSportDetails && (
                      <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
                        <span className="text-2xl mr-3">{selectedSportDetails.icon}</span>
                        <Typography variant="h6" className="text-gray-700">
                          Selected: {selectedSportDetails.label}
                        </Typography>
                      </div>
                    )}
                    
                    <div className="max-w-md mx-auto">
                      <Input
                        type="date"
                        label="Booking Date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={getMinDate()}
                        className="!border-t-blue-gray-200 focus:!border-t-[#EF495D]"
                        labelProps={{ className: "before:content-none after:content-none" }}
                        icon={<CalendarDaysIcon className="w-5 h-5" />}
                      />
                    </div>
                    
                    {selectedDate && (
                      <div className="mt-8 text-center">
                        <Button 
                          onClick={() => setStep(3)}
                          className="bg-[#EF495D] hover:bg-[#e63946] px-8 py-3"
                          size="lg"
                        >
                          Choose Time Slot
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Time Slot Selection */}
                {step === 3 && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <Typography variant="h4" className="font-bold text-gray-800">
                        Available Time Slots
                      </Typography>
                      <Button 
                        variant="text" 
                        onClick={() => setStep(2)}
                        className="text-gray-600"
                      >
                        ← Back
                      </Button>
                    </div>

                    {/* Selected Info */}
                    <div className="flex items-center justify-between mb-8 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{selectedSportDetails?.icon}</span>
                        <div>
                          <Typography variant="h6" className="text-gray-700">
                            {selectedSportDetails?.label}
                          </Typography>
                          <Typography variant="small" className="text-gray-500">
                            {new Date(selectedDate).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </Typography>
                        </div>
                      </div>
                    </div>

                    {loadingSlots ? (
                      <div className="text-center py-8">
                        <Spinner className="h-8 w-8 text-[#EF495D]" />
                        <Typography className="mt-2 text-gray-600">
                          Loading available slots...
                        </Typography>
                      </div>
                    ) : (
                      <div>
                        {/* Morning Slots */}
                        <div className="mb-8">
                          <Typography variant="h6" className="mb-4 text-gray-700 flex items-center">
                            <ClockIcon className="w-5 h-5 mr-2" />
                            Morning (9 AM - 12 PM)
                          </Typography>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {TIME_SLOTS.filter(slot => slot.period === 'morning').map((slot) => {
                              const isAvailable = availableSlots[slot.value];
                              const isSelected = selectedTimeSlot === slot.value;
                              
                              return (
                                <button
                                  key={slot.value}
                                  onClick={() => isAvailable && setSelectedTimeSlot(slot.value)}
                                  disabled={!isAvailable}
                                  className={`
                                    p-4 rounded-lg border-2 transition-all duration-300 font-medium
                                    ${isSelected 
                                      ? 'border-[#EF495D] bg-[#EF495D] text-white shadow-lg scale-105' 
                                      : isAvailable
                                      ? 'border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:shadow-md'
                                      : 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed opacity-60'
                                    }
                                  `}
                                >
                                  <div className="text-sm">{slot.label}</div>
                                  <div className="text-xs mt-1">
                                    {isAvailable ? '✓ Available' : '✗ Booked'}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Afternoon Slots */}
                        <div className="mb-8">
                          <Typography variant="h6" className="mb-4 text-gray-700 flex items-center">
                            <ClockIcon className="w-5 h-5 mr-2" />
                            Afternoon (12 PM - 5 PM)
                          </Typography>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {TIME_SLOTS.filter(slot => slot.period === 'afternoon').map((slot) => {
                              const isAvailable = availableSlots[slot.value];
                              const isSelected = selectedTimeSlot === slot.value;
                              
                              return (
                                <button
                                  key={slot.value}
                                  onClick={() => isAvailable && setSelectedTimeSlot(slot.value)}
                                  disabled={!isAvailable}
                                  className={`
                                    p-4 rounded-lg border-2 transition-all duration-300 font-medium
                                    ${isSelected 
                                      ? 'border-[#EF495D] bg-[#EF495D] text-white shadow-lg scale-105' 
                                      : isAvailable
                                      ? 'border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:shadow-md'
                                      : 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed opacity-60'
                                    }
                                  `}
                                >
                                  <div className="text-sm">{slot.label}</div>
                                  <div className="text-xs mt-1">
                                    {isAvailable ? '✓ Available' : '✗ Booked'}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Evening Slots */}
                        <div className="mb-8">
                          <Typography variant="h6" className="mb-4 text-gray-700 flex items-center">
                            <ClockIcon className="w-5 h-5 mr-2" />
                            Evening (5 PM onwards)
                          </Typography>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {TIME_SLOTS.filter(slot => slot.period === 'evening').map((slot) => {
                              const isAvailable = availableSlots[slot.value];
                              const isSelected = selectedTimeSlot === slot.value;
                              
                              return (
                                <button
                                  key={slot.value}
                                  onClick={() => isAvailable && setSelectedTimeSlot(slot.value)}
                                  disabled={!isAvailable}
                                  className={`
                                    p-4 rounded-lg border-2 transition-all duration-300 font-medium
                                    ${isSelected 
                                      ? 'border-[#EF495D] bg-[#EF495D] text-white shadow-lg scale-105' 
                                      : isAvailable
                                      ? 'border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:shadow-md'
                                      : 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed opacity-60'
                                    }
                                  `}
                                >
                                  <div className="text-sm">{slot.label}</div>
                                  <div className="text-xs mt-1">
                                    {isAvailable ? '✓ Available' : '✗ Booked'}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {selectedTimeSlot && (
                          <div className="text-center">
                            <Button 
                              onClick={createBooking}
                              disabled={loading}
                              className="bg-[#EF495D] hover:bg-[#e63946] px-8 py-3"
                              size="lg"
                            >
                              {loading ? (
                                <>
                                  <Spinner className="h-4 w-4 mr-2" />
                                  Confirming...
                                </>
                              ) : (
                                'Confirm Booking'
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Confirmation */}
                {step === 4 && (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <Typography variant="h4" className="font-bold text-gray-800 mb-2">
                      Booking Confirmed!
                    </Typography>
                    <Typography className="text-gray-600 mb-6">
                      Your sports session has been successfully booked.
                    </Typography>
                    
                    <div className="bg-gray-50 rounded-lg p-6 mb-6 max-w-md mx-auto">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Sport:</span>
                          <span>{selectedSportDetails?.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Date:</span>
                          <span>{new Date(selectedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Time:</span>
                          <span>{TIME_SLOTS.find(s => s.value === selectedTimeSlot)?.label}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setStep(1);
                        setSelectedSport('');
                        setSelectedDate('');
                        setSelectedTimeSlot('');
                        setSuccess('');
                      }}
                      className="bg-[#EF495D] hover:bg-[#e63946]"
                    >
                      Book Another Session
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* My Bookings Sidebar */}
          <div>
            <Card className="shadow-xl border-0">
              <CardBody className="p-6">
                <Typography variant="h5" className="font-bold text-gray-800 mb-4">
                  My Bookings
                </Typography>
                
                {myBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <PlayIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <Typography className="text-gray-500">
                      No bookings yet
                    </Typography>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <Typography variant="h6" className="font-semibold">
                            {booking.sport_display}
                          </Typography>
                          <Badge color={getStatusColor(booking.status)} className="capitalize">
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <CalendarDaysIcon className="w-4 h-4 mr-2" />
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-2" />
                            {booking.time_slot_display}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {myBookings.length > 5 && (
                      <Typography variant="small" className="text-center text-gray-500">
                        ... and {myBookings.length - 5} more
                      </Typography>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}