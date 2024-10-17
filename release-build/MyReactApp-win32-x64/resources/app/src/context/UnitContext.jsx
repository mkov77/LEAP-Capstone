import React, { createContext, useContext, useState } from 'react';

// Create a context
const UnitContext = createContext();

// Create a provider component
export const UnitProvider = ({ children }) => {
  const [selectedUnit, setSelectedUnit] = useState(null); // Default role can be 'guest'
  return (
    <UnitContext.Provider value={{ selectedUnit, setSelectedUnit  }}>
      {children}
    </UnitContext.Provider>
  );
};

// Create a hook to use the UserRoleContext
export const useUnitProvider = () => {
  return useContext(UnitContext);
};
