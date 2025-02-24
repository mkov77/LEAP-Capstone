import React, { useEffect, useState } from 'react';
import { Stepper, Button, Text, Group, rem, Grid, SegmentedControl } from '@mantine/core';
import { IconHeartbeat, IconSwords, IconNumber1Small, IconNumber2Small, IconNumber3Small } from '@tabler/icons-react';
import { useUnitProvider } from '../context/UnitContext';
import { useUserRole } from '../context/UserContext';
import axios from 'axios';
import UnitSelection from './unitSelection';

/**
 * EngagementData:
 * This interface defines various properties used to calculate how
 * a friendly or enemy unit interacts in an engagement scenario.
 */
interface EngagementData {
  w: number;     // Field of view
  A: number;     // Area covered
  t: number;     // Time spent detecting
  P: number;     // Probability of detection
  r: number;     // Radius of attack
  sigma: number; // Accuracy factor
  Ph: number;    // Probability of hitting a target
  b: number;     // Range
  d_r: number;   // Accuracy result
  d_mi: number;  // Maximum damage inflicted
  D: number;     // Final damage inflicted
  Fi: number;    // Initial health
  Fn: number;    // Final health after engagement
}

/**
 * Unit:
 * Represents a single unit, which can be a friendly or enemy entity.
 */
interface Unit {
  unit_id: number;
  unit_name: string;
  unit_type: string;
  unit_health: number;
  unit_size: string;
  unit_mobility: string;
}

/**
 * initializeUnit:
 * Takes a Unit object (or null) and returns an EngagementData object
 * with default calculations. If no unit is provided, all values are zero.
 */
const initializeUnit = (unit: Unit | null): EngagementData => {
  // If there is no unit, return zeroed-out engagement data
  if (!unit) {
    return {
      w: 0, A: 0, t: 0, P: 0, r: 0, sigma: 0, Ph: 0, b: 0, d_r: 0, d_mi: 0, D: 0, Fi: 0, Fn: 0,
    };
  }

  // Default calculations for demonstration:
  // These are basic formulas for detection probability, damage, etc.
  const w = 10;
  const A = Math.PI * Math.pow(15, 2);
  const t = 5;
  const P = 1 - Math.exp((-w * t) / A);
  const r = 10;
  const sigma = 5;
  const Ph = 1 - Math.exp((-Math.pow(r, 2)) / (2 * Math.pow(sigma, 2)));
  const b = 20;
  const d_r = Math.exp((-Math.pow(r, 2)) / (2 * Math.pow(b, 2)));
  const d_mi = 50;
  const D = d_mi * Ph;
  const Fi = unit.unit_health;
  const Fn = Fi - D;

  return { w, A, t, P, r, sigma, Ph, b, d_r, d_mi, D, Fi, Fn };
};

/**
 * Engagement Component:
 * Manages the overall flow of selecting units, detection, engagement, 
 * and final calculations for a scenario. It uses a Stepper to move 
 * through different phases (Round Setup, Detection, Engagement, Accuracy, 
 * and a final results summary).
 */
