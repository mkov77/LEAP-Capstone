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
  Progress
} from '@mantine/core';
import getImageSRC from '../context/imageSrc';
import { Unit } from '../types/unit';
import classes from './unitSelection.module.css';

// Props
interface UnitSelectionProps {
  friendlyUnit: Unit | null;      // The friendly unit is passed in from Engagement
  enemyUnits: Unit[];
  enemyUnit: Unit | null;
  setEnemyUnit: (unit: Unit | null) => void;
  handleSelectEnemy: (value: string | null) => void;
  handleDeselectEnemy: () => void;
  handleStartEngagement: () => void;
  inEngagement: boolean;
  round: number;
}

// Progress Bars for readiness, skill, and health
const CustomProgressBarReadiness: React.FC<{ value: number }> = ({ value }) => {
  let color = 'blue';
  if (value === 0) {
    color = 'red';
  } else if (value <= 25) {
    color = 'orange';
  } else if (value <= 50) {
    color = 'yellow';
  } else if (value <= 75) {
    color = 'lime';
  } else {
    color = 'green';
  }

  return (
    <Group grow gap={5} mb="xs">
      <Progress size="xl" color={color} value={value > 0 ? 100 : 0} transitionDuration={0} />
      <Progress size="xl" color={color} value={value < 30 ? 0 : 100} transitionDuration={0} />
      <Progress size="xl" color={color} value={value < 50 ? 0 : 100} transitionDuration={0} />
      <Progress size="xl" color={color} value={value < 70 ? 0 : 100} transitionDuration={0} />
    </Group>
  );
};

const CustomProgressBarSkill: React.FC<{ value: number }> = ({ value }) => {
  let color = 'blue';
  if (value === 0) {
    color = 'red';
  } else if (value <= 50) {
    color = 'yellow';
  } else {
    color = 'green';
  }

  return (
    <Group grow gap={5} mb="xs">
      <Progress size="xl" color={color} value={value > 0 ? 100 : 0} transitionDuration={0} />
      <Progress size="xl" color={color} value={value < 30 ? 0 : 100} transitionDuration={0} />
      <Progress size="xl" color={color} value={value < 50 ? 0 : 100} transitionDuration={0} />
      <Progress size="xl" color={color} value={value < 70 ? 0 : 100} transitionDuration={0} />
    </Group>
  );
};

const CustomProgressBarHealth: React.FC<{ value: number }> = ({ value }) => {
  let color = 'blue';
  if (value <= 25) {
    color = 'red';
  } else if (value <= 50) {
    color = 'orange';
  } else if (value <= 75) {
    color = 'yellow';
  } else {
    color = 'green';
  }
  return <Progress value={value} color={color} size="xl" mb="xs" />;
};

const UnitSelection: React.FC<UnitSelectionProps> = ({
  friendlyUnit,
  enemyUnits,
  enemyUnit,
  setEnemyUnit,
  handleSelectEnemy,
  handleDeselectEnemy,
  handleStartEngagement,
  inEngagement,
  round
}) => {
  // Use friendlyUnit from props
  const friendlyHealth = friendlyUnit ? friendlyUnit.unit_health : 0;
  const enemyHealth = enemyUnit ? enemyUnit.unit_health : 0;

  return (
    <div>
      {/* Just to demonstrate which friendly unit is loaded */}
      <Text>Selected Friendly Unit ID: {friendlyUnit?.unit_id ?? 'None'}</Text>

      <h1 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        Round {round}
      </h1>

      <Grid justify="center" align="flex-start" gutter={100}>
        {/* FRIENDLY UNIT CARD */}
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
                <strong>Force Readiness:</strong> {friendlyUnit.unit_readiness}
                <CustomProgressBarReadiness value={friendlyUnit.unit_readiness} />
                <Space mb="5px" />
                <strong>Force Skill:</strong> {friendlyUnit.unit_skill}
                <CustomProgressBarSkill value={friendlyUnit.unit_skill} />
                <Space mb="5px" />
                <strong>Health:</strong> {friendlyHealth}
                <CustomProgressBarHealth value={friendlyHealth} />
              </Text>
            ) : (
              <Text size="sm">Unit not found</Text>
            )}
          </Card>
        </Grid.Col>

        {/* ENEMY UNIT CARD or SELECT */}
        <Grid.Col span={4}>
          {enemyUnit ? (
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
                <strong>Force Readiness:</strong> {enemyUnit.unit_readiness}
                <CustomProgressBarReadiness value={enemyUnit.unit_readiness} />
                <Space mb="5px" />
                <strong>Force Skill:</strong> {enemyUnit.unit_skill}
                <CustomProgressBarSkill value={enemyUnit.unit_skill} />
                <Space mb="5px" />
                <strong>Health:</strong> {enemyHealth}
                <CustomProgressBarHealth value={enemyHealth} />
              </Text>
            </Card>
          ) : enemyUnits.length === 0 ? (
            <h2>No enemy units to select</h2>
          ) : (
            <Select
              label="Select Enemy Unit"
              placeholder="Select Enemy Unit"
              data={enemyUnits.map(eUnit => ({
                value: eUnit.unit_id.toString(),
                label: eUnit.unit_name
              }))}
              searchable
              onChange={handleSelectEnemy}
            />
          )}
        </Grid.Col>
      </Grid>

      {/* Action Buttons */}
      <Group justify="center" mt="xl">
        {(!inEngagement && enemyUnit) && (
          <Button onClick={handleDeselectEnemy} disabled={!enemyUnit} color="red">
            Deselect Enemy Unit
          </Button>
        )}
        <Button onClick={handleStartEngagement} disabled={!enemyUnit}>
          {inEngagement ? 'Start Round' : 'Start Engagement'}
        </Button>
      </Group>
    </div>
  );
};

export default UnitSelection;