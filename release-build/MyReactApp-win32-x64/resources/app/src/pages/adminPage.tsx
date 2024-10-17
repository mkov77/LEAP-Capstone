// pages/adminPage.js
import { useState, useEffect, useRef } from 'react';
import {
  AppShell,
  Group,
  Image,
  Box,
  Table,
  Checkbox,
  Button,
  Modal,
  TextInput,
  useMantineTheme,
  MantineProvider,
  FocusTrap,
  Center,
  Space,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
//import { sections as initialSections } from '../data/sections';
import { useUserRole } from '../context/UserContext';
import { FaArrowAltCircleLeft } from "react-icons/fa";
import axios from 'axios';
import { Section } from './landingPage';
import logo from '../images/logo/Tr_FullColor_NoSlogan.png'
import { IconCubeOff, IconCubePlus } from '@tabler/icons-react';
import UnitCreationModule from '../components/UnitCreationModule';
import UnitDeleteModule from '../components/UnitDeleteModule';


function AdminPage() {
  const [mobileOpened] = useDisclosure(false);
  const [desktopOpened] = useDisclosure(false);
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  //const [sections, setSections] = useState(initialSections);
  const theme = useMantineTheme();
  const [newSectionName, setNewSectionName] = useState('');
  const [modalOpened, setModalOpened] = useState(false);
  const { userRole, setUserSection } = useUserRole();
  const [unitModalOpened, setUnitModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);


  useEffect(() => {
    if (userRole !== 'Administrator') {
      navigate('/');
    }
  }, [navigate, userRole]);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleArrowClick = () => {
    navigate('/');
  };

  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<Section[]>('http://localhost:5000/api/sections');
        setSections(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);


  const trapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trapRef.current) {
      trapRef.current.focus();
    }
  }, []);

  const handleCheckboxChange = (sectionid: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionid) ? prev.filter((id) => id !== sectionid) : [...prev, sectionid]
    );
  };


  const handleCreateNewSection = async () => {
    if (newSectionName.trim()) {
      try {
        // Make POST request to backend
        const response = await axios.post('http://localhost:5000/api/sections', {
          sectionid: newSectionName.trim(),
          isonline: false, // Default to offline
        });

        // Assuming successful creation, update frontend state
        setSections((prevSections) => [
          ...prevSections,
          { sectionid: newSectionName.trim(), isonline: false },
        ]);
        setNewSectionName('');
        closeModal();
      } catch (error) {
        console.error('Error creating new section:', error);
        // Add any error handling for the frontend here
      }
    }
  };

  const handleLaunchSession = (sectionid: string) => {
    setUserSection(selectedSection);
    navigate(`/sectionControls/${sectionid}`);
  }

  const openModal = () => {
    setModalOpened(true);
  };

  const closeModal = () => {
    setModalOpened(false);
  };


  const handleDeleteSections = async () => {
    try {
      console.log("Selected Section IDs: ", selectedSections);
  
      // Function to handle section removal
      const removeSections = async (isFriendly: boolean) => {
        console.log(`Starting removal for isFriendly=${isFriendly}`);
        await Promise.all(
          selectedSections.map(async (sectionId) => {
            try {
              console.log(`Sending remove request for section ${sectionId} with isFriendly=${isFriendly}`);
              const response = await axios.put(`http://localhost:5000/api/units/remove`, {
                section: sectionId,
                isFriendly: isFriendly
              });
              console.log(`Response from remove API for section ${sectionId} with isFriendly=${isFriendly}: `, response.data);
            } catch (error) {
              console.log(`Error clearing section ${sectionId} with isFriendly=${isFriendly}:`, error);
            }
          })
        );
        console.log(`Finished removal for isFriendly=${isFriendly}`);
      };
  
      // Remove sections for friendly units
      await removeSections(true);
  
      // Remove sections for non-friendly (enemy) units
      await removeSections(false);
  
      // Ensure sections are deleted only after all removals
      console.log("Removing sections from the database");
  
      await Promise.all(
        selectedSections.map(async (sectionId) => {
          try {
            console.log(`Deleting section ${sectionId}`);
            const response = await axios.delete(`http://localhost:5000/api/sections/${sectionId}`);
            console.log(`Deleted section ${sectionId}: `, response.data);
          } catch (error) {
            console.log(`Error deleting section ${sectionId}:`, error);
          }
        })
      );
  
      // Update the state after successful deletion
      setSections((prevSections) =>
        prevSections.filter((section) => !selectedSections.includes(section.sectionid))
      );
      setSelectedSections([]);
      setSelectedSection(null);
    } catch (error) {
      console.error('Error deleting sections:', error);
    }
  };  
  
  const handleRowDoubleClick = (sectionid: string) => {
    setUserSection(sectionid);
    navigate(`/sectionControls/${sectionid}`);
  };

  // Function to render the sections table
  const renderSectionsTable = () => (
    <Box style={{ maxWidth: 600, margin: '0 auto' }}>
      <Table>
        <thead>
          <tr>
            <th>Scenerio Name</th>
            <th>Status</th>
            <th>Delete Selection</th>
          </tr>
        </thead>
        <Table.Tbody>
          {sections.map((section) => (
            <Table.Tr
              key={section.sectionid}
              onClick={() => setSelectedSection(section.sectionid)}
              onDoubleClick={() => handleRowDoubleClick(section.sectionid)}
              style={{
                cursor: 'pointer',
                backgroundColor: selectedSection === section.sectionid ? 'rgba(128, 128, 128, 0.5)' : '',
              }}
              className="highlightable-row"
            >
              <td>{section.sectionid}</td>
              <td>
                <Box
                  style={{
                    backgroundColor: section.isonline ? theme.colors.green[0] : theme.colors.red[0],
                    color: section.isonline ? theme.colors.green[9] : theme.colors.red[9],
                    padding: '4px',
                    margin: '5px',
                    paddingRight: '20px',
                    paddingLeft: '20px',
                    borderRadius: '4px',
                    display: 'inline-block',
                  }}
                >
                  {section.isonline ? 'Online' : 'Offline'}
                </Box>
              </td>
              <td>
                <Center>
                  <Checkbox
                    checked={selectedSections.includes(section.sectionid)}
                    onChange={() => handleCheckboxChange(section.sectionid)}
                    color='red'
                  />
                </Center>
              </td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );

  function handleCreateUnit() {
    setUnitModalOpened(true); // Open the modal when the button is clicked
  }

  const closeUnitModal = () => {
    setUnitModalOpened(false); // Close the modal
  };

  function handleDeleteUnit() {
    setDeleteModalOpened(true); // Open the modal when the button is clicked
  }

  const closeDeleteModal = () => {
    setDeleteModalOpened(false); // Close the modal
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
          <div className="App">
            <h1>Admin Page</h1>
            {renderSectionsTable()}
            <div style={{ display: "flex", justifyContent: "center", textAlign: "center" }}>
              <Button
                style={{ height: '40px', width: '225px', textAlign: "center" }}
                mt="xl"
                size="md"
                onClick={() => selectedSection && handleLaunchSession(selectedSection)} // Update route
                disabled={!selectedSection}
              >
                Launch Session
              </Button>
            </div>
            <Group mt="md" style={{ display: "flex", justifyContent: "center", textAlign: "center" }}>
              <Button color="blue" onClick={openModal} style={{ display: "flex", justifyContent: "center", textAlign: "center" }}>
                Create Scenerio
              </Button>
              <Button color="red" onClick={handleDeleteSections} disabled={selectedSections.length === 0}>
                Delete
              </Button>
            </Group>
            <Group mt="md" style={{ display: "flex", justifyContent: "center", textAlign: "center" }}>
              <Button color="green" onClick={handleCreateUnit} style={{ width: '150px', marginTop: 20 }}>
                <IconCubePlus /><Space w="10" />Unit Creator
              </Button>
              <Button color="red" onClick={handleDeleteUnit} style={{ width: '150px', marginTop: 20 }}>
                <IconCubeOff /><Space w="10" />Delete Units
              </Button>
            </Group>
          </div>
        </AppShell.Main>

        <UnitCreationModule isOpen={unitModalOpened} onClose={closeUnitModal} />
        <UnitDeleteModule isOpen={deleteModalOpened} onClose={closeDeleteModal} />

        <Modal opened={modalOpened} onClose={closeModal} title="New Section" centered>
          <FocusTrap>
            <div>
              <TextInput
                autoFocus
                label="Scenerio Name"
                placeholder="Enter Scenerio name"
                value={newSectionName}
                onChange={(event) => setNewSectionName(event.currentTarget.value)}
              />

              <Button fullWidth mt="md" onClick={handleCreateNewSection} disabled={!newSectionName.trim()}>
                Create
              </Button>
            </div>
          </FocusTrap>
        </Modal>
      </AppShell>
    </MantineProvider>
  );
}

export default AdminPage;
