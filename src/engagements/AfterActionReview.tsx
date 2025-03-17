// AfterActionReview.tsx
import React from 'react';
import {
  Grid,
  Text,
  Group,
  Card,
  Container,
  Tooltip,
  Progress,
} from '@mantine/core';
import { EngagementData } from './calculateEngagement'; // adjust path if needed

interface AfterActionReviewProps {
  friendlyData: EngagementData | null;
  enemyData: EngagementData | null;
}

const AfterActionReview: React.FC<AfterActionReviewProps> = ({
  friendlyData,
  enemyData,
}) => {
  // -- Hard-coded placeholder data (for demonstration) --
  const friendlyUnitName: string = 'Friendly Unit (Placeholder)';
  const enemyUnitName: string = 'Enemy Unit (Placeholder)';
  const friendlyHealth: number = 40; 
  const enemyHealth: number = 0;     
  const friendlyDamage: number = 60;
  const enemyDamage: number = 100;
  const friendlyBaseValue: number = 50;
  const enemyBaseValue: number = 45;

  // -- Friendly side normalized scores --
  const friendlyPE = friendlyData ? friendlyData.P : 0;    // Probability of detection
  const friendlyPh = friendlyData ? friendlyData.Ph : 0;   // Probability of hit
  const friendlyDr = friendlyData ? friendlyData.d_r : 0;  // Attacker accuracy term

  const peScorePercentFriendly = friendlyPE * 100;
  const phScorePercentFriendly = friendlyPh * 100;
  const drScorePercentFriendly = friendlyDr * 100;

  // -- Enemy side normalized scores --
  const enemyPE = enemyData ? enemyData.P : 0;
  const enemyPh = enemyData ? enemyData.Ph : 0;
  const enemyDr = enemyData ? enemyData.d_r : 0;

  const peScorePercentEnemy = enemyPE * 100;
  const phScorePercentEnemy = enemyPh * 100;
  const drScorePercentEnemy = enemyDr * 100;

  return (
    <>
      {/* AAR Card */}
      <Group justify="center" mt="xl" display="flex">
        <Card
          shadow="sm"
          padding="md"
          radius="md"
          withBorder
          style={{ width: '600px', textAlign: 'center' }}
          display="flex"
        >
          {/* Title Section */}
          <Card.Section withBorder inheritPadding py="xs">
            <div style={{ textAlign: 'center' }}>
              <h2>
                {enemyHealth <= 0
                  ? 'Final After Action Review'
                  : 'Round After Action Review'}
              </h2>
            </div>
          </Card.Section>

          {/* Damage Section */}
          <Card.Section withBorder inheritPadding py="xs">
            <Container>
              <Text size="xl" fw={700}>
                Damage
              </Text>
            </Container>

            {/* Friendly Damage Bar */}
            <Grid>
              <Grid.Col span={2} style={{ display: 'flex', alignItems: 'center' }}>
                <Text size="sm">{friendlyUnitName}</Text>
              </Grid.Col>
              <Grid.Col span={10}>
                <Tooltip
                  color="gray"
                  position="bottom"
                  label={`Damage: ${friendlyDamage}, Remaining: ${friendlyHealth}`}
                >
                  <Progress.Root size={30} m={10}>
                    {friendlyHealth > 0 ? (
                      <>
                        <Progress.Section
                          value={friendlyHealth}
                          color="#3d85c6"
                          key="remaining"
                        >
                          {friendlyDamage === 0 ? 'No Damage' : ''}
                        </Progress.Section>
                        <Progress.Section
                          value={friendlyDamage}
                          color="#2b5d8b"
                          key="taken"
                        >
                          -{friendlyDamage}
                        </Progress.Section>
                      </>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          width: '100%',
                        }}
                      >
                        FATAL
                      </div>
                    )}
                  </Progress.Root>
                </Tooltip>
              </Grid.Col>
            </Grid>

            {/* Enemy Damage Bar */}
            <Grid>
              <Grid.Col span={2} style={{ display: 'flex', alignItems: 'center' }}>
                <Text size="sm">{enemyUnitName}</Text>
              </Grid.Col>
              <Grid.Col span={10}>
                <Tooltip
                  color="gray"
                  position="bottom"
                  label={`Damage: ${enemyDamage}, Remaining: ${enemyHealth}`}
                >
                  <Progress.Root size={30} m={10}>
                    {enemyHealth > 0 ? (
                      <>
                        <Progress.Section
                          value={enemyHealth}
                          color="#c1432d"
                          key="remaining"
                        >
                          {enemyDamage === 0 ? 'No Damage' : ''}
                        </Progress.Section>
                        <Progress.Section
                          value={enemyDamage}
                          color="#872f1f"
                          key="taken"
                        >
                          -{enemyDamage}
                        </Progress.Section>
                      </>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          width: '100%',
                        }}
                      >
                        FATAL
                      </div>
                    )}
                  </Progress.Root>
                </Tooltip>
              </Grid.Col>
            </Grid>
          </Card.Section>

          {/* Scores Section (Attributes + the 3 new Bars for each side) */}
          <Card.Section withBorder inheritPadding py="xs">
            <Text size="xl" fw={700}>
              Scores
            </Text>

            {/* Attributes Bar */}
            <Group mt="md" style={{ justifyContent: 'center' }}>
              <Container>
                <Text size="lg" fw={500} style={{ textAlign: 'center' }}>
                  Attributes
                </Text>
                {/* Friendly Attribute Score */}
                <Tooltip label="Friendly Attribute Score" color="gray" position="bottom">
                  <Progress.Root m={10} style={{ height: '20px' }}>
                    <Progress.Section value={friendlyBaseValue} color="#3d85c6">
                      {friendlyBaseValue}
                    </Progress.Section>
                  </Progress.Root>
                </Tooltip>
                {/* Enemy Attribute Score */}
                <Tooltip label="Enemy Attribute Score" color="gray" position="bottom">
                  <Progress.Root m={10} style={{ height: '20px' }}>
                    <Progress.Section value={enemyBaseValue} color="#c1432d">
                      {enemyBaseValue}
                    </Progress.Section>
                  </Progress.Root>
                </Tooltip>
              </Container>
            </Group>

            {/* Performance Bars for the friendly side (P, Ph, d_r) */}
            <Group mt="md" style={{ justifyContent: 'center' }}>
              <Container>
                <Text fw={500} style={{ textAlign: 'center' }}>
                  Friendly PE Score
                </Text>
                <Progress.Root m={10} style={{ height: '20px' }}>
                  <Progress.Section
                    value={peScorePercentFriendly}
                    color="#3d85c6"
                  >
                    {peScorePercentFriendly.toFixed(0)}%
                  </Progress.Section>
                </Progress.Root>

                <Text fw={500} style={{ textAlign: 'center' }}>
                  Friendly Ph Score
                </Text>
                <Progress.Root m={10} style={{ height: '20px' }}>
                  <Progress.Section
                    value={phScorePercentFriendly}
                    color="#3d85c6"
                  >
                    {phScorePercentFriendly.toFixed(0)}%
                  </Progress.Section>
                </Progress.Root>

                <Text fw={500} style={{ textAlign: 'center' }}>
                  Friendly d<sub>r</sub> Score
                </Text>
                <Progress.Root m={10} style={{ height: '20px' }}>
                  <Progress.Section
                    value={drScorePercentFriendly}
                    color="#3d85c6"
                  >
                    {drScorePercentFriendly.toFixed(0)}%
                  </Progress.Section>
                </Progress.Root>
              </Container>
            </Group>

            {/* Performance Bars for the enemy side (P, Ph, d_r) */}
            <Group mt="md" style={{ justifyContent: 'center' }}>
              <Container>
                <Text fw={500} style={{ textAlign: 'center' }}>
                  Enemy PE Score
                </Text>
                <Progress.Root m={10} style={{ height: '20px' }}>
                  <Progress.Section
                    value={peScorePercentEnemy}
                    color="#c1432d"
                  >
                    {peScorePercentEnemy.toFixed(0)}%
                  </Progress.Section>
                </Progress.Root>

                <Text fw={500} style={{ textAlign: 'center' }}>
                  Enemy Ph Score
                </Text>
                <Progress.Root m={10} style={{ height: '20px' }}>
                  <Progress.Section
                    value={phScorePercentEnemy}
                    color="#c1432d"
                  >
                    {phScorePercentEnemy.toFixed(0)}%
                  </Progress.Section>
                </Progress.Root>

                <Text fw={500} style={{ textAlign: 'center' }}>
                  Enemy d<sub>r</sub> Score
                </Text>
                <Progress.Root m={10} style={{ height: '20px' }}>
                  <Progress.Section
                    value={drScorePercentEnemy}
                    color="#c1432d"
                  >
                    {drScorePercentEnemy.toFixed(0)}%
                  </Progress.Section>
                </Progress.Root>
              </Container>
            </Group>
          </Card.Section>
        </Card>
      </Group>

      {/* Engagement Data Grid (unchanged) */}
      <Grid gutter="xl" mt="md">
        {/* FRIENDLY DATA */}
        {friendlyData && (
          <Grid.Col span={6}>
            <Text size="lg" fw={700} mb="md">
              Friendly Unit Results
            </Text>
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

        {/* ENEMY DATA */}
        {enemyData && (
          <Grid.Col span={6}>
            <Text size="lg" fw={700} mb="md">
              Enemy Unit Results
            </Text>
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
    </>
  );
};

export default AfterActionReview;