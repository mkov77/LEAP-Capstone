/** BattlePage.tsx takes in a unit from the studentPage.tsx and conducts an engagement with an enemy unit that a cadet selects
The engagement continues until either the friendly or enemy unit dies and the information is logged in the After Action Reviews Page **/

import React, { useEffect, useState } from 'react';
import '@mantine/core/styles.css';
import '../App.css';
import { Table, Progress, Text, Group, Image, Stepper, Button, SegmentedControl, rem, MantineProvider, Grid, Card, Center, Select, useMantineTheme, rgba, Tooltip, Space, Container } from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import { IconSwords, IconHeartbeat, IconNumber1Small, IconNumber2Small, IconNumber3Small, IconNumber4Small } from '@tabler/icons-react';
import { useUserRole } from '../context/UserContext';
import { useUnitProvider } from '../context/UnitContext';
import { Unit } from '../components/Cards';
import classes from './battlePage.module.css';
import axios from 'axios';
import getImageSRC from '../context/imageSrc';

function unitSelection() {
    return(
        <div>
              <Grid justify='center' align='flex-start' gutter={100}>
                <Grid.Col span={4}>
                  <Card withBorder radius="md" className={classes.card} >
                    <Card.Section className={classes.imageSection} mt="md" >
                      {/* Military icon for the selected friendly unit */}
                      <Group>
                        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                          <Image
                            src={getImageSRC((unit_type ?? '').toString(), true)}
                            height={160}
                            style={{ width: 'auto', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        </div>
                      </Group>
                    </Card.Section>

                    {/* Displays a card that contains pertinent information about the selected friendly unit */}
                    <Card.Section><Center><h2>{unit_name}</h2></Center></Card.Section>
                    {unit ? (
                      <Text size="xl" style={{ whiteSpace: 'pre-line' }}>
                        <strong>Type:</strong> {unit_type}<br />
                        <Space mb="5px" />
                        <strong>Unit Size:</strong> {unit_size}<br />
                        <Space mb="5px" />
                        <strong>Force Mobility:</strong> {unit_mobility}<br />
                        <Space mb="5px" />

                        <strong>Force Readiness:</strong> {unit_readiness}<br />
                        <CustomProgressBarReadiness value={Number(getReadinessProgress(unit_readiness))} />

                        <strong>Force Skill:</strong> {unit_skill}<br />
                        <CustomProgressBarSkill value={Number(getForceSkill((unit_skill)))} />

                        <strong>Health:</strong> {friendlyHealth}<br />
                        <CustomProgressBarHealth value={Number(friendlyHealth)} />
                      </Text>
                    ) : (
                      <Text size="sm">Unit not found</Text>
                    )}
                  </Card>
                </Grid.Col>

                Displays a card that contains pertinent information about the selected enemy unit
                <Grid.Col span={4}>
                  {enemyUnit ? (
                    <Card withBorder radius="md" className={classes.card} >
                      <Card.Section className={classes.imageSection} mt="md">
                        {/* Military icon for the selected enemy unit */}

                        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                          <Image
                            src={getImageSRC((enemyUnit?.unit_type ?? '').toString(), false)}
                            height={160}
                            style={{ width: 'auto', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        </div>

                      </Card.Section>

                      <Card.Section><Center><h2>{enemyUnit.unit_name}</h2></Center></Card.Section>
                      {unit ? (
                        <Text size="xl">
                          <strong>Type:</strong> {enemyUnit.unit_type}<br />
                          <Space mb="5px" />
                          <strong>Unit Size:</strong> {enemyUnit.unit_size}<br />
                          <Space mb="5px" />
                          <strong>Force Mobility:</strong> {enemyUnit.unit_mobility}<br />
                          <Space mb="5px" />

                          <strong>Force Readiness:</strong> {enemyUnit.unit_readiness}<br />
                          <CustomProgressBarReadiness value={Number(getReadinessProgress(enemyUnit.unit_readiness))} />

                          <strong>Force Skill:</strong> {enemyUnit.unit_skill}<br />
                          <CustomProgressBarSkill value={Number(getForceSkill((enemyUnit.unit_skill)))} />

                          <strong>Health:</strong> {enemyHealth}<br />
                          <CustomProgressBarHealth value={Number(enemyHealth)} />

                        </Text>
                      ) : (
                        <Text size="sm">Unit not found</Text>
                      )}
                    </Card>
                  )
                    :
                    // Drop down menu to select the proper enemy unit to begin an engagement with
                    (
                      enemyUnits.length === 0 ? (
                        <h2>No enemy units to select</h2>
                      ) : (
                        <Select
                          label="Select Enemy Unit"
                          placeholder="Select Enemy Unit"
                          data={enemyUnits.map(eUnit => ({ value: eUnit.unit_id.toString(), label: eUnit.unit_name }))}
                          searchable
                          value={enemyUnit}
                          onChange={handleSelectEnemy}
                        />
                      )
                    )}
                </Grid.Col>
              </Grid>

              {/* Buttons to start and engagement or deselect the previously selected enemy unit */}
              <Group justify="center" mt="xl">
                {(!inEngagement && enemyUnit) ?
                  (<Button onClick={handleDeselectEnemy} disabled={enemyUnit ? false : true} color='red'>Deselect Enemy Unit</Button>) :
                  (<></>)
                }
                <Button onClick={handleStartEngagement} disabled={enemyUnit ? false : true}>{inEngagement ? 'Start Round' : 'Start Engagement'}</Button>
              </Group>
            </div>
    )

}


export default unitSelection