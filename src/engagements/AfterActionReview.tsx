import React from 'react';
import {
  Grid,
  Text,
  Group,
  Card,
  Container,
  Progress,
  Tooltip
} from '@mantine/core';
import { EngagementData } from './calculateEngagement';

interface AfterActionReviewProps {
  friendlyData: EngagementData | null;
  enemyData: EngagementData | null;
}

const AfterActionReview: React.FC<AfterActionReviewProps> = ({
  friendlyData,
  enemyData,
}) => {
  const friendlyUnitName = 'Friendly ID';
  const enemyUnitName = 'Enemy ID';

  // Current Health and Damage
  const friendlyHealth = friendlyData?.Fn ?? 40;
  const enemyHealth = enemyData?.Fn ?? 51.85;
  const friendlyDamage = friendlyData?.D ?? 18.15;
  const enemyDamage = enemyData?.D ?? 11.36;

  // Compute Phase Scores
  const detectionScoreFriendly = (friendlyData?.P ?? 0) * 100;
  const engagementScoreFriendly = (friendlyData?.Ph ?? 0) * 100;
  const accuracyScoreFriendly = (friendlyData?.d_r ?? 0) * 100;

  const detectionScoreEnemy = (enemyData?.P ?? 0) * 100;
  const engagementScoreEnemy = (enemyData?.Ph ?? 0) * 100;
  const accuracyScoreEnemy = (enemyData?.d_r ?? 0) * 100;

  // Determine which unit achieved first strike based on detection probability (P)
  let firstStrikeText = '';
  if (friendlyData && enemyData) {
    if (friendlyData.P > enemyData.P) {
      firstStrikeText = 'Friendly Unit achieved First Strike!';
    } else if (enemyData.P > friendlyData.P) {
      firstStrikeText = 'Enemy Unit achieved First Strike!';
    } else {
      firstStrikeText = 'Neither unit achieved a clear first strike.';
    }
  }

  return (
    <Group justify="center" mt="xl">
      <Card shadow="sm" padding="md" radius="md" withBorder style={{ width: '650px', textAlign: 'center' }}>
        <Card.Section withBorder inheritPadding py="xs">
          <Text fw={700} size="lg">After Action Review</Text>
          {/* Display first strike information */}
          <Text fw={700} size="md" mt="xs">
            {firstStrikeText}
          </Text>
        </Card.Section>

        {/* Phase Scores */}
        <Card.Section withBorder inheritPadding py="xs">
          <Text fw={700} size="lg">Phase Scores</Text>
          {[
            { name: 'Detection', friendly: detectionScoreFriendly, enemy: detectionScoreEnemy },
            { name: 'Engagement', friendly: engagementScoreFriendly, enemy: engagementScoreEnemy },
            { name: 'Accuracy', friendly: accuracyScoreFriendly, enemy: accuracyScoreEnemy }
          ].map(({ name, friendly, enemy }) => (
            <Container key={name} mt="md" className="progress-container">
              <Text fw={500}>{name}</Text>

              <Tooltip label={`${friendly.toFixed(0)}%`} position="top">
                <Progress size={20} radius="md" value={friendly} color="#3d85c6" style={{ marginBottom: '8px' }} />
              </Tooltip>

              <Tooltip label={`${enemy.toFixed(0)}%`} position="top">
                <Progress size={20} radius="md" value={enemy} color="#c1432d" style={{ marginBottom: '8px' }} />
              </Tooltip>
            </Container>
          ))}
        </Card.Section>

        {/* Damage Section */}
        <Card.Section withBorder inheritPadding py="xs">
          <Text fw={700} size="lg">Damage</Text>
          <Container className="progress-container">
            <Group justify="space-between">
              <Text fw={500} size="sm">{friendlyUnitName}</Text>
              <Text fw={500} size="sm">{`-${friendlyDamage.toFixed(0)}`}</Text>
            </Group>

            <Tooltip label={`HP: ${friendlyHealth.toFixed(0)}`} position="top">
              <Progress size={20} radius="md" value={friendlyHealth} color="#3d85c6" style={{ marginBottom: '8px' }} />
            </Tooltip>

            <Group justify="space-between">
              <Text fw={500} size="sm">{enemyUnitName}</Text>
              <Text fw={500} size="sm">{`-${enemyDamage.toFixed(0)}`}</Text>
            </Group>

            <Tooltip label={`HP: ${enemyHealth.toFixed(0)}`} position="top">
              <Progress size={20} radius="md" value={enemyHealth} color="#c1432d" style={{ marginBottom: '8px' }} />
            </Tooltip>
          </Container>
        </Card.Section>
      </Card>

      {/* Engagement Data Grid (Kept at Bottom) */}
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
    </Group>
  );
};

export default AfterActionReview;