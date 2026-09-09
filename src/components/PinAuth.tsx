
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import Logo from '../assets/sahara.jpeg'
import useAuth from '@/hooks/useAuth';
import { Toaster } from 'sonner';

const PinAuth = () => {
  const [pin, setPin] = useState('');
  const {loginHandler} = useAuth()
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  
  const PIN_LENGTH = 5;

  const handleKeypadClick = (digit: string) => {
    if (pin.length < PIN_LENGTH && !isLoading) {
      setPin(prev => prev + digit);
      setError('');
    }
  };

  const handleDelete = () => {
    if (!isLoading) {
      setPin(prev => prev.slice(0, -1));
      setError('');
    }
  };

  const handleClear = () => {
    if (!isLoading) {
      setPin('');
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (pin.length !== PIN_LENGTH) return;
    
    setIsLoading(true);
    setError('');

    await loginHandler(pin)
    setPin('')
    
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      handleSubmit();
    }
  }, [pin]);

  const keypadNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const renderPinDots = () => {
    return Array.from({ length: PIN_LENGTH }, (_, index) => (
      <div
        key={index}
        className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
          index < pin.length
            ? 'bg-blue-500 border-blue-500 scale-110'
            : 'border-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
       <Toaster richColors />
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center  rounded-full mb-4">
            {/* <img src={Logo} className='h-32 w-46 -mt-8'/> */}
            {/* <Shield className="w-8 h-8 text-blue-600" /> */}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Secure Access
          </h1>
          <p className="text-gray-600">
            Enter your PIN to access the POS system
          </p>
        </div>

        {/* PIN Entry Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Success Animation */}
          {isSuccess && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 animate-pulse">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-600 font-medium">Access Granted!</p>
              <p className="text-sm text-gray-500">Redirecting to POS...</p>
            </div>
          )}

          {/* PIN Dots Display */}
          {!isSuccess && (
            <>
              <div className="flex justify-center items-center space-x-4 mb-8">
                {renderPinDots()}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center justify-center space-x-2 mb-6 text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="text-center mb-6">
                  <div className="inline-flex items-center space-x-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">Verifying...</span>
                  </div>
                </div>
              )}

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {keypadNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => handleKeypadClick(number)}
                    disabled={isLoading}
                    className="h-14 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-xl font-semibold text-lg text-gray-700 transition-all duration-150 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {number}
                  </button>
                ))}
                {/* Empty space for alignment */}
                <div></div>
                {/* Centered 0 */}
                <button
                  onClick={() => handleKeypadClick('0')}
                  disabled={isLoading}
                  className="h-14 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-xl font-semibold text-lg text-gray-700 transition-all duration-150 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  0
                </button>
                {/* Empty space for alignment */}
                <div></div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleClear}
                  disabled={isLoading || pin.length === 0}
                  className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading || pin.length === 0}
                  className="flex-1 h-12 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinAuth;
