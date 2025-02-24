import React from 'react';
import { Grid, Card, Image, Text, Space, Center, Select, Button, Group } from '@mantine/core';
import { useUnitProvider } from '../context/UnitContext';
import getImageSRC from '../context/imageSrc';

// Define the Unit interface
interface Unit {
  unit_id: number;
  unit_name: string;
  unit_type: string;
  unit_size: string;
  unit_mobility: string;
  unit_health: number
}

// Define props for UnitSelection
interface UnitSelectionProps {
  enemyUnits: Unit[];
  enemyUnit: Unit | null;
  setEnemyUnit: (unit: Unit | null) => void;
  handleSelectEnemy: (value: string | null) => void;
  handleDeselectEnemy: () => void;
  handleStartEngagement: () => void;
  inEngagement: boolean;
}

const UnitSelection: React.FC<UnitSelectionProps> = ({
  enemyUnits,
  enemyUnit,
  handleSelectEnemy,
  handleDeselectEnemy,
  handleStartEngagement,
  inEngagement
}) => {
  const { selectedUnit } = useUnitProvider();
  const unit: Unit | null = selectedUnit || null;

  return (
    <Grid justify='center' align='flex-start' gutter={100}>
      {/* Friendly Unit Card */}
      <Grid.Col span={4}>
        <Card withBorder radius="md">
          <Card.Section mt="md">
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
            <Center><h2>{unit ? unit.unit_name : "No Unit Selected"}</h2></Center>
          </Card.Section>
          {unit ? (
            <Text size="xl">
              <strong>Type:</strong> {unit.unit_type}<br />
              <Space mb="5px" />
              <strong>Unit Size:</strong> {unit.unit_size}<br />
              <Space mb="5px" />
              <strong>Force Mobility:</strong> {unit.unit_mobility}<br />
            </Text>
          ) : (
            <Text size="sm">Please select a friendly unit.</Text>
          )}
        </Card>
      </Grid.Col>

      {/* Enemy Unit Selection */}
      <Grid.Col span={4}>
        {enemyUnit ? (
          <Card withBorder radius="md">
            <Card.Section mt="md">
              <Image
                src={getImageSRC(enemyUnit.unit_type, false)}
                height={160}
                style={{ width: 'auto', maxHeight: '100%', objectFit: 'contain' }}
              />
            </Card.Section>
            <Card.Section>
              <Center><h2>{enemyUnit.unit_name}</h2></Center>
            </Card.Section>
            <Text size="xl">
              <strong>Type:</strong> {enemyUnit.unit_type}<br />
              <Space mb="5px" />
              <strong>Unit Size:</strong> {enemyUnit.unit_size}<br />
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

      {/* Action Buttons */}
      <Group justify="center" mt="xl">
        {enemyUnit && !inEngagement && (
          <Button onClick={handleDeselectEnemy} color='red'>Deselect Enemy Unit</Button>
        )}
        <Button onClick={handleStartEngagement} disabled={!enemyUnit}>
          {inEngagement ? 'Start Round' : 'Start Engagement'}
        </Button>
      </Group>
    </Grid>
  );
};

export default UnitSelection;