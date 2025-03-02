import React from 'react';
import { Group, Progress } from '@mantine/core';

interface ProgressBarProps {
  value: number;
}

// Sets color of Force Readiness bar based on readiness value
export const CustomProgressBarReadiness: React.FC<ProgressBarProps> = ({ value }) => {
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
      <Progress
        size="xl"
        color={color}
        value={value > 0 ? 100 : 0}
        transitionDuration={0}
      />
      <Progress size="xl" color={color} transitionDuration={0} value={value < 30 ? 0 : 100} />
      <Progress size="xl" color={color} transitionDuration={0} value={value < 50 ? 0 : 100} />
      <Progress size="xl" color={color} transitionDuration={0} value={value < 70 ? 0 : 100} />
    </Group>
  );
};

// Sets color of the Force Skill bar based on skill value
export const CustomProgressBarSkill: React.FC<ProgressBarProps> = ({ value }) => {
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
      <Progress
        size="xl"
        color={color}
        value={value > 0 ? 100 : 0}
        transitionDuration={0}
      />
      <Progress size="xl" color={color} transitionDuration={0} value={value < 30 ? 0 : 100} />
      <Progress size="xl" color={color} transitionDuration={0} value={value < 50 ? 0 : 100} />
      <Progress size="xl" color={color} transitionDuration={0} value={value < 70 ? 0 : 100} />
    </Group>
  );
};

// Sets color of the Unit Health bar based on health value
export const CustomProgressBarHealth: React.FC<ProgressBarProps> = ({ value }) => {
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

  return (
    <Progress value={value} color={color} size="xl" mb="xs" />
  );
};
