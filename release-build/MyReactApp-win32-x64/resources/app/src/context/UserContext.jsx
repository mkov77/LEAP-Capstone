import React, { createContext, useContext, useState } from 'react';

// Create a context
const UserRoleContext = createContext();

// Create a provider component
export const UserRoleProvider = ({ children }) => {
  const [userRole, setUserRole] = useState('Student'); // Default role can be 'guest'
  const [userSection, setUserSection] = useState('');
  return (
    <UserRoleContext.Provider value={{ userRole, setUserRole, userSection, setUserSection }}>
      {children}
    </UserRoleContext.Provider>
  );
};

// Create a hook to use the UserRoleContext
export const useUserRole = () => {
  return useContext(UserRoleContext);
};
