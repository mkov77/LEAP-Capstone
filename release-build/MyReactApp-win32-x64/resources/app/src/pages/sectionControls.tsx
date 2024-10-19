import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell, Group, useMantineTheme, Image, Button, Switch, rem, Divider, MantineProvider, SegmentedControl } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useUserRole } from '../context/UserContext';
import { FaArrowAltCircleLeft } from 'react-icons/fa';
import Hierarchy from '../components/HierarchyBuilder';
import logo from '../images/logo/Tr_FullColor_NoSlogan.png';
import axios from 'axios';

function SectionControls() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const [mobileOpened] = useDisclosure(false);
  const [desktopOpened] = useDisclosure(false);
  const navigate = useNavigate();
  const theme = useMantineTheme();
  
  const [sectionOnline, setSectionOnline] = useState<boolean | null>(null); // null as initial value for loading state
  const { userRole, setUserSection } = useUserRole();
  const [isFriendlyHierarchy, setIsFriendlyHierarchy] = useState('Friendly');
  const [refreshHierarchy, setRefreshHierarchy] = useState(0);

  // Use useEffect to avoid calling setUserSection every render
  useEffect(() => {
    setUserSection(sectionId);
  }, [sectionId, setUserSection]);

  // Redirect if the user is not an administrator
  useEffect(() => {
    if (userRole !== 'Administrator') {
      navigate('/');
    }
  }, [navigate, userRole]);

  // Fetch section status from the new endpoint
  useEffect(() => {

    console.log("!!!!!!!!!!!!!!!! useEffect executed");
    console.log("Section ID inside useEffect:", sectionId);

    const fetchSectionData = async () => {
      try {
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log("Section ID:", sectionId);
        const response = await fetch(`http://localhost:5000/api/sections/${sectionId}/status`);
        if (response.ok) {
          const sectionData = await response.json();
          setSectionOnline(sectionData.isonline);  // Update state with isonline status
          console.log('Section status:', sectionId, sectionData.isonline);
        } else {
          console.error('Failed to fetch section data');
        }
      } catch (error) {
        console.error('Error fetching section data:', error);
      }
    };

    fetchSectionData();
  }, [sectionId]);

  // Handle status toggle with error handling
  const toggleSectionOnline = async () => {
    try {
      const newStatus = !sectionOnline;
      const response = await fetch(`http://localhost:5000/api/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isonline: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update section status');
      }

      setSectionOnline(newStatus); // Only update state if the request succeeds
    } catch (error) {
      console.error('Error toggling section online status:', error);
    }
  };

  const handleClear = async () => {
    setRefreshHierarchy((prev) => prev + 1);

    try {
      await axios.put('http://localhost:5000/api/units/remove', {
        section: sectionId,
        isFriendly: isFriendlyHierarchy === 'Friendly',
      });
      console.log('Hierarchy cleared successfully');
    } catch (error) {
      console.error('Error clearing hierarchy:', error);
    }
  };

  const handleLogoClick = () => navigate('/');
  const handleArrowClick = () => navigate('/admin');

  return (
    <MantineProvider defaultColorScheme="dark">
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
            <Button size="sm" variant="link" onClick={handleArrowClick} style={{ margin: '10px' }}>
              <FaArrowAltCircleLeft />
            </Button>
            <Image
              src={logo}
              radius="md"
              h={50}
              fallbackSrc="https://placehold.co/600x400?text=Placeholder"
              onClick={handleLogoClick}
              style={{ cursor: 'pointer', padding: '8px' }}
            />
          </div>
        </AppShell.Header>

        <AppShell.Main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1><strong>{sectionId}</strong> Controls</h1>
          </div>

          <Divider my="md" />

          {sectionOnline === null ? (
            <p>Loading section status...</p> // Loading indicator
          ) : (
            <Switch
              checked={sectionOnline}
              onChange={toggleSectionOnline}
              color={sectionOnline ? 'teal' : 'red'}
              size="md"
              label={sectionOnline ? 'Section Online' : 'Section Offline'}
              thumbIcon={
                sectionOnline ? (
                  <IconCheck style={{ width: rem(12), height: rem(12) }} color={theme.colors.teal[6]} stroke={3} />
                ) : (
                  <IconX style={{ width: rem(12), height: rem(12) }} color={theme.colors.red[6]} stroke={3} />
                )
              }
            />
          )}

          <Divider my="md" />

          <Group>
            <SegmentedControl
              value={isFriendlyHierarchy}
              onChange={setIsFriendlyHierarchy}
              size="xl"
              data={[
                { label: 'Friendly Force Structure', value: 'Friendly' },
                { label: 'Enemy Force Structure', value: 'Enemy' },
              ]}
            />
            <Button color="red" size="xl" onClick={handleClear}>
              Clear
            </Button>
          </Group>

          <Hierarchy
            is_friendly={isFriendlyHierarchy === 'Friendly'}
            hierarchyRefresh={refreshHierarchy}
            xCoord={1250}
            yCoord={70}
          />
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default SectionControls;