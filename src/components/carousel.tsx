/**
 * carousel.tsx renders the carousel UI component that allows students to navigate 
 */

import { Carousel } from '@mantine/carousel';
import { useEffect, useState } from 'react';
import CardC from './Cards';
import { type Unit } from './Cards';
import '@mantine/carousel/styles.css';
import '@mantine/core/styles.css';
import classes from './carousel.module.css';
import axios from 'axios';
import { useUserRole } from '../context/UserContext';

// Define the carousel
// These are the categories the cards are sorted by
// The cards are sorted in when their 'unit_type' matches the unitType 'value' field
const unitTypes = [
  {
    label: 'JFLCC',
    value: 'JFLCC'
  },
  {
    label: 'JFSOC',
    value: 'Special Operations Forces'
  }
];


// CarouselC() renders all of the carousels
function CarouselC() {
  const { userSection } = useUserRole();
  const [units, setUnits] = useState<Unit[]>([]);

  // Fetch unit data from the backend endpoint
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data for section:', userSection);
        const response = await axios.get<Unit[]>('http://localhost:5000/api/sectionunits/sectionSort', {
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
  }, [userSection]);

  // Where rendering happens
  return (
    <div>
      {/* The map function makes a carousel for each unit type defined above */}
      {unitTypes.map((item) => (
        // Description for each carousel
        <div key={item.value} style={{ marginBottom: 20 }}>
          <h2>{item.label}</h2>
          {/* The Carousel is rendered here */}
          <Carousel
            classNames={{ controls: classes.controls, root: classes.root }}
              align="start"
              slideSize={100}
              slideGap='md'
              controlsOffset={0}
              controlSize={50}
              containScroll='trimSnaps'
              slidesToScroll={3}>
              
              {/* This map function maps renders all the units in it's respective carousel category*/}
              {/* Uses filterUnitsByType to only render the units whose type matches the categpry of current carousel */}
              {filterUnitsByType(item.value, units).map((unitCard, index) =>
                <Carousel.Slide key={index}>
                  <CardC unit={unitCard} />
                </Carousel.Slide>
              )} {/** End of Card Map */}
            </Carousel>
        </div>
      ))} {/** End of Carousel Map */}
    </div>
  ); // End of return statement

}

// Function to filter units by type
function filterUnitsByType(type: string, units: Unit[]): Unit[] {
  if (type === 'JFLCC') {
    return units.filter((unit) => unit.unit_type !== 'Special Operations Forces');
  } else {
    return units.filter((unit) => unit.unit_type === type);
  }
}

export default CarouselC;
