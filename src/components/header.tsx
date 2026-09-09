import React, { useState, useEffect } from 'react';
import { User, LogOut, Warehouse, Calendar } from 'lucide-react';
import useWarehouses from "@/hooks/useWarehouses";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

interface HeaderProps {
  businessName: string;
  warehouse: string;
  user: any;
  onLogout: () => void;
  saleDate?: Date;
  onSaleDateChange?: (date: Date) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  businessName, 
  warehouse, 
  user, 
  onLogout,
  saleDate: propSaleDate,
  onSaleDateChange
}) => {
  const navigate = useNavigate();
  const { data: warehouses } = useWarehouses();
  const [saleDate, setSaleDate] = useState<Date>(propSaleDate || new Date());

  // Update local state when prop changes
  useEffect(() => {
    if (propSaleDate) {
      setSaleDate(propSaleDate);
    }
  }, [propSaleDate]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSaleDate(date);
      if (onSaleDateChange) {
        onSaleDateChange(date);
      }
    }
  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy");
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">POS</h1>
              <p className="text-sm text-gray-500">{businessName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-2xl mx-8 flex items-left space-x-4">
              <span className='hover:text-teal-500 hover:underline cursor-pointer' onClick={() => navigate('/recent-sales')}>View recent sales</span>
              <span className='hover:text-teal-500 hover:underline cursor-pointer' onClick={()=> navigate('/credit-sales')}>View credit sales</span>    
              <div className="flex items-center space-x-4">
                <Warehouse className="w-5 h-5 text-gray-500" /> 
                {warehouse && (
                  <span className="text-sm text-gray-700 font-medium">
                    {warehouses?.find((w) => w.id === warehouse)?.name || "Select Warehouse"}
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="h-8 px-3 text-sm font-normal border-gray-200 hover:bg-gray-50"
                  >
                    {formatDate(saleDate)}
                    {isToday(saleDate) && (
                      <span className="ml-1 text-xs text-teal-600 font-medium">(Today)</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={saleDate}
                    onSelect={handleDateChange}
                    initialFocus
                    className="rounded-md border-0"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{user?.user?.first_name} {user?.user?.last_name}</span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};