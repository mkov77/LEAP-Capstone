// Engagement.tsx

import React, { useEffect, useState } from 'react';
import {
  Stepper, Button, Text, Group, rem, Grid, SegmentedControl, Tooltip
} from '@mantine/core';
import {
  IconHeartbeat,
  IconSwords,
  IconNumber1Small,
  IconNumber2Small,
  IconNumber3Small,
  IconInfoCircle,
} from '@tabler/icons-react';

import { useUnitProvider } from '../context/UnitContext';
import { useUserRole } from '../context/UserContext';
import axios from 'axios';
import UnitSelection from './unitSelection';
import { Unit } from '../types/unit';

import {
  runEngagementCalculation,
  CalculationResult,
  EngagementData,
  UnitModifiers, // so we can build "friendlyMods"/"enemyMods"
} from './calculateEngagement';

/** Engagement Component */
function Engagement() {
  const { selectedUnit } = useUnitProvider();
  const { userSection } = useUserRole();

  const [active, setActive] = useState(0);

  // Store friendly & enemy units from API
  const [units, setUnits] = useState<Unit[]>([]);
  const [enemyUnits, setEnemyUnits] = useState<Unit[]>([]);

  const [enemyUnit, setEnemyUnit] = useState<Unit | null>(null);

  // After we finalize, we store the final calculations here
  const [friendlyData, setFriendlyData] = useState<EngagementData | null>(null);
  const [enemyData, setEnemyData] = useState<EngagementData | null>(null);

  // Phase 1 states
  const [isrConducted, setIsrConducted] = useState<boolean>(false);
  const [commsDegraded, setCommsDegraded] = useState<boolean>(false);

  // Phase 2 states
  const [hasCAS, setHasCAS] = useState<boolean>(false);
  const [gpsJammed, setGpsJammed] = useState<boolean>(false);

  // Phase 3 states
  const [defendingCritical, setDefendingCritical] = useState<boolean>(false);
  const [targetInOuterSOI, setTargetInOuterSOI] = useState<boolean>(false);

  // 1) Fetch friendly units
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const resp = await axios.get<Unit[]>(
          `${process.env.REACT_APP_BACKEND_URL}/api/sectionunits/sectionSort`,
          { params: { sectionid: userSection } }
        );
        setUnits(resp.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUnits();
  }, [userSection]);

  // 2) Fetch enemy units
  useEffect(() => {
    const fetchEnemyUnits = async () => {
      try {
        const resp = await axios.get<Unit[]>(
          `${process.env.REACT_APP_BACKEND_URL}/api/sectionunits/enemyUnits`,
          { params: { sectionid: userSection } }
        );
        setEnemyUnits(resp.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchEnemyUnits();
  }, [userSection]);

  // Handlers for selecting the enemy unit
  const handleSelectEnemy = (value: string | null) => {
    const found = enemyUnits.find((u) => u.unit_id.toString() === value);
    setEnemyUnit(found || null);
  };

  const handleDeselectEnemy = () => {
    setEnemyUnit(null);
  };

  // Stepper Navigation
  const handleNextStep = () => {
    // If user is at Step 3 => pressing "Finalize" => do calculations, then go to Step 4
    if (active === 3) {
      doFinalize();
    }
    setActive((cur) => Math.min(4, cur + 1));
  };

  /**
   * doFinalize():
   *  - Gathers all user inputs into "friendlyMods" & "enemyMods".
   *  - Calls "runEngagementCalculation" with the correct parameter shape.
   *  - Stores final results (friendlyData, enemyData) in state.
   */
  const doFinalize = () => {
    if (!selectedUnit || !enemyUnit) return;

    const friendlyUnit = units.find((u) => u.unit_id === selectedUnit);
    const foeUnit = enemyUnits.find((u) => u.unit_id === enemyUnit.unit_id);
    if (!friendlyUnit || !foeUnit) return;

    // Build the "friendlyMods" based on user states
    const friendlyMods: UnitModifiers = {
      roleType: 'Combat',
      unitSize: 'Battalion',
      forcePosture: 'Offensive Only',
      forceMobility: 'Mobile (foot)',
      forceReadiness: 'High',
      forceSkill: 'Basic',

      didISR: isrConducted,
      commsGood: !commsDegraded,
      hasCAS,
      gpsJammed,
      defendingCritical,
      targetInOuterSOI,
      // no "maneuverableTarget" here, removed
    };

    // For enemy side, default or your own states
    const enemyMods: UnitModifiers = {
      roleType: 'Combat',
      unitSize: 'Battalion',
      forcePosture: 'Offensive Only',
      forceMobility: 'Mobile (foot)',
      forceReadiness: 'High',
      forceSkill: 'Basic',

      didISR: false,
      commsGood: true,
      hasCAS: false,
      gpsJammed: false,
      defendingCritical: false,
      targetInOuterSOI: false,
      // no "maneuverableTarget" here
    };

    const results: CalculationResult = runEngagementCalculation({
      friendly: friendlyUnit,
      enemy: foeUnit,
      friendlyMods,
      enemyMods,
    });

    setFriendlyData(results.friendly);
    setEnemyData(results.enemy);
  };

  return (
    <>
      <Stepper
        active={active}
        onStepClick={(step) => {
          if (active < 4 && step < 4 && step <= active) {
            setActive(step);
          }
        }}
      >
        {/* STEP 0: Round Setup */}
        <Stepper.Step icon={<IconSwords stroke={1.5} style={{ width: rem(27), height: rem(27) }} />}>
          <Text>
            Selected Friendly Unit: {selectedUnit ?? 'None'}
          </Text>
          <UnitSelection
            friendlyUnit={selectedUnit}
            enemyUnits={enemyUnits}
            enemyUnit={enemyUnit}
            setEnemyUnit={setEnemyUnit}
            handleSelectEnemy={handleSelectEnemy}
            handleDeselectEnemy={handleDeselectEnemy}
            handleStartEngagement={() => setActive(1)}
            inEngagement={active > 0}
            round={1}
          />
        </Stepper.Step>

        {/* STEP 1: Detection Phase */}
        <Stepper.Step
          label="Detection"
          icon={<IconNumber1Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}
        >
          <Text size="xl">Detection Phase</Text>

          <Group mt="md">
            <Text>Did you conduct ISR prior to moving land forces?</Text>
            <Tooltip label="ISR is helpful">
              <IconInfoCircle />
            </Tooltip>
          </Group>
          <SegmentedControl
            size="xl"
            radius="xs"
            color="gray"
            data={[
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' },
            ]}
            value={String(isrConducted)}
            onChange={(val) => setIsrConducted(val === 'true')}
          />

          <Text mt="md">Are your Comms/Data degraded?</Text>
          <SegmentedControl
            size="xl"
            radius="xs"
            color="gray"
            data={[
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' },
            ]}
            value={String(commsDegraded)}
            onChange={(val) => setCommsDegraded(val === 'true')}
          />
        </Stepper.Step>

        {/* STEP 2: Engagement Phase */}
        <Stepper.Step
          label="Engagement"
          icon={<IconNumber2Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}
        >
          <Text size="xl">Engagement Phase</Text>

          <Text mt="md">Do you have Close Air Support?</Text>
          <SegmentedControl
            size="xl"
            radius="xs"
            color="gray"
            data={[
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' },
            ]}
            value={String(hasCAS)}
            onChange={(val) => setHasCAS(val === 'true')}
          />

          <Text mt="md">Is your GPS being jammed?</Text>
          <SegmentedControl
            size="xl"
            radius="xs"
            color="gray"
            data={[
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' },
            ]}
            value={String(gpsJammed)}
            onChange={(val) => setGpsJammed(val === 'true')}
          />
        </Stepper.Step>

        {/* STEP 3: Accuracy Phase */}
        <Stepper.Step
          label="Accuracy"
          icon={<IconNumber3Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}
        >
          <Text size="xl">Accuracy Phase</Text>

          <Text mt="md">Is the target defending a critical location?</Text>
          <SegmentedControl
            size="xl"
            radius="xs"
            color="gray"
            data={[
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' },
            ]}
            value={String(defendingCritical)}
            onChange={(val) => setDefendingCritical(val === 'true')}
          />

          <Text mt="md">Is the target in the outer half of your SOI?</Text>
          <SegmentedControl
            size="xl"
            radius="xs"
            color="gray"
            data={[
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' },
            ]}
            value={String(targetInOuterSOI)}
            onChange={(val) => setTargetInOuterSOI(val === 'true')}
          />
        </Stepper.Step>

        {/* STEP 4: After Action Review (Summary) */}
        <Stepper.Step icon={<IconHeartbeat stroke={1.5} style={{ width: rem(35), height: rem(35) }} />}>
          <Text size="xl">After Action Review</Text>
          <Grid gutter="xl" mt="md">
            {friendlyData && (
              <Grid.Col span={6}>
                <Text size="lg" fw={700}>Friendly Unit Results</Text>
                <Text>Field of View (w): {friendlyData.w.toFixed(2)}</Text>
                <Text>Area Covered (A): {friendlyData.A.toFixed(2)}</Text>
                <Text>Time Spent Detecting (t): {friendlyData.t.toFixed(2)}</Text>
                <Text>Probability of Detection (P): {friendlyData.P.toFixed(4)}</Text>
                <Text>Radius (r): {friendlyData.r.toFixed(2)}</Text>
                <Text>Accuracy Factor (σ): {friendlyData.sigma.toFixed(2)}</Text>
                <Text>Probability of Hit (Ph): {friendlyData.Ph.toFixed(4)}</Text>
                <Text>Range (b): {friendlyData.b.toFixed(2)}</Text>
                <Text>d(r): {friendlyData.d_r.toFixed(4)}</Text>
                <Text>d_mi: {friendlyData.d_mi.toFixed(2)}</Text>
                <Text>Damage Dealt (D): {friendlyData.D.toFixed(2)}</Text>
                <Text>Friendly Initial HP (Fi): {friendlyData.Fi.toFixed(2)}</Text>
                <Text>Friendly Final HP (Fn): {friendlyData.Fn.toFixed(2)}</Text>
              </Grid.Col>
            )}

            {enemyData && (
              <Grid.Col span={6}>
                <Text size="lg" fw={700}>Enemy Unit Results</Text>
                <Text>Field of View (w): {enemyData.w.toFixed(2)}</Text>
                <Text>Area Covered (A): {enemyData.A.toFixed(2)}</Text>
                <Text>Time Spent Detecting (t): {enemyData.t.toFixed(2)}</Text>
                <Text>Probability of Detection (P): {enemyData.P.toFixed(4)}</Text>
                <Text>Radius (r): {enemyData.r.toFixed(2)}</Text>
                <Text>Accuracy Factor (σ): {enemyData.sigma.toFixed(2)}</Text>
                <Text>Probability of Hit (Ph): {enemyData.Ph.toFixed(4)}</Text>
                <Text>Range (b): {enemyData.b.toFixed(2)}</Text>
                <Text>d(r): {enemyData.d_r.toFixed(4)}</Text>
                <Text>d_mi: {enemyData.d_mi.toFixed(2)}</Text>
                <Text>Damage Dealt (D): {enemyData.D.toFixed(2)}</Text>
                <Text>Enemy Initial HP (Fi): {enemyData.Fi.toFixed(2)}</Text>
                <Text>Enemy Final HP (Fn): {enemyData.Fn.toFixed(2)}</Text>
              </Grid.Col>
            )}
          </Grid>
        </Stepper.Step>
      </Stepper>

      {/* Step Navigation Buttons */}
      {active > 0 && active < 4 && (
        <Group justify="center" mt="xl">
          {active > 1 && (
            <Button
              variant="default"
              onClick={() => setActive((cur) => Math.max(1, cur - 1))}
            >
              Back
            </Button>
          )}
          <Button
            color={active === 3 ? 'green' : undefined}
            onClick={handleNextStep}
          >
            {active === 3 ? 'Finalize' : 'Continue'}
          </Button>
        </Group>
      )}
    </>
  );
}

export default Engagement;