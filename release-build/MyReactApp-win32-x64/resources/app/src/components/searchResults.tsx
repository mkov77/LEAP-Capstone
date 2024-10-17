/**
 * This file defines the `SearchResultList` component which fetches a list of units from an API
 * and displays them filtered based on a search term. It uses the `GridC` component to render each
 * filtered unit.
 */
import React, { useState, useEffect } from 'react';
import { GridC } from './Cards'; // Import your Card component
import axios from 'axios';
import { Unit } from '../components/Cards';
import { useUserRole } from '../context/UserContext';

interface Props {
  search: string;
}

const SearchResultList: React.FC<Props> = (props) => {
  const { userSection } = useUserRole();

  const [units, setUnits] = useState<Unit[]>([]);

  // Function to fetch unit data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<Unit[]>('http://localhost:5000/api/units/sectionSort', {
          params: {
            sectionid: userSection  // Pass userSection as a query parameter
          }
        });
        setUnits(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const { search } = props;

  // Filter units based on search term
  const filteredUnits = units.filter(unit =>
    unit.unit_id.toLowerCase().includes(search.toLowerCase())
  );

  // Render search
  return (
    <div style={{marginTop: 25}}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {/* Pass array of units to the GridC component */}
        {filteredUnits.map(unitResult => (

          <GridC key={unitResult.unit_id} units={[unitResult]} /> // Pass array of units

        ))}
      </div>
    </div>
  );
};

export default SearchResultList;
