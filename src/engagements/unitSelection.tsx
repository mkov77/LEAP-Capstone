import React from 'react';
import {
  Grid,
  Card,
  Image,
  Text,
  Space,
  Center,
  Select,
  Button,
  Group,
  Progress,
} from '@mantine/core';
import { Unit } from '../types/unit';
import getImageSRC from '../context/imageSrc';
import classes from './unitSelection.module.css';

interface UnitSelectionProps {
  friendlyUnit: Unit | null;
  enemyUnits: Unit[];
  enemyUnit: Unit | null;
  setEnemyUnit: (unit: Unit | null) => void;
  handleSelectEnemy: (value: string | null) => void;
  handleDeselectEnemy: () => void;
  handleStartEngagement: () => void;
  inEngagement: boolean;
  round: number; // We can use this to check if we're beyond Round 1
  buttonLabel?: string;
}

/* ----------------------------------------------
   1) Convert readiness/skill strings to numeric
---------------------------------------------- */
function getReadinessProgress(unit_readiness: string | undefined): number {
  switch (unit_readiness) {
    case 'Low':
      return 25;
    case 'Medium':
      return 50;
    case 'High':
      return 75;
    case 'Untrained':
      return 0;
    default:
      return 0;
  }
}

function getForceSkill(unit_skill: string | undefined): number {
  switch (unit_skill) {
    case 'Untrained':
      return 0;
    case 'Basic':
      return 33;
    case 'Advanced':
      return 66;
    case 'Elite':
      return 100;
    default:
      return 0;
  }
}

/* ----------------------------------------------
   2) Custom Progress Bars
---------------------------------------------- */

// READINESS
const CustomProgressBarReadiness = ({ value }: { value: number }) => {
  let color = 'blue';
  if (value === 0) color = 'red';
  else if (value <= 25) color = 'orange';
  else if (value <= 50) color = 'yellow';
  else color = 'green';

  return (
    <Group grow gap={5} mb="xs">
      <Progress size="xl" color={color} value={value > 0 ? 100 : 0} transitionDuration={0} />
      <Progress size="xl" color={color} value={value <= 25 ? 0 : 100} transitionDuration={0} />
      <Progress size="xl" color={color} value={value <= 50 ? 0 : 100} transitionDuration={0} />
    </Group>
  );
};

// SKILL
const CustomProgressBarSkill = ({ value }: { value: number }) => {
  let color = 'blue';
  if (value === 0) color = 'red';
  else if (value <= 33) color = 'orange';
  else if (value < 66) color = 'yellow';
  else if (value < 100) color = 'lime';
  else color = 'green';

  return (
    <Group grow gap={5} mb="xs">
      <Progress size="xl" color={color} value={value > 0 ? 100 : 0} transitionDuration={0} />
      <Progress size="xl" color={color} value={value <= 33 ? 0 : 100} transitionDuration={0} />
      <Progress size="xl" color={color} value={value < 66 ? 0 : 100} transitionDuration={0} />
      <Progress size="xl" color={color} value={value < 100 ? 0 : 100} transitionDuration={0} />
    </Group>
  );
};

// HEALTH
const CustomProgressBarHealth = ({ value }: { value: number }) => {
  let color = 'blue';
  if (value <= 25) color = 'red';
  else if (value <= 50) color = 'orange';
  else if (value <= 75) color = 'yellow';
  else color = 'green';
  return <Progress value={value} color={color} size="xl" mb="xs" />;
};