function Engagement() {
  // Retrieve the currently selected unit and a function to set it
  // from the global unit context
  const { selectedUnit, setSelectedUnit } = useUnitProvider();

  // Get the user's section (e.g., which group or department they belong to)
  // from a user role context
  const { userSection } = useUserRole();

  // active tracks which step in the Stepper is currently visible
  const [active, setActive] = useState(0);

  // State arrays that store lists of friendly and enemy units
  const [units, setUnits] = useState<Unit[]>([]);
  const [enemyUnits, setEnemyUnits] = useState<Unit[]>([]);

  // State for individual selected enemy unit, and their engagement data
  const [enemyUnit, setEnemyUnit] = useState<Unit | null>(null);
  const [enemyEngagementData, setEnemyEngagementData] = useState<EngagementData | null>(null);

  // State for the currently selected friendly unit's engagement data
  const [friendlyUnit, setFriendlyUnit] = useState<EngagementData | null>(null);

  // Boolean that indicates whether an engagement has started
  const [inEngagement, setInEngagement] = useState<boolean>(false);

  /**
   * We store two states for detection-phase questions:
   *  - isrConducted: has the user conducted ISR before moving forces?
   *  - commsDegraded: are communications or data degraded?
   * They default to 'No' for demonstration purposes.
   */
  const [isrConducted, setIsrConducted] = useState<'Yes' | 'No'>('No');
  const [commsDegraded, setCommsDegraded] = useState<'Yes' | 'No'>('No');

  /**
   * useEffect #1:
   * Fetches the friendly units associated with the current user's section
   * as soon as the component loads or whenever 'userSection' changes.
   */
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axios.get<Unit[]>(`${process.env.REACT_APP_BACKEND_URL}/api/sectionunits/sectionSort`, {
          params: { sectionid: userSection },
        });
        setUnits(response.data);
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    };
    fetchUnits();
  }, [userSection]);

  /**
   * useEffect #2:
   * Fetches enemy units for the same section (these might be opposing forces)
   * to display in the UI. 
   */
  useEffect(() => {
    const fetchEnemyUnits = async () => {
      try {
        const response = await axios.get<Unit[]>(`${process.env.REACT_APP_BACKEND_URL}/api/sectionunits/enemyUnits`, {
          params: { sectionid: userSection },
        });
        setEnemyUnits(response.data);
      } catch (error) {
        console.error('Error fetching enemy units:', error);
      }
    };
    fetchEnemyUnits();
  }, [userSection]);

  /**
   * useEffect #3:
   * Whenever the user picks a new friendly 'selectedUnit', we find its details 
   * in 'units' and set 'friendlyUnit' to a newly initialized EngagementData object.
   */
  useEffect(() => {
    if (selectedUnit) {
      const unit = units.find((u) => u.unit_id === selectedUnit);
      if (unit) {
        setFriendlyUnit(initializeUnit(unit));
      }
    }
  }, [selectedUnit, units]);

  /**
   * handleSelectEnemy:
   * This is called when the user picks an enemy unit from a dropdown or selection list.
   * It looks up the chosen enemy, then initializes that enemy's engagement data.
   */
  const handleSelectEnemy = (value: string | null) => {
    const selected = enemyUnits.find((unit) => unit.unit_id.toString() === value);
    setEnemyUnit(selected || null);
    setEnemyEngagementData(initializeUnit(selected || null));
  };

  /**
   * handleDeselectEnemy:
   * Allows the user to clear their enemy selection if they change their mind.
   */
  const handleDeselectEnemy = () => {
    setEnemyUnit(null);
    setEnemyEngagementData(null);
  };

  /**
   * handleStartEngagement:
   * Once the user has selected units, clicking 'Start Engagement' transitions
   * the stepper to the next step, marking the beginning of the scenario.
   */
  const handleStartEngagement = () => {
    setInEngagement(true);
    setActive(1); // Moves the Stepper from Step 0 to Step 1
  };

  /**
   * handleNextStep:
   * Called whenever the user clicks 'Next' in the Stepper.
   * If the current step is 'Detection', we modify friendlyUnit's time (t)
   * based on the user's ISR and Comms choices:
   *   - If ISR was conducted, t += 3; otherwise t -= 3.
   *   - If Comms are NOT degraded, t += 4; if they are degraded, t -= 4.
   * After updating, we move on to the next step.
   */
  const handleNextStep = () => {
    // We only apply these changes once, at the end of Step 1 (Detection)
    if (active === 1 && friendlyUnit) {
      let newT = friendlyUnit.t;
      if (isrConducted === 'Yes') newT += 3;
      if (isrConducted === 'No') newT -= 3;

      if (commsDegraded === 'No') newT += 4;
      if (commsDegraded === 'Yes') newT -= 4;

      setFriendlyUnit({ ...friendlyUnit, t: newT });
    }
    // Moves to the next step or caps at the final step
    setActive((current) => Math.min(4, current + 1));
  };

  // Render the step-based UI
  return (
    <>
      {/* Stepper: controls the multi-phase flow */}
      <Stepper active={active} onStepClick={setActive}>
        {/* STEP 0: Round Setup */}
        <Stepper.Step
          allowStepSelect={false}
          icon={<IconSwords stroke={1.5} style={{ width: rem(27), height: rem(27) }} />}
        >
          <Text>Round Setup</Text>
          <Text>
            Selected Unit: {selectedUnit ? units.find((u) => u.unit_id === selectedUnit)?.unit_name : 'None'}
          </Text>
          {/* UnitSelection handles choosing a friendly & enemy unit */}
          <UnitSelection
            enemyUnits={enemyUnits}
            enemyUnit={enemyUnit}
            setEnemyUnit={setEnemyUnit}
            handleSelectEnemy={handleSelectEnemy}
            handleDeselectEnemy={handleDeselectEnemy}
            handleStartEngagement={handleStartEngagement}
            inEngagement={inEngagement}
          />
        </Stepper.Step>

        {/* STEP 1: Detection Phase */}
        <Stepper.Step
          label="Detection"
          icon={<IconNumber1Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}
        >
          <Text size="xl">Detection Phase</Text>
          {/* We display the current t for debugging or clarity */}
          <Text mt="md" size="lg">
            This is the starting value of t (it should be 5): {friendlyUnit?.t}
          </Text>

          {/* User answers whether they've conducted ISR */}
          <Text mt="md">Did you conduct ISR prior to moving land forces?</Text>
          <SegmentedControl
            size="xl"
            radius="xs"
            color="gray"
            data={['Yes', 'No']}
            value={isrConducted}
            onChange={(val) => setIsrConducted(val as 'Yes' | 'No')}
          />

          {/* User answers whether their comms are degraded */}
          <Text mt="md">Are your Comms/Data degraded?</Text>
          <SegmentedControl
            size="xl"
            radius="xs"
            color="gray"
            data={['Yes', 'No']}
            value={commsDegraded}
            onChange={(val) => setCommsDegraded(val as 'Yes' | 'No')}
          />
        </Stepper.Step>

        {/* STEP 2: Engagement Phase */}
        <Stepper.Step
          allowStepSelect={false}
          label="Engagement"
          icon={<IconNumber2Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}
        >
          <Text>Engagement Phase</Text>
          <Text mt="md" size="lg">
            Did the last phase work??? This should not be 5. t = {friendlyUnit?.t}
          </Text>
        </Stepper.Step>

        {/* STEP 3: Accuracy Phase */}
        <Stepper.Step
          allowStepSelect={false}
          label="Accuracy"
          icon={<IconNumber3Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}
        >
          <Text>Accuracy Phase</Text>
        </Stepper.Step>

        {/* STEP 4: Summary of results */}
        <Stepper.Step
          allowStepSelect={false}
          icon={<IconHeartbeat stroke={1.5} style={{ width: rem(35), height: rem(35) }} />}
        >
          <Text>Here are the final results!!</Text>
          <Grid gutter="xl">
            {/* Friendly Unit Properties */}
            {friendlyUnit && (
              <Grid.Col span={6}>
                <Text size="xl">Friendly Unit Properties</Text>
                <Text>Field of View (w): {friendlyUnit.w}</Text>
                <Text>Area Covered (A): {friendlyUnit.A.toFixed(2)}</Text>
                <Text>Time Spent Detecting (t): {friendlyUnit.t}</Text>
                <Text>Probability of Detection (P): {friendlyUnit.P.toFixed(4)}</Text>
                <Text>Radius of Attack (r): {friendlyUnit.r}</Text>
                <Text>Accuracy Factor (σ): {friendlyUnit.sigma}</Text>
                <Text>Probability of Hit (Ph): {friendlyUnit.Ph.toFixed(4)}</Text>
                <Text>Range (b): {friendlyUnit.b}</Text>
                <Text>Accuracy Result (d_r): {friendlyUnit.d_r.toFixed(4)}</Text>
                <Text>Max Damage Inflicted (d_mi): {friendlyUnit.d_mi}</Text>
                <Text>Final Damage Inflicted (D): {friendlyUnit.D.toFixed(2)}</Text>
                <Text>Initial Health (Fi): {friendlyUnit.Fi}</Text>
                <Text>Final Health (Fn): {friendlyUnit.Fn.toFixed(2)}</Text>
              </Grid.Col>
            )}

            {/* Enemy Unit Properties */}
            {enemyEngagementData && (
              <Grid.Col span={6}>
                <Text size="xl">Enemy Unit Properties</Text>
                <Text>Field of View (w): {enemyEngagementData.w}</Text>
                <Text>Area Covered (A): {enemyEngagementData.A.toFixed(2)}</Text>
                <Text>Time Spent Detecting (t): {enemyEngagementData.t}</Text>
                <Text>Probability of Detection (P): {enemyEngagementData.P.toFixed(4)}</Text>
                <Text>Radius of Attack (r): {enemyEngagementData.r}</Text>
                <Text>Accuracy Factor (σ): {enemyEngagementData.sigma}</Text>
                <Text>Probability of Hit (Ph): {enemyEngagementData.Ph.toFixed(4)}</Text>
                <Text>Range (b): {enemyEngagementData.b}</Text>
                <Text>Accuracy Result (d_r): {enemyEngagementData.d_r.toFixed(4)}</Text>
                <Text>Max Damage Inflicted (d_mi): {enemyEngagementData.d_mi}</Text>
                <Text>Final Damage Inflicted (D): {enemyEngagementData.D.toFixed(2)}</Text>
                <Text>Initial Health (Fi): {enemyEngagementData.Fi}</Text>
                <Text>Final Health (Fn): {enemyEngagementData.Fn.toFixed(2)}</Text>
              </Grid.Col>
            )}
          </Grid>
        </Stepper.Step>
      </Stepper>

      {/* Navigation Buttons */}
      <Group justify="center" mt="xl">
        {/* 'Back' button decrements the step */}
        <Button variant="default" onClick={() => setActive((current) => Math.max(0, current - 1))}>
          Back
        </Button>
        {/* 'Next' button calls handleNextStep for any final logic before moving to the next step */}
        <Button onClick={handleNextStep}>Next</Button>
      </Group>
    </>
  );
}

export default Engagement;