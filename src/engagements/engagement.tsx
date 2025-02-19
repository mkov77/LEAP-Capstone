/** 
 * Main for handling the engagement and its states
 * 
*/

// Tra
// TRACK: Active round in engagement
// TRACK: Current step in round

import { Table, Progress, Text, Group, Image, Stepper, Button, SegmentedControl, rem, MantineProvider, Grid, Card, Center, Select, useMantineTheme, rgba, Tooltip, Space, Container } from '@mantine/core';
import { IconHeartbeat, IconNumber1Small, IconNumber2Small, IconNumber3Small, IconNumber4Small, IconSwords } from '@tabler/icons-react';
import { useState } from 'react';
import detectionPhase from './phases/detectionPhase';
import unitSelection from './unitSelection';
import { useUnitProvider } from '../context/UnitContext';

interface engagementData {
    // Detection Phase
    w: number; // Field of view of the unit
    A: number; // Area covered by the unit (circle)
    t: number; // Time spent detecting
    P: number; // Probability of detection

    // Engagement Phase
    r: number; // Radius of the unit being attacked
    sigma: number; // Ability for a volley to hit its target
    Ph: number; // Probability of hitting target
  
    // Attacker Accuracy
    b: number; // Range of the unit
    d_r: number; // Accuracy calculation result
  
    // Damage Inflicted
    d_mi: number; // Max damage a unit can inflict
    D: number; // Final damage inflicted
  
    // Attrition Effect
    Fi: number; // Initial health
    Fn: number; // Final health
  }
  
  // Example of how to initialize a unit with values
  // Gonna need one for friendly and one for enemy
  const unitExample: engagementData = {
    w: 50, A: 100, t: 5, P: 0,
    r: 10, sigma: 5, Ph: 0,
    b: 20, d_r: 0,
    d_mi: 100, D: 0,
    Fi: 200, Fn: 200,
  };


// TO DO:
// 1. Function -- save friendly unit info (api call and then save it)
// 2. Function -- save enemy unit info (api call and then save it) 
// 3. Function -- Translate the unit info into the scores 
// 4. 

// Build dection phase
// build engagement phase
// build accuracy phase
// build AAR

function Engagement() {
    const { selectedUnit, setSelectedUnit } = useUnitProvider(); // Tracks the selected unit for an engagement
    const [active, setActive] = useState(1);
    const nextStep = () => setActive((current) => (current < 5 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    return (
        <>

            <Stepper active={active} onStepClick={setActive}>
                <Stepper.Step allowStepSelect={false} icon={<IconSwords stroke={1.5} style={{ width: rem(27), height: rem(27) }} />}>
                    Round Set Up
                    <Text>
                        Unit:
                        {selectedUnit}
                    </Text>
                    {/* {unitSelection()} */}
                </Stepper.Step>
                <Stepper.Step allowStepSelect={false} label="Detection" icon={<IconNumber1Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}>
                    Detection Phase
                    {/* {detectionPhase()} */}
                </Stepper.Step>
                <Stepper.Step allowStepSelect={false} label="Engagement" icon={<IconNumber2Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}>
                    Engagement Phase
                </Stepper.Step>
                <Stepper.Step allowStepSelect={false} label="Accuracy" icon={<IconNumber3Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}>
                    Accuracy Phase
                </Stepper.Step>
                <Stepper.Step allowStepSelect={false} icon={<IconHeartbeat stroke={1.5} style={{ width: rem(35), height: rem(35) }} />}>
                </Stepper.Step>
            </Stepper>

            <Group justify="center" mt="xl">
                <Button variant="default" onClick={prevStep}>Back</Button>
                <Button onClick={nextStep}>Next step</Button>
            </Group>
        </>
    )

}

export default Engagement
// Stepper 