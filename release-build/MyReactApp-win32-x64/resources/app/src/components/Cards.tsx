/**
 *  Card.tsx renders a card UI component that displays a unit's information
 */


import { Card, Image, Text, Grid, HoverCard } from '@mantine/core';
import classes from './Cards.module.css'
import { useUnitProvider } from '../context/UnitContext';
import { useNavigate, useParams } from 'react-router-dom';
import ImageLoader from '../context/imageLoader';


interface images {

}

// Define Unit interface
export interface Unit {
  unit_id: string;
  unit_type: string;
  isFriendly: boolean;
  unit_health: number;
  role_type: string;
  unit_size: string;
  force_posture: string;
  force_mobility: string;
  force_readiness: string;
  force_skill: string;
  children: string[];
  id: number;
  root: boolean
}

// Define Card interface
interface CardProps {
  unit: Unit;
}


// CardC renders the card
function CardC({ unit }: CardProps) {
  const { unit_id, unit_type, unit_health, isFriendly, role_type, unit_size, force_posture, force_mobility, force_readiness, force_skill } = unit;
  const { selectedUnit, setSelectedUnit } = useUnitProvider();
  const navigate = useNavigate();

  
  // Initalize health bar color to green
  let healthColor = 'green';

  // Change color of health bar based on unit's health
  if (unit_health >= 75) {
    healthColor = '#6aa84f';
  } else if (unit_health < 75 && unit_health >= 50) {
    healthColor = '#f1c232';
  } else if (unit_health < 50 && unit_health >= 25) {
    healthColor = '#e69138';
  } else {
    healthColor = '#cc0000';
  }

  // Return is where the card actually get's rendered
  return (
    // Hovercard tag allows user to see detailed information about the unit when they hover over it's card
    <HoverCard width={280} shadow="md" openDelay={750}>
      <HoverCard.Target>
        {/* Here is where the card itself is programmed */}
        <Card
          shadow={unit_id === selectedUnit ? '0' : 'lg'}
          padding={0}
          radius={0}

          // User can only select card for battle if it's health is above 0
          // When user selects card once, the card becomes select
          // If the user clicks an already selected card, the user starts an engagement
          onClick={() => {
            if (unit_health > 0) {
              if (selectedUnit === unit_id) {
                navigate('/battlePage');
              } else {
                setSelectedUnit(unit_id);
              }
            }
          }}
          style={{
            cursor: unit_health > 0 ? 'pointer' : 'not-allowed',
            backgroundColor: selectedUnit === unit_id ? 'rgba(128, 128, 128, 0.5)' : '',
            display: 'inline-block',
            width: '250px',
            margin: '0'
          }}
          className='highlightable-card'
        >
          {/* This is the content that shows up on the card */}
          <Grid style={{ margin: 0 }}>
            {/* This is the left side of the card to include health bar and its background */}
            <Grid.Col span={1} style={{ backgroundColor: 'black', position: 'relative', padding: 0 }}>
              {/* The highly desirable health bar */}
              <div className={classes.bar} style={{ height: `${unit_health}%`, width: '100%', backgroundColor: healthColor }} />
            </Grid.Col>

            {/* The right side of the card */}
            <Grid.Col span={11} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 20px' }}>
              {/* The unit symbol image */}
              <Card.Section inheritPadding={true} style={{ marginRight: '10px' }}>
                <ImageLoader unitType={unit_type} isFriendly={isFriendly} />
              </Card.Section>
              {/* Display the unit name */}
              <Card.Section>
                <Text size="lg" c="dimmed" style={{ textAlign: 'center', marginRight: '10px', fontWeight: 'bold', color: 'white' }}>
                  {unit_id}
                </Text>
              </Card.Section>
            </Grid.Col>
          </Grid>
        </Card>
        {/* End of card code */}
      </HoverCard.Target>
      {/* What will be displayed on the hovercard */}
      <HoverCard.Dropdown>
        <Text size="sm">
          <strong>Unit ID:</strong> {unit_id}<br />
          <strong>Type:</strong> {unit_type}<br />
          <strong>Friendly:</strong> {isFriendly ? 'Yes' : 'No'}<br />
          <strong>Health:</strong> {unit_health}<br />
          <strong>Role Type:</strong> {role_type}<br />
          <strong>Unit Size:</strong> {unit_size}<br />
          <strong>Force Posture:</strong> {force_posture}<br />
          <strong>Force Mobility:</strong> {force_mobility}<br />
          <strong>Force Readiness:</strong> {force_readiness}<br />
          <strong>Force Skill:</strong> {force_skill}<br />
        </Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

// GridC retrieves each unit card
// This is only used in searchResults.tsx
export function GridC({ units }: { units: Unit[] }) {
  return (
    <>
      {/* Map all of the cards */}
      {units.map((unit, index) => (
        <CardC key={index} unit={unit} />
      ))}
    </>
  );
}

export default CardC;
