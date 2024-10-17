// pages/adminPage.js
import { useState, useEffect, useRef } from 'react';
import {
  AppShell,
  Group,
  Image,
  Box,
  Table,
  Button,
  Modal,
  TextInput,
  useMantineTheme,
  MantineProvider,
  FocusTrap,
  Center,
  Space,
  Menu,
  ActionIcon,
  rem
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
//import { sections as initialSections } from '../data/sections';
import { useUserRole } from '../context/UserContext';
import { FaArrowAltCircleLeft } from "react-icons/fa";
import axios from 'axios';
import { Section } from './landingPage';
import logo from '../images/logo/Tr_FullColor_NoSlogan.png'
import { IconCopy, IconCubeOff, IconCubePlus, IconDots, IconMessages, IconNote, IconPencil, IconReportAnalytics, IconTrash } from '@tabler/icons-react';
import UnitCreationModule from '../components/UnitCreationModule';
import UnitDeleteModule from '../components/UnitDeleteModule';
import SectionCopyModule from '../components/sectionCopyModule';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';


function AdminPage() {
  const [mobileOpened] = useDisclosure(false);
  const [desktopOpened] = useDisclosure(false);
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const theme = useMantineTheme();
  const [newSectionName, setNewSectionName] = useState('');
  const [modalOpened, setModalOpened] = useState(false);
  const { userRole, setUserSection } = useUserRole();
  const [unitModalOpened, setUnitModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [copyModalOpened, setCopyModalOpened] = useState(false);
  const [sectionToCopy, setSectionToCopy] = useState<string | null>(null);
  const [sectionDeleteOpen, setSectionDeleteOpen] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);




  useEffect(() => {
    if (userRole !== 'Administrator') {
      navigate('/');
    }
  }, [navigate, userRole]);


  // Function to open copy modal
  const openCopyModal = (sectionid: string) => {
    setSectionToCopy(sectionid);
    setCopyModalOpened(true);
  };

  // Function to close copy modal
  const closeCopyModal = () => {
    setCopyModalOpened(false);
    setSectionToCopy(null);
    fetchData();
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleArrowClick = () => {
    navigate('/');
  };

  const [sections, setSections] = useState<Section[]>([]);

  const fetchData = async () => {
    try {
      const response = await axios.get<Section[]>('http://localhost:5000/api/sections');
      setSections(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const trapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trapRef.current) {
      trapRef.current.focus();
    }
  }, []);


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


  // const handleDeleteSection = async (sectionId: string) => {

  //   try {
  //     // Confirm deletion
  //     const confirmDelete = window.confirm('Are you sure you want to delete this section? This action is irreversible.');
  //     if (!confirmDelete) return;

  //     // Send delete request to the backend
  //     await axios.delete(`http://localhost:5000/api/sections/${sectionId}`);

  //     // Success: Update the sections state by removing the deleted section
  //     setSections((prevSections) =>
  //       prevSections.filter((section) => section.sectionid !== sectionId)
  //     );

  //     alert('Section deleted successfully');
  //   } catch (error) {
  //     console.error('Error deleting section:', error);
  //     alert('Failed to delete section');
  //   }
  // };  


  // Open the delete modal for the selected section
  const openDeleteSectionModal = () => {
    open();
  };

  // Handle successful deletion and update state
  const handleDeleteSectionSuccess = () => {
    if (selectedSection) {
      setSections((prevSections) =>
        prevSections.filter((section) => section.sectionid !== selectedSection)
      );
      setSelectedSection(null);
    }
    setDeleteModalOpened(false);
    fetchData();
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
                <SectionCopyModule
                  isOpen={copyModalOpened}
                  onClose={closeCopyModal}
                  sectionToCopy={sectionToCopy}  // Pass the section to copy
                  onCopySuccess={(newSectionId: any) => {
                    // Optional: You can update sections state here if needed after successful copy
                    console.log("Section copied successfully with new ID:", newSectionId);
                  }}
                />

                <Group justify="flex-end">
                  <Menu
                    transitionProps={{ transition: 'pop' }}
                    withArrow
                    position="bottom-end"
                    withinPortal
                  >
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray">
                        <IconDots style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconCopy style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                        onClick={() => openCopyModal(section.sectionid)}  // Open copy modal with section ID
                      >
                        Copy Scenerio
                      </Menu.Item>

                      <Menu.Item
                        leftSection={<IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                        color="red"
                        onClick={() => openDeleteSectionModal()}
                      >
                        Delete Scenerio
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
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
                Edit Scenerio
              </Button>
            </div>
            <Group mt="md" style={{ display: "flex", justifyContent: "center", textAlign: "center" }}>
              <Button color="blue" onClick={openModal} style={{ display: "flex", justifyContent: "center", textAlign: "center" }}>
                Create Scenerio
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

        <Modal opened={modalOpened} onClose={closeModal} title="New Scenerio" centered>
          <FocusTrap>
            <div>
              <TextInput
                autoFocus
                label="Scenerio Name"
                placeholder="Enter scenerio name"
                value={newSectionName}
                onChange={(event) => {
                  const input = event.currentTarget.value;
                  if (input.length <= 15) {
                    setNewSectionName(input);
                  }
                }}
              />

              <Button fullWidth mt="md" onClick={handleCreateNewSection} disabled={!newSectionName.trim()}>
                Create
              </Button>
            </div>
          </FocusTrap>
        </Modal>

        {selectedSection && (
          <DeleteConfirmationModal
            open={opened}
            onClose={close}
            sectionId={selectedSection}
            onDeleteSuccess={handleDeleteSectionSuccess}
          />
        )}

      </AppShell>
    </MantineProvider>
  );
}

export default AdminPage;
