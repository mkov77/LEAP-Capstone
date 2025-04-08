import React from 'react';
import {
  Grid,
  Text,
  Group,
  Card,
  Container,
  Progress,
  Tooltip,
} from '@mantine/core';
import { EngagementData } from './calculateEngagement';
import DamageProgress from './DamageProgress';

interface AfterActionReviewProps {
  friendlyData: EngagementData | null;
  enemyData: EngagementData | null;
  round: number; // Round number to display in the header
}

const AfterActionReview: React.FC<AfterActionReviewProps> = ({
  friendlyData,
  enemyData,
  round,
}) => {
  const friendlyUnitName = 'Friendly ID';
  const enemyUnitName = 'Enemy ID';

  // Get initial and final health values from engagement data.
  // Fallback to 1 if missing (to avoid division issues)
  const friendlyInitialHealth = friendlyData?.Fi ?? 1;
  const enemyInitialHealth = enemyData?.Fi ?? 1;
  const friendlyFinalHealth = friendlyData?.Fn ?? 1;
  const enemyFinalHealth = enemyData?.Fn ?? 1;

  // Calculate damage taken (rounded)
  const friendlyDamageTaken = Math.round(friendlyInitialHealth - friendlyFinalHealth);
  const enemyDamageTaken = Math.round(enemyInitialHealth - enemyFinalHealth);

  // Compute Phase Scores (as percentages)
  const detectionScoreFriendly = (friendlyData?.P ?? 0) * 100;
  const engagementScoreFriendly = (friendlyData?.Ph ?? 0) * 100;
  const accuracyScoreFriendly = (friendlyData?.d_r ?? 0) * 100;

  const detectionScoreEnemy = (enemyData?.P ?? 0) * 100;
  const engagementScoreEnemy = (enemyData?.Ph ?? 0) * 100;
  const accuracyScoreEnemy = (enemyData?.d_r ?? 0) * 100;

  // Determine first strike text based on detection probability (P)
  let firstStrikeText = '';
  if (friendlyData && enemyData) {
    if (friendlyData.P > enemyData.P) {
      firstStrikeText = 'First Strike: FRIENDLY';
    } else if (enemyData.P > friendlyData.P) {
      firstStrikeText = 'First Strike: ENEMY';
    } else {
      firstStrikeText = 'Neither unit achieved a clear first strike.';
    }
  }

  return (
    <Group justify="center" mt="xl">
      <Card
        shadow="sm"
        padding="md"
        radius="md"
        withBorder
        style={{ width: '650px', textAlign: 'center' }}
      >
        {/* Header */}
        <Card.Section withBorder inheritPadding py="xs">
          <Text fw={700} size="lg">
            Round {round} Results
          </Text>
        </Card.Section>

        {/* Damage Section */}
        <Card.Section withBorder inheritPadding py="xs">
          <Text fw={700} size="lg">
            FINAL DAMAGE 
          </Text>
          <Container className="progress-container" style={{ marginBottom: '10px' }}>
            {/* Friendly Damage Bar */}
            <Group justify="space-between" style={{ marginBottom: '4px' }}>
              <Text fw={600} size="sm">
                {friendlyUnitName}
              </Text>
              <Text fw={600} size="sm">
                {`Damage: ${friendlyDamageTaken} | HP: ${Math.round(friendlyFinalHealth)}`}
              </Text>
            </Group>
            <DamageProgress
              originalHealth={friendlyInitialHealth}
              remainingHealth={friendlyFinalHealth}
              remainingColor="#3d85c6"
              damageColor="#2b5d8b"
            />

            {/* Enemy Damage Bar */}
            <Group justify="space-between" style={{ marginBottom: '4px', marginTop: '8px' }}>
              <Text fw={600} size="sm">
                {enemyUnitName}
              </Text>
              <Text fw={600} size="sm">
                {`Damage: ${enemyDamageTaken} | HP: ${Math.round(enemyFinalHealth)}`}
              </Text>
            </Group>
            <DamageProgress
              originalHealth={enemyInitialHealth}
              remainingHealth={enemyFinalHealth}
              remainingColor="#c1432d"
              damageColor="#872f1f"
            />
          </Container>
        </Card.Section>

        {/* Phase Scores Section */}
        <Card.Section withBorder inheritPadding py="xs">
          <Text fw={700} size="lg">
            PHASE BREAKDOWN
          </Text>
          {[
            { name: 'Detection', friendly: detectionScoreFriendly, enemy: detectionScoreEnemy },
            { name: 'Engagement', friendly: engagementScoreFriendly, enemy: engagementScoreEnemy },
            { name: 'Accuracy', friendly: accuracyScoreFriendly, enemy: accuracyScoreEnemy },
          ].map(({ name, friendly, enemy }) => (
            <Container
              key={name}
              mt="md"
              className="progress-container"
              style={{ marginBottom: '8px' }}
            >
              <Text fw={600} tt="uppercase" style={{ marginBottom: '4px' }}>
                {name}
              </Text>
              {name === 'Detection' && (
                <Text fw={500} style={{ textTransform: 'none', marginBottom: '4px' }}>
                  {firstStrikeText}
                </Text>
              )}
              {/* Friendly Phase Score Progress Bar */}
              <Container style={{ position: 'relative', marginBottom: '6px' }}>
                <Progress size={30} radius="sm" value={friendly} color="#3d85c6" />
                <Text
                  size="xs"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    fontWeight: 500,
                    zIndex: 1,
                  }}
                >
                  {friendly.toFixed(0)}%
                </Text>
              </Container>
              {/* Enemy Phase Score Progress Bar */}
              <Container style={{ position: 'relative', marginBottom: '6px' }}>
                <Progress size={30} radius="sm" value={enemy} color="#c1432d" />
                <Text
                  size="xs"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    fontWeight: 500,
                    zIndex: 1,
                  }}
                >
                  {enemy.toFixed(0)}%
                </Text>
              </Container>
            </Container>
          ))}
        </Card.Section>

        {/* Final Detailed Results Section */}
        <Card.Section withBorder inheritPadding py="xs">
          <Text fw={700} size="lg">
            DETAILED RESULTS
          </Text>
          <Grid gutter="md" mt="xs">
            {/* Friendly Detailed Results */}
            <Grid.Col span={6}>
              <Text fw={600} size="sm">Friendly Unit Results</Text>
              <Text size="sm">Field of View (w): {friendlyData?.w.toFixed(2)}</Text>
              <Text size="sm">Area Covered (A): {friendlyData?.A.toFixed(2)}</Text>
              <Text size="sm">Time Detecting (t): {friendlyData?.t.toFixed(2)}</Text>
              <Text size="sm">Detection (P): {friendlyData?.P.toFixed(4)}</Text>
              <Text size="sm">Radius (r): {friendlyData?.r.toFixed(2)}</Text>
              <Text size="sm">Accuracy (σ): {friendlyData?.sigma.toFixed(2)}</Text>
              <Text size="sm">Hit Prob. (Ph): {friendlyData?.Ph.toFixed(4)}</Text>
              <Text size="sm">Range (b): {friendlyData?.b.toFixed(2)}</Text>
              <Text size="sm">d(r): {friendlyData?.d_r.toFixed(4)}</Text>
              <Text size="sm">Max Damage (d_mi): {friendlyData?.d_mi.toFixed(2)}</Text>
              <Text size="sm">Damage Dealt (D): {friendlyData?.D.toFixed(2)}</Text>
              <Text size="sm">Initial HP (Fi): {friendlyData?.Fi.toFixed(2)}</Text>
              <Text size="sm">Final HP (Fn): {friendlyData?.Fn.toFixed(2)}</Text>
            </Grid.Col>
            {/* Enemy Detailed Results */}
            <Grid.Col span={6}>
              <Text fw={600} size="sm">Enemy Unit Results</Text>
              <Text size="sm">Field of View (w): {enemyData?.w.toFixed(2)}</Text>
              <Text size="sm">Area Covered (A): {enemyData?.A.toFixed(2)}</Text>
              <Text size="sm">Time Detecting (t): {enemyData?.t.toFixed(2)}</Text>
              <Text size="sm">Detection (P): {enemyData?.P.toFixed(4)}</Text>
              <Text size="sm">Radius (r): {enemyData?.r.toFixed(2)}</Text>
              <Text size="sm">Accuracy (σ): {enemyData?.sigma.toFixed(2)}</Text>
              <Text size="sm">Hit Prob. (Ph): {enemyData?.Ph.toFixed(4)}</Text>
              <Text size="sm">Range (b): {enemyData?.b.toFixed(2)}</Text>
              <Text size="sm">d(r): {enemyData?.d_r.toFixed(4)}</Text>
              <Text size="sm">Max Damage (d_mi): {enemyData?.d_mi.toFixed(2)}</Text>
              <Text size="sm">Damage Dealt (D): {enemyData?.D.toFixed(2)}</Text>
              <Text size="sm">Initial HP (Fi): {enemyData?.Fi.toFixed(2)}</Text>
              <Text size="sm">Final HP (Fn): {enemyData?.Fn.toFixed(2)}</Text>
            </Grid.Col>
          </Grid>
        </Card.Section>
      </Card>
    </Group>
  );
};

export default AfterActionReview;