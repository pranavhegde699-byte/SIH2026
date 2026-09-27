import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center text-sm text-gray-500 mb-6 flex-wrap gap-1">
      <Link to="/" className="hover:text-primary-600 transition-colors flex items-center">
        <Home size={14} className="mr-1" /> Home
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="text-gray-300 mx-1" />
          {item.to ? (
            <Link to={item.to} className="hover:text-primary-600 transition-colors font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-semibold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