/* ----------------------------------------------
   3) The UnitSelection component
---------------------------------------------- */
const UnitSelection: React.FC<UnitSelectionProps> = ({
  friendlyUnit,
  enemyUnits,
  enemyUnit,
  setEnemyUnit,
  handleSelectEnemy,
  handleDeselectEnemy,
  handleStartEngagement,
  inEngagement,
  round,
  buttonLabel,
}) => {
  const friendlyHealth = friendlyUnit ? friendlyUnit.unit_health : 0;
  const enemyHealth = enemyUnit ? enemyUnit.unit_health : 0;

  // Condition: if round > 1 => do not let user change enemy
  const canChangeEnemy = round <= 1;

  return (
    <div>
      <h1 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        Round {round}
      </h1>

      <Grid justify="center" align="flex-start" gutter={100}>
        {/* Friendly Unit Card */}
        <Grid.Col span={4}>
          <Card withBorder radius="md" className={classes.card}>
            <Card.Section className={classes.imageSection} mt="md">
              <Center>
                {friendlyUnit ? (
                  <Image
                    src={getImageSRC(friendlyUnit.unit_type, true)}
                    height={160}
                    style={{ width: 'auto', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Text size="sm">No friendly unit selected</Text>
                )}
              </Center>
            </Card.Section>
            <Card.Section>
              <Center>
                <h2>{friendlyUnit ? friendlyUnit.unit_name : 'No Unit Selected'}</h2>
              </Center>
            </Card.Section>

            {friendlyUnit ? (
              <Text size="xl" style={{ whiteSpace: 'pre-line' }}>
                <strong>Type:</strong> {friendlyUnit.unit_type}
                <Space mb="5px" />
                <strong>Unit Size:</strong> {friendlyUnit.unit_size}
                <Space mb="5px" />
                <strong>Force Mobility:</strong> {friendlyUnit.unit_mobility}
                <Space mb="5px" />

                {/* READINESS */}
                <strong>Force Readiness:</strong> {friendlyUnit.unit_readiness}
                <CustomProgressBarReadiness value={getReadinessProgress(friendlyUnit.unit_readiness)} />
                <Space mb="5px" />

                {/* SKILL */}
                <strong>Force Skill:</strong> {friendlyUnit.unit_skill}
                <CustomProgressBarSkill value={getForceSkill(friendlyUnit.unit_skill)} />
                <Space mb="5px" />

                {/* HEALTH */}
                <strong>Health:</strong> {friendlyHealth}
                <CustomProgressBarHealth value={friendlyHealth} />
              </Text>
            ) : (
              <Text size="sm">Unit not found</Text>
            )}
          </Card>
        </Grid.Col>

        {/* Enemy Unit Card or selection dropdown */}
        <Grid.Col span={4}>
          {enemyUnit ? (
            // If an enemy is selected, show the card
            <Card withBorder radius="md" className={classes.card}>
              <Card.Section className={classes.imageSection} mt="md">
                <Center>
                  <Image
                    src={getImageSRC(enemyUnit.unit_type, false)}
                    height={160}
                    style={{ width: 'auto', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </Center>
              </Card.Section>
              <Card.Section>
                <Center>
                  <h2>{enemyUnit.unit_name}</h2>
                </Center>
              </Card.Section>
              <Text size="xl">
                <strong>Type:</strong> {enemyUnit.unit_type}
                <Space mb="5px" />
                <strong>Unit Size:</strong> {enemyUnit.unit_size}
                <Space mb="5px" />
                <strong>Force Mobility:</strong> {enemyUnit.unit_mobility}
                <Space mb="5px" />

                {/* READINESS */}
                <strong>Force Readiness:</strong> {enemyUnit.unit_readiness}
                <CustomProgressBarReadiness value={getReadinessProgress(enemyUnit.unit_readiness)} />
                <Space mb="5px" />

                {/* SKILL */}
                <strong>Force Skill:</strong> {enemyUnit.unit_skill}
                <CustomProgressBarSkill value={getForceSkill(enemyUnit.unit_skill)} />
                <Space mb="5px" />

                {/* HEALTH */}
                <strong>Health:</strong> {enemyHealth}
                <CustomProgressBarHealth value={enemyHealth} />
              </Text>
            </Card>
          ) : enemyUnits.length === 0 ? (
            // If no enemy units exist
            <h2>No enemy units to select</h2>
          ) : canChangeEnemy ? (
            // Round 1 => can pick an enemy
            <Select
              label="Select Enemy Unit"
              placeholder="Select Enemy Unit"
              data={enemyUnits.map((eUnit) => ({
                value: eUnit.unit_id.toString(),
                label: eUnit.unit_name,
              }))}
              searchable
              onChange={handleSelectEnemy}
            />
          ) : (
            // Round > 1 but no enemy is selected. This is an edge case (maybe should not happen).
            <Text size="md" color="red">
              Enemy selection locked; no enemy chosen.
            </Text>
          )}
        </Grid.Col>
      </Grid>

      {/* Buttons */}
      <Group justify="center" mt="xl">
        {/* Only show "Deselect" if it's round 1 and an enemy is selected */}
        {round === 1 && enemyUnit && !inEngagement && (
          <Button onClick={handleDeselectEnemy} color="red">
            Deselect Enemy Unit
          </Button>
        )}

        <Button onClick={handleStartEngagement} disabled={!enemyUnit}>
          {buttonLabel || 'Start Engagement'}
        </Button>


      </Group>
    </div>
  );
};

export default UnitSelection;