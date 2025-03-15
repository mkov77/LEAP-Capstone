// AfterActionReview.tsx

import React from 'react';
import { Grid, Text } from '@mantine/core';
import { EngagementData } from './calculateEngagement'; // <-- adjust import path if needed

interface AfterActionReviewProps {
  friendlyData: EngagementData | null;
  enemyData: EngagementData | null;
}

const AfterActionReview: React.FC<AfterActionReviewProps> = ({
  friendlyData,
  enemyData,
}) => {
  return (
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
  );
};

export default AfterActionReview;