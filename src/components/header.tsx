import React from 'react';
import { User, LogOut, Warehouse } from 'lucide-react';
import useWarehouses from "@/hooks/useWarehouses";
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  businessName: string;
  warehouse: string;
  user: any;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  businessName, 
  warehouse, 
  user, 
  onLogout 
}) => {
    const navigate = useNavigate()
  const { data: warehouses } = useWarehouses();

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
                    {warehouses.find((w) => w.id === warehouse)?.name || "Select Warehouse"}
                  </span>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString()}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{user.user.first_name} {user.user.last_name}</span>
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