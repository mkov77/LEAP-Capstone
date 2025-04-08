import React from 'react';
import { Progress, Tooltip } from '@mantine/core';
import classes from './engagement.module.css';

interface DamageProgressProps {
  originalHealth: number;
  remainingHealth: number;
  remainingColor: string;  // Color for the portion representing remaining health
  damageColor: string;     // Color for the portion representing damage taken
}

const DamageProgress: React.FC<DamageProgressProps> = ({
  originalHealth,
  remainingHealth,
  remainingColor,
  damageColor,
}) => {
  const damageTaken = Math.max(0, originalHealth - remainingHealth);
  
  return (
    <Tooltip
      color="gray"
      position="bottom"
      transitionProps={{ transition: 'fade-up', duration: 400 }}
      label={`Damage: ${Math.round(damageTaken)}, Remaining: ${Math.round(remainingHealth)}`}
    >
      <Progress.Root size={30} classNames={{ label: classes.progressLabel }} m={10}>
        {remainingHealth > 0 ? (
          <>
            <Progress.Section value={remainingHealth} color={remainingColor} key="remaining" />
            <Progress.Section value={damageTaken} color={damageColor} key="taken" />
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
  );
};

export default DamageProgress;