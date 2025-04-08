// Engagement.tsx

import React, { useEffect, useState } from 'react';
import { useInterval } from '@mantine/hooks';
import {
  Stepper,
  Button,
  Text,
  Group,
  rem,
  SegmentedControl,
  Tooltip,
  Progress,
  Container,
  Space,
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
import classes from './engagement.module.css';

import {
  runEngagementCalculation,
  CalculationResult,
  EngagementData,
  UnitModifiers,
} from './calculateEngagement';

import AfterActionReview from './AfterActionReview';
import { useNavigate } from 'react-router-dom';

/** Engagement Component */
function Engagement() {
  const { selectedUnit } = useUnitProvider();
  const { userSection } = useUserRole();

  // Stepper State
  const [active, setActive] = useState(0);

  // Basic Round Tracking
  const [roundNumber, setRoundNumber] = useState(1);

  // Store friendly & enemy units from API
  const [units, setUnits] = useState<Unit[]>([]);
  const [enemyUnits, setEnemyUnits] = useState<Unit[]>([]);

  // Currently selected enemy
  const [enemyUnit, setEnemyUnit] = useState<Unit | null>(null);

  // Current HP for each side (carried forward between rounds)
  const [friendlyHP, setFriendlyHP] = useState<number | null>(null);
  const [enemyHP, setEnemyHP] = useState<number | null>(null);

  // After finalize, store final calculations
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

  // Animating Finalize Button
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const navigate = useNavigate();

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

  // Handlers for selecting the enemy
  const handleSelectEnemy = (value: string | null) => {
    const found = enemyUnits.find((u) => u.unit_id.toString() === value);
    setEnemyUnit(found || null);
  };
  const handleDeselectEnemy = () => {
    setEnemyUnit(null);
  };

  // Stepper Navigation
  const handleNextStep = () => {
    // If user is on Step 3 => pressing "Continue" => do calculations, then go Step 4
    if (active === 3) {
      doFinalize();
    }
    setActive((cur) => Math.min(4, cur + 1));
  };

  // Hnadle Exit
  const handleExit = () => {
    navigate(`/studentPage/${userSection}`);
  };


  // Initialize Progress Bar Animation
  const interval = useInterval(
    () =>
      setProgress((current) => {
        if (current < 100) {
          return current + 1;
        }
        interval.stop();
        setLoaded(true);
        handleNextStep();
        return 0;
      }),
    20 // speed
  );

  /**
   * doFinalize():
   *  - Gathers all user inputs into "friendlyMods" & "enemyMods".
   *  - Calls "runEngagementCalculation".
   *  - Stores final results (friendlyData, enemyData).
   */
  const doFinalize = () => {
    if (!selectedUnit || !enemyUnit) return;

    const friendlyUnitObj = units.find((u) => u.unit_id === selectedUnit);
    const enemyUnitObj = enemyUnits.find((u) => u.unit_id === enemyUnit.unit_id);
    if (!friendlyUnitObj || !enemyUnitObj) return;

    // Restore friendly modifiers
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
    };

    // Restore enemy modifiers
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
    };

    // Run the engagement calculation
    const results: CalculationResult = runEngagementCalculation({
      friendly: friendlyUnitObj,
      enemy: enemyUnitObj,
      friendlyMods,
      enemyMods,
      applyFirstStrike: roundNumber === 1, // Only apply first strike on round 1
    });

    setFriendlyData(results.friendly);
    setEnemyData(results.enemy);

    // Calculate the new health for both sides and round to an integer value
    const newFriendlyHealth = Math.round(
      Math.max(0, friendlyUnitObj.unit_health - results.enemy.D)
    );
    const newEnemyHealth = Math.round(
      Math.max(0, enemyUnitObj.unit_health - results.friendly.D)
    );

    // Update friendly unit health on the backend
    axios
      .put(`${process.env.REACT_APP_BACKEND_URL}/api/units/health`, {
        id: friendlyUnitObj.unit_id,
        newHealth: newFriendlyHealth,
      })
      .then((response) => {
        console.log("Friendly health updated:", response.data);
      })
      .catch((error) => {
        console.error("Error updating friendly health:", error);
      });

    // Update enemy unit health on the backend
    axios
      .put(`${process.env.REACT_APP_BACKEND_URL}/api/units/health`, {
        id: enemyUnitObj.unit_id,
        newHealth: newEnemyHealth,
      })
      .then((response) => {
        console.log("Enemy health updated:", response.data);
      })
      .catch((error) => {
        console.error("Error updating enemy health:", error);
      });

    // Update the local units state so that the unit objects reflect the new health values
    setUnits((prevUnits) =>
      prevUnits.map((unit) =>
        unit.unit_id === friendlyUnitObj.unit_id
          ? { ...unit, unit_health: newFriendlyHealth }
          : unit
      )
    );

    setEnemyUnits((prevEnemyUnits) =>
      prevEnemyUnits.map((unit) =>
        unit.unit_id === enemyUnitObj.unit_id
          ? { ...unit, unit_health: newEnemyHealth }
          : unit
      )
    );

    // Also update the selected enemy unit so that UnitSelection displays the updated health
    setEnemyUnit({ ...enemyUnitObj, unit_health: newEnemyHealth });
  };

  // If both sides remain alive, user can continue
  const canContinue = Boolean(
    friendlyData && enemyData && friendlyData.Fn > 0 && enemyData.Fn > 0
  );

  // Handler for continuing a new round
  const handleContinueRound = () => {
    // Bump round, reset steps, let user pick new answers
    setRoundNumber((r) => r + 1);
    setActive(0);
    setLoaded(false);
    setProgress(0);

    // Optionally reset the toggles:
    // setIsrConducted(false);
    // setCommsDegraded(false);
    // setHasCAS(false);
    // setGpsJammed(false);
    // setDefendingCritical(false);
    // setTargetInOuterSOI(false);

    // If you want to keep the same enemy selection, do nothing here. 
    // If you want to force picking new enemy, call handleDeselectEnemy();
  };

  const friendlyUnitObject = selectedUnit
    ? units.find((u) => u.unit_id === selectedUnit) || null
    : null;

  return (
    <>
      <Stepper m="md" active={active}>
        {/* STEP 0: Round Setup */}
        <Stepper.Step
          icon={<IconSwords stroke={1.5} style={{ width: rem(27), height: rem(27) }} />}
        >

          <UnitSelection
            friendlyUnit={friendlyUnitObject}
            enemyUnits={enemyUnits}
            enemyUnit={enemyUnit}
            setEnemyUnit={setEnemyUnit}
            handleSelectEnemy={handleSelectEnemy}
            handleDeselectEnemy={handleDeselectEnemy}
            handleStartEngagement={() => setActive(roundNumber === 1 ? 1 : 2)}
            inEngagement={active > 0}
            round={roundNumber}
            buttonLabel={roundNumber === 1 ? 'Start Engagement' : 'Start Round'} // <-- this line
          />



        </Stepper.Step>

        {/* STEP 1: Detection Phase */}
        <Stepper.Step
          label="Detection"
          icon={<IconNumber1Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}
        >
          <Container size="md" p="xl">
            <Text
              fw={900}
              tt="uppercase"
              style={{
                fontSize: '30px',
                letterSpacing: '2px',
                lineHeight: '1.2',
                textShadow: '3px 3px 5px rgba(0,0,0,0.3)',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              Detection Phase
            </Text>

            <Group mt="md" align="center" gap="xs">
              <Text style={{ fontSize: '20px' }}>
                Did you conduct ISR prior to moving land forces?
              </Text>
              <Tooltip label="Helps you spot the enemy more easily.">
                <IconInfoCircle />
              </Tooltip>
            </Group>
            <Space h="sm" />
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

            <Group mt="md" align="center" gap="xs">
              <Text style={{ fontSize: '20px' }}>Are your Comms/Data degraded?</Text>
              <Tooltip label="Makes it harder to detect the enemy.">
                <IconInfoCircle />
              </Tooltip>
            </Group>
            <Space h="sm" />
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
          </Container>
        </Stepper.Step>

        {/* STEP 2: Engagement Phase */}
        <Stepper.Step
          label="Engagement"
          icon={<IconNumber2Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}
        >
          <Container size="md" p="xl">
            <Text
              fw={900}
              tt="uppercase"
              style={{
                fontSize: '30px',
                letterSpacing: '2px',
                lineHeight: '1.2',
                textShadow: '3px 3px 5px rgba(0,0,0,0.3)',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              Engagement Phase
            </Text>

            <Group mt="md" align="center" gap="xs">
              <Text style={{ fontSize: '20px' }}>Do you have Close Air Support?</Text>
              <Tooltip label="Improves your accuracy and damage.">
                <IconInfoCircle />
              </Tooltip>
            </Group>
            <Space h="sm" />
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

            <Group mt="md" align="center" gap="xs">
              <Text style={{ fontSize: '20px' }}>Is your GPS being jammed?</Text>
              <Tooltip label="Makes your weapons less accurate.">
                <IconInfoCircle />
              </Tooltip>
            </Group>
            <Space h="sm" />
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
          </Container>
        </Stepper.Step>

        {/* STEP 3: Accuracy Phase */}
        <Stepper.Step
          label="Accuracy"
          icon={<IconNumber3Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}
        >
          <Container size="md" p="xl">
            <Text
              fw={900}
              tt="uppercase"
              style={{
                fontSize: '30px',
                letterSpacing: '2px',
                lineHeight: '1.2',
                textShadow: '3px 3px 5px rgba(0,0,0,0.3)',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              Accuracy Phase
            </Text>

            <Group mt="md" align="center" gap="xs">
              <Text style={{ fontSize: '20px' }}>
                Is the target defending a critical location?
              </Text>
              <Tooltip label="Enemy is harder to hit when guarding key areas.">
                <IconInfoCircle />
              </Tooltip>
            </Group>
            <Space h="sm" />
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

            <Group mt="md" align="center" gap="xs">
              <Text style={{ fontSize: '20px' }}>
                Is the target in the outer half of your SOI?
              </Text>
              <Tooltip label="Harder to hit targets farther away.">
                <IconInfoCircle />
              </Tooltip>
            </Group>
            <Space h="sm" />
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
          </Container>
        </Stepper.Step>

        {/* STEP 4: After Action Review */}
        <Stepper.Step
          icon={<IconHeartbeat stroke={1.5} style={{ width: rem(35), height: rem(35) }} />}
        >
          <Container size="lg" p="xl">
            <Text
              fw={900}
              tt="uppercase"
              style={{
                fontSize: '30px',
                letterSpacing: '2px',
                lineHeight: '1.2',
                textShadow: '3px 3px 5px rgba(0,0,0,0.3)',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              After Action Review
            </Text>

            <AfterActionReview
              friendlyData={friendlyData}
              enemyData={enemyData}
              round={roundNumber}
            />


            {/* Only show "Continue" if both sides > 0. Otherwise end. */}
            {friendlyData && enemyData && (
              <Group mt="lg" justify='center'>
                {canContinue ? (
                  <Button color="blue" onClick={handleContinueRound}>
                    Continue to Round {roundNumber + 1}
                  </Button>
                ) : (
                  <Button color="red" onClick={handleExit}>
                    Exit
                  </Button>

                )}
              </Group>
            )}
          </Container>
        </Stepper.Step>
      </Stepper>

      {/* Navigation Buttons (Steps 1–3) */}
      {active > 0 && active < 4 && (
        <Group justify="center" mt="xl">
          {/* Back Button (Steps 2-3). 
              If you want them to be able to go back to Step 0, conditionally show it also. */}
          {active > 1 && !(active === 2 && roundNumber > 1) && (
            <Button
              variant="default"
              onClick={() => setActive((cur) => Math.max(1, cur - 1))}
            >
              Back
            </Button>
          )}
          {/* Finalize Button (Only on Step 3) */}
          {active === 3 ? (
            <Button
              className={classes.button}
              onClick={() => {
                if (!interval.active) {
                  interval.start(); // Start progress bar animation
                }
                doFinalize();
              }}
              color="green"
              disabled={progress !== 0} // disable while animating
            >
              <div className={classes.label}>
                {progress !== 0 ? 'Calculating Scores...' : loaded ? 'Complete' : 'Finalize'}
              </div>
              {/* Fancy progress bar */}
              {progress !== 0 && (
                <Progress
                  style={{ height: '100%', width: '100%' }}
                  value={progress}
                  className={classes.progress}
                  color="grey"
                  radius="sm"
                />
              )}
            </Button>
          ) : (
            // "Continue" Button (Steps 1–2 only)
            <Button onClick={handleNextStep}>Continue</Button>
          )}
        </Group>
      )}
    </>
  );
}

export default Engagement;