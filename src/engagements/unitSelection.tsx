import React from 'react';
import { Grid, Card, Image, Text, Space, Center, Select, Button, Group, Progress } from '@mantine/core';
import { useUnitProvider } from '../context/UnitContext';
import getImageSRC from '../context/imageSrc';
import classes from './unitSelection.module.css';
import { Unit } from '../types/unit'

// Define props for the UnitSelection component
interface UnitSelectionProps {
  enemyUnits: Unit[];
  enemyUnit: Unit | null;
  setEnemyUnit: (unit: Unit | null) => void;
  handleSelectEnemy: (value: string | null) => void;
  handleDeselectEnemy: () => void;
  handleStartEngagement: () => void;
  inEngagement: boolean;
  round: number;
}

// Custom Progress Bar for Force Readiness
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

// Custom Progress Bar for Force Skill
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

// Custom Progress Bar for Unit Health
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
  enemyUnits,
  enemyUnit,
  handleSelectEnemy,
  handleDeselectEnemy,
  handleStartEngagement,
  inEngagement,
  round
}) => {
  const { selectedUnit } = useUnitProvider();
  const unit: Unit | null = selectedUnit || null;

  const friendlyHealth = unit ? unit.unit_health : 0;
  const enemyHealth = enemyUnit ? enemyUnit.unit_health : 0;

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
              <Group>
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  {unit ? (
                    <Image
                      src={getImageSRC(unit.unit_type, true)}
                      height={160}
                      style={{ width: 'auto', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <Text size="sm">No friendly unit selected</Text>
                  )}
                </div>
              </Group>
            </Card.Section>
            <Card.Section>
              <Center>
                <h2>{unit ? unit.unit_name : "No Unit Selected"}</h2>
              </Center>
            </Card.Section>
            {unit ? (
              <Text size="xl" style={{ whiteSpace: 'pre-line' }}>
                <strong>Type:</strong> {unit.unit_type}<br />
                <Space mb="5px" />
                <strong>Unit Size:</strong> {unit.unit_size}<br />
                <Space mb="5px" />
                <strong>Force Mobility:</strong> {unit.unit_mobility}<br />
                <Space mb="5px" />
                <strong>Force Readiness:</strong> {unit.unit_readiness}<br />
                <CustomProgressBarReadiness value={unit.unit_readiness} /><br />
                <strong>Force Skill:</strong> {unit.unit_skill}<br />
                <CustomProgressBarSkill value={unit.unit_skill} /><br />
                <strong>Health:</strong> {friendlyHealth}<br />
                <CustomProgressBarHealth value={friendlyHealth} />
              </Text>
            ) : (
              <Text size="sm">Unit not found</Text>
            )}
          </Card>
        </Grid.Col>

        {/* Enemy Unit Card or Selection */}
        <Grid.Col span={4}>
          {enemyUnit ? (
            <Card withBorder radius="md" className={classes.card}>
              <Card.Section className={classes.imageSection} mt="md">
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <Image
                    src={getImageSRC(enemyUnit.unit_type, false)}
                    height={160}
                    style={{ width: 'auto', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
              </Card.Section>
              <Card.Section>
                <Center>
                  <h2>{enemyUnit.unit_name}</h2>
                </Center>
              </Card.Section>
              <Text size="xl">
                <strong>Type:</strong> {enemyUnit.unit_type}<br />
                <Space mb="5px" />
                <strong>Unit Size:</strong> {enemyUnit.unit_size}<br />
                <Space mb="5px" />
                <strong>Force Mobility:</strong> {enemyUnit.unit_mobility}<br />
                <Space mb="5px" />
                <strong>Force Readiness:</strong> {enemyUnit.unit_readiness}<br />
                <CustomProgressBarReadiness value={enemyUnit.unit_readiness} /><br />
                <strong>Force Skill:</strong> {enemyUnit.unit_skill}<br />
                <CustomProgressBarSkill value={enemyUnit.unit_skill} /><br />
                <strong>Health:</strong> {enemyHealth}<br />
                <CustomProgressBarHealth value={enemyHealth} />
              </Text>
            </Card>
          ) : (
            enemyUnits.length === 0 ? (
              <h2>No enemy units to select</h2>
            ) : (
              <Select
                label="Select Enemy Unit"
                placeholder="Select Enemy Unit"
                data={enemyUnits.map(eUnit => ({ value: eUnit.unit_id.toString(), label: eUnit.unit_name }))}
                searchable
                onChange={handleSelectEnemy}
              />
            )
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