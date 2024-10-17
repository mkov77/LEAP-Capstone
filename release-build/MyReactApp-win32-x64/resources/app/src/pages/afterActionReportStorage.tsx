//afterActionReviewStorage.tsx
import React, { useState, useEffect } from 'react';
import {
  AppShell,
  Group,
  Image,
  Table,
  Button,
  MantineProvider,
  Progress,
  Card,
  Collapse,
  Tooltip,
  Text
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowAltCircleLeft } from "react-icons/fa";
import classes from './TableReviews.module.css';
import axios from 'axios';
import logo from '../images/logo/Tr_FullColor_NoSlogan.png'


export interface recentEngagementData {
  unit_type: string;
  role_type: string;
  unit_size: string;
  force_posture: string;
  force_mobility: string;
  force_readiness: string;
  force_skill: string;
  section: number;
}

export interface Tactics {
  question: string;
  friendlyawareness?: number;
  enemyawareness?: number;
  friendlylogistics?: number;
  enemylogistics?: number;
  friendlycoverage?: number;
  enemycoverage?: number;
  friendlygps?: number;
  enemygps?: number;
  friendlycomms?: number;
  enemycomms?: number;
  friendlyfire?: number;
  enemyfire?: number;
  friendlypattern?: number;
  enemypattern?: number;
  engagementid?: number;
}

export interface Engagement {
  friendlyid: string;
  enemyid: string;
  engagementid: string;
  friendlybasescore: string;
  enemybasescore: string;
  friendlytacticsscore: string;
  enemytacticsscore: string;
  friendlytotalscore: number;
  enemytotalscore: number;
}


export default function AAR() {
  const navigate = useNavigate();
  const [mobileOpened] = useDisclosure(false);
  const [desktopOpened] = useDisclosure(false);
  const { sectionId } = useParams(); // Retrieve sectionId from route parameters
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [tacticsMap, setTacticsMap] = useState<Map<string, Tactics[]>>(new Map()); // Changed: Added `tacticsMap` state for storing tactics data


  const handleLogoClick = () => {
    navigate('/'); // Navigate to the main login page
  };

  const handleArrowClick = () => {
    navigate(`/studentPage/${sectionId}`);
  };

  const handleAARClick = () => {
    navigate(`/studentPage/${sectionId}`)
  }


  useEffect(() => {
    const fetchEngagementData = async () => {
      try {
        console.log('Fetching data for engagement:', sectionId);
        const response = await axios.get<Engagement[]>(`http://localhost:5000/api/engagements/${sectionId}`, {
          params: {
            sectionid: sectionId  // Pass userSection as a query parameter
          }
        });
        setEngagements(response.data);




        const tacticsPromises = response.data.map(async (engagement) => {
          const tacticsResponse = await axios.get<Tactics[]>(`http://localhost:5000/api/tactics/${engagement.engagementid}`);
          return { engagementId: engagement.engagementid, tactics: tacticsResponse.data };
        });

        const tacticsData = await Promise.all(tacticsPromises);

        const tacticsMap = new Map<string, Tactics[]>();
        tacticsData.forEach((tacticsItem) => {
          tacticsMap.set(tacticsItem.engagementId, tacticsItem.tactics);
        });

        setTacticsMap(tacticsMap);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchEngagementData();
  }, [sectionId]);

  const renderTacticsRows = (tactics: Tactics[] | undefined) => { // Changed: Added `renderTacticsRows` function for rendering tactics rows
    if (!tactics || tactics.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={3} align="center">No tactics data available</Table.Td>
        </Table.Tr>
      );
    }
    return tactics.map((tactic, index) => (
      <React.Fragment key={index}>
        <Table.Tr key={`tactic-${index}-awareness`}>
          <Table.Td>Aware of OPFOR?</Table.Td>
          <Table.Td>{Number(tactic.friendlyawareness) * 20}</Table.Td>
          <Table.Td>{Number(tactic.enemyawareness) * 20}</Table.Td>
        </Table.Tr>
        <Table.Tr key={`tactic-${index}-logistics`}>
          <Table.Td>Within Logistics Support Range?</Table.Td>
          <Table.Td>{Number(tactic.friendlylogistics) * 25}</Table.Td>
          <Table.Td>{Number(tactic.enemylogistics) * 25}</Table.Td>
        </Table.Tr>
        <Table.Tr key={`tactic-${index}-coverage`}>
          <Table.Td>Within RPA/ISR Coverage?</Table.Td>
          <Table.Td>{Number(tactic.friendlycoverage) * 10}</Table.Td>
          <Table.Td>{Number(tactic.enemycoverage) * 10}</Table.Td>
        </Table.Tr>
        <Table.Tr key={`tactic-${index}-gps`}>
          <Table.Td>Working GPS?</Table.Td>
          <Table.Td>{Number(tactic.friendlygps) * 10}</Table.Td>
          <Table.Td>{Number(tactic.enemygps) * 10}</Table.Td>
        </Table.Tr>
        <Table.Tr key={`tactic-${index}-comms`}>
          <Table.Td>Within Communications Range?</Table.Td>
          <Table.Td>{Number(tactic.friendlycomms) * 10}</Table.Td>
          <Table.Td>{Number(tactic.enemycomms) * 10}</Table.Td>
        </Table.Tr>
        <Table.Tr key={`tactic-${index}-fire`}>
          <Table.Td>Within Fire Support Range?</Table.Td>
          <Table.Td>{Number(tactic.friendlyfire) * 15}</Table.Td>
          <Table.Td>{Number(tactic.enemyfire) * 15}</Table.Td>
        </Table.Tr>
        <Table.Tr key={`tactic-${index}-pattern`}>
          <Table.Td>Within Range of a Pattern Force?</Table.Td>
          <Table.Td>{Number(tactic.friendlypattern) * 10}</Table.Td>
          <Table.Td>{Number(tactic.enemypattern) * 10}</Table.Td>
        </Table.Tr>

      </React.Fragment>

    ));
  };

  const [isOpen, setIsOpen] = useState<boolean[]>(Array(engagements.length).fill(false));

  const handleToggle = (index: number) => {
    setIsOpen(prev => {
      const newState = [...prev]; // Create a copy of isOpen array
      newState[index] = !newState[index]; // Toggle the state of the clicked row
      return newState;
    });
  };

  // const row = engagements.map((rowData) => (
  //   <Table.Tr key={rowData.engagementid}>
  //     <Table.Td>{rowData.friendlyid}</Table.Td>
  //     <Table.Td>{rowData.engagementid}</Table.Td>
  //     <Table.Td>{rowData.friendlyid}</Table.Td>
  //     <Table.Td>
  //       <Progress.Root style={{ width: '600px', height: '50px' }}>
  //         <Progress.Section
  //           className={classes.progressSection}
  //           value={rowData.friendlytotalscore}
  //           color="#4e87c1">
  //         </Progress.Section>
  //       </Progress.Root>
  //     </Table.Td>
  //     <Table.Td>{rowData.enemyid}</Table.Td>
  //     <Table.Td>
  //       <Progress.Root style={{ width: '600px', height: '50px' }}>
  //         <Progress.Section
  //           className={classes.progressSection}
  //           value={rowData.enemytotalscore}
  //           color="#bd3058">
  //         </Progress.Section>
  //       </Progress.Root>
  //     </Table.Td>
  //   </Table.Tr>
  // ));


  return (
    <MantineProvider defaultColorScheme='dark'>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
        }}
        padding="md"
      >

        <AppShell.Header>
          <Group h="100%" justify="space-between" px="md" align="center">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: "space-between" }}>
              <Button size='sm' variant='link' onClick={handleArrowClick} style={{ margin: '10px' }}><FaArrowAltCircleLeft /> </Button>
              <Image
                src={logo}
                radius="md"
                h={50}
                fallbackSrc="https://placehold.co/600x400?text=Placeholder"
                onClick={handleLogoClick}
                style={{ cursor: 'pointer', scale: '1', padding: '8px' }}
              />
            </div>
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          <div style={{ justifyContent: 'right', display: 'flex' }}>
            <Button size='sm' variant='link' onClick={handleAARClick} style={{ margin: '10px ' }}>Return</Button>
          </div>
          <h1 style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>After Action Reviews</h1>
          <h2 style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>Section: {sectionId}</h2>
          <AppShell>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '45vh' }}>
              <Card shadow="sm" radius="md" withBorder style={{ display: 'grid', height: '40vh', width: '600px', placeItems: 'center', marginBottom: '125px', marginTop: '100px', textAlign: 'center' }}>
                <Card.Section >
                  <div style={{ textAlign: 'center'}}>
                    <h2 style={{ marginTop: 10 }}>Most Recent Round</h2>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 30}}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Text>{engagements[engagements.length - 1]?.friendlyid}</Text>
                      <Tooltip
                        position="bottom"
                        color="gray"
                        transitionProps={{ transition: 'fade-up', duration: 300 }}
                        label="Overall Score Out of 100"
                      >
                        <Progress.Root style={{ width: '200px', height: '25px' }}>
                          <Progress.Section
                            className={classes.progressSection}
                            value={Number(engagements[engagements.length - 1]?.friendlytotalscore)}
                            color='#3d85c6'>
                            {Number(engagements[engagements.length - 1]?.friendlytotalscore).toFixed(0)}
                          </Progress.Section>
                        </Progress.Root>
                      </Tooltip>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Text>{engagements[engagements.length - 1]?.enemyid}</Text>
                      <Tooltip
                        position="bottom"
                        color="gray"
                        transitionProps={{ transition: 'fade-up', duration: 300 }}
                        label="Overall Score Out of 100"
                      >
                        <Progress.Root style={{ width: '200px', height: '25px' }}>
                          <Progress.Section
                            className={classes.progressSection}
                            value={Number(engagements[engagements.length - 1]?.enemytotalscore)}
                            color='#c1432d'>
                            {Number(engagements[engagements.length - 1]?.enemytotalscore).toFixed(0)}
                          </Progress.Section>
                        </Progress.Root>
                      </Tooltip>
                    </div>
                  </div>
                  <Table verticalSpacing={'xs'} style={{ width: '600px', justifyContent: 'center'}}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Tactic</Table.Th>
                        <Table.Th>Friendly Score</Table.Th>
                        <Table.Th>Enemy Score</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{(engagements.length > 0) && renderTacticsRows(tacticsMap.get(engagements[engagements.length - 1].engagementid))}
                    </Table.Tbody>
                  </Table>
                </Card.Section>
              </Card>
            </div>
            <Table verticalSpacing={'xs'} style={{ width: '100%', tableLayout: 'fixed', justifyContent: 'space-between' }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Round ID</Table.Th>
                  <Table.Th>Friendly Unit Name</Table.Th>
                  <Table.Th>Friendly Total Score</Table.Th>
                  <Table.Th>Enemy Unit Name</Table.Th>
                  <Table.Th>Enemy Total Score</Table.Th>
                </Table.Tr>
              </Table.Thead>
              {engagements.map((row, index) => (
                <Table.Tbody key={index}>
                  <Table.Tr key={row.engagementid} >
                    <Table.Td>{row.engagementid}</Table.Td>
                    <Table.Td>{row.friendlyid}</Table.Td>
                    <Table.Td>
                      <Tooltip
                        position="bottom"
                        color="gray"
                        transitionProps={{ transition: 'fade-up', duration: 300 }}
                        label="Overall Score Out of 100"
                      >
                        <Progress.Root style={{ width: '200px', height: '25px' }}>

                          <Progress.Section
                            className={classes.progressSection}
                            value={row.friendlytotalscore}
                            color='#3d85c6'>
                            {Number(row.friendlytotalscore).toFixed(0)}
                          </Progress.Section>

                        </Progress.Root>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td>{row.enemyid}</Table.Td>
                    <Table.Td>
                      <Tooltip
                        position="bottom"
                        color="gray"
                        transitionProps={{ transition: 'fade-up', duration: 300 }}
                        label="Overall Score Out of 100"
                      >
                        <Progress.Root style={{ width: '200px', height: '25px', display: 'flex' }}>

                          <Progress.Section
                            className={classes.progressSection}
                            value={row.enemytotalscore}
                            color='#c1432d'>
                            {Number(row.enemytotalscore).toFixed(0)}
                          </Progress.Section>

                        </Progress.Root>
                      </Tooltip>
                    </Table.Td>

                    <Table.Td style={{ display: 'flex' }}>
                      <Button className='.toggle-details' size="xs" onClick={() => handleToggle(index)}>
                        {isOpen[index] ? 'Collapse' : 'Expand'}
                      </Button>
                    </Table.Td>
                  </Table.Tr>

                  <Table.Tr style={{ display: 'flex', justifyContent: 'center', width: '100%', marginLeft: '255%' }}>
                    <Collapse in={isOpen[index]} style={{ width: '100%' }}>

                      <Table verticalSpacing={'xs'} style={{ maxWidth: '100%', width: '1000px' }} display={'fixed'}>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th style={{ width: '1000px' }}>Tactic</Table.Th>
                            <Table.Th style={{ width: '250px', marginLeft: '100px' }}>Friendly Score</Table.Th>
                            <Table.Th style={{ width: '150px', marginLeft: '100px' }}>Enemy Score</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{renderTacticsRows(tacticsMap.get(row.engagementid))}</Table.Tbody>
                      </Table>

                    </Collapse>
                  </Table.Tr>
                </Table.Tbody>
              ))}
            </Table>
          </AppShell>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

