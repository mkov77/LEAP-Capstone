import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell, Group, useMantineTheme, Image, Button, Switch, rem, Divider, MantineProvider, SegmentedControl, } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconX} from '@tabler/icons-react';
import { useUserRole } from '../context/UserContext';
import { FaArrowAltCircleLeft } from "react-icons/fa";
import Hierarchy from '../components/HierarchyBuilder';
import logo from '../images/logo/Tr_FullColor_NoSlogan.png'
import axios from 'axios';
// export interface Engagement {
//   engagementID: string;
//   sectionID: string;
//   timeStamp: string;
//   friendlyID: string;
//   enemyID: string;
//   isWin: boolean;
//   friendlyHealth: number;
//   enemyHealth: number;
//   isCurrentState: boolean;
// }

function SectionControls() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const [mobileOpened] = useDisclosure(false);
  const [desktopOpened] = useDisclosure(false);
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const [sectionOnline, setSectionOnline] = useState(false);
  const { userRole, setUserSection } = useUserRole();
  const [isFriendlyHierarchy, setIsFriendlyHierarchy] = useState('Friendly');
  const [refreshHierarchy, setRefreshHierarchy] = useState(0);

  setUserSection(sectionId);

  useEffect(() => {
    if (userRole !== 'Administrator') {
      navigate('/');
    }
  }, [navigate, userRole]);

  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/sections/${sectionId}`);
        console.log("We are here: ", sectionId);
        if (response.ok) {
          const sectionData = await response.json();
          setSectionOnline(sectionData.isonline);
        } else {
          console.error('Failed to fetch section data');
        }
      } catch (error) {
        console.error('Error fetching section data:', error);
      }
    };

    fetchSectionData();
  }, [sectionId]);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleArrowClick = () => {
    navigate('/admin');
  };

  const toggleSectionOnline = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/sections/${sectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isonline: !sectionOnline }),
      });

      if (!response.ok) {
        throw new Error('Failed to update section status');
      }

      setSectionOnline((prev) => !prev);
    } catch (error) {
      console.error('Error toggling section online status:', error);
    }
  };

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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button size='sm' variant='link' onClick={handleArrowClick} style={{ margin: '10px' }}>
              <FaArrowAltCircleLeft />
            </Button>
            <Image
              src={logo}
              radius="md"
              h={50}
              fallbackSrc="https://placehold.co/600x400?text=Placeholder"
              onClick={handleLogoClick}
              style={{ cursor: 'pointer', scale: '1', padding: '8px' }}
            />
          </div>
        </AppShell.Header>
        <AppShell.Main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1><strong>{sectionId}</strong> Controls </h1>
          </div>
          <div>

          </div>
              <Divider my="md" />
              <Switch
                checked={sectionOnline}
                onChange={toggleSectionOnline}
                color={sectionOnline ? 'teal' : 'red'}
                size="md"
                label={sectionOnline ? 'Section Online' : 'Section Offline'}
                thumbIcon={
                  sectionOnline ? (
                    <IconCheck
                      style={{ width: rem(12), height: rem(12) }}
                      color={theme.colors.teal[6]}
                      stroke={3}
                    />
                  ) : (
                    <IconX
                      style={{ width: rem(12), height: rem(12) }}
                      color={theme.colors.red[6]}
                      stroke={3}
                    />
                  )
                }
              />
              <Divider my="md" />

                     {/*
              <Table style={{ marginTop: 20 }}>
                <thead>
                  <tr>
                    <th>Engagement ID</th>
                    <th>Section ID</th>
                    <th>Time Stamp</th>
                    <th>Friendly ID</th>
                    <th>Enemy ID</th>
                    <th>Is Win</th>
                    <th>Friendly Health</th>
                    <th>Enemy Health</th>
                    <th>Is Current State</th>
                  </tr>
                </thead>
                <tbody>
                  {engagementsData.map((engagement) => (
                    <tr
                      key={engagement.engagementID}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedEngagement === engagement ? theme.colors.gray[0] : '',
                      }}
                      onClick={() => handleRowClick(engagement)}
                    >
                      <td>{engagement.engagementID}</td>
                      <td>{engagement.sectionID}</td>
                      <td>{engagement.timeStamp}</td>
                      <td>{engagement.friendlyID}</td>
                      <td>{engagement.enemyID}</td>
                      <td>
                        <Box
                          style={{
                            padding: '4px',
                            borderRadius: '4px',
                            backgroundColor: engagement.isWin ? theme.colors.green[0] : theme.colors.red[0],
                            color: engagement.isWin ? theme.colors.green[9] : theme.colors.red[9],
                          }}
                        >
                          {engagement.isWin.toString()}
                        </Box>
                      </td>
                      <td>{engagement.friendlyHealth}</td>
                      <td>{engagement.enemyHealth}</td>
                      <td>
                        <Box
                          style={{
                            padding: '4px',
                            borderRadius: '4px',
                            backgroundColor: engagement.isCurrentState ? theme.colors.green[0] : theme.colors.red[0],
                            color: engagement.isCurrentState ? theme.colors.green[9] : theme.colors.red[9],
                          }}
                        >
                          {engagement.isCurrentState.toString()}
                        </Box>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Button
                disabled={!selectedEngagement || selectedEngagement.isCurrentState}
                onClick={restoreState}
                color="blue"
                style={{ marginTop: 20 }}
              >
                Restore state
              </Button> */}

              <Group>
                <SegmentedControl
                  value={isFriendlyHierarchy}
                  onChange={setIsFriendlyHierarchy}
                  size='xl'
                  data={[
                    { label: 'Friendly Force Structure', value: 'Friendly' },
                    { label: 'Enemy Force Structure', value: 'Enemy' }
                  ]}
                />
                
                
              </Group>
              <Hierarchy is_friendly={isFriendlyHierarchy === 'Friendly'} hierarchyRefresh={refreshHierarchy} xCoord={1250} yCoord={70}/>

        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default SectionControls;