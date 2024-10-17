/* LandingPage.tsx is the page that the site automatically opens up to. It is the "home page" of LEAP and serves as a site where 
administrators, students, and observers can launch other parts of the application from, */

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Table, Box, useMantineTheme, FocusTrap, Image, Paper, PasswordInput, Button, SegmentedControl } from '@mantine/core'; // Adjust imports as needed
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import classes from './landingPage.module.css';
import { useUserRole } from '../context/UserContext';
import { MantineProvider } from '@mantine/core';
import logo from '../images/logo/Tr_FullColor.png'
import { useUnitProvider } from '../context/UnitContext';

// Sets the dynamic interface of the class section
export interface Section {
  sectionid: string;
  isonline: boolean;
}

export default function LandingPage() {
  const navigate = useNavigate(); // Used to navigate to different pages from the landing page
  const [role, setRole] = useState('Student'); // Sets the segmented control to student automatically, but is able to be changed
  const theme = useMantineTheme(); // Used to set the dark theme for the page
  const [selectedSection, setSelectedSection] = useState<string | null>(null); // State to track the selected class section throughout the application
  const { setUserRole, setUserSection } = useUserRole(); // Setters to set the user section and role
  const [sections, setSections] = useState<Section[]>([]); // Variables to set and get the class sections
  const { selectedUnit, setSelectedUnit } = useUnitProvider();

  // Validates the password and ensures that an administrator is a user
  const form = useForm({
    initialValues: { password: '' },
    validate: {
      password: (value: string) =>
        role === 'Administrator' && value !== 'admin' ? 'Incorrect admin password' : null,
    },
  });


  // Creates the focus trap that displays as soon as you click into the administrator control
  const trapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trapRef.current) {
      trapRef.current.focus();
    }
  }, []);

  // Function to handle login based on role and selected section
  const handleLogin = (values: { password: string }) => {
    if (role === 'Administrator' && values.password === 'admin') {
      setUserRole(role);
      navigate('/admin');
    } else if (role === 'Student' || role === 'Observer') {
      if (role === 'Student') {
        setUserRole(role);
        setUserSection(selectedSection);
        setSelectedUnit(null);
        navigate(`/studentPage/${selectedSection}`); // Navigate to student page
      } else if (role === 'Observer' && selectedSection) {
        setUserRole(role);
        setUserSection(selectedSection);
        navigate(`/observerPage/${selectedSection}`); // Navigate to observer page with selected section
      }
    }
  };

  // Function to fetch the database data about the sections
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

  // Function to render the table that displays each function and whether or not it is online
  const renderSectionsTable = () => (
    <Box style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 className='sessionCentered' >
        Select Student Session
      </h1>
      <Table withRowBorders>
        <Table.Thead>
          <Table.Tr>
            <th className='left-oriented'>Scenerio Name</th>
            <th className='isonlineCentered'>Status</th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {/* Displays each section ID and whether each section is online or not in the table*/}
          {sections.map((section) => (
            <Table.Tr
              key={section.sectionid}
              onClick={() => {
                if (section.isonline) {
                  if (selectedSection === section.sectionid) {
                    handleLogin(form.values);
                  }
                  setSelectedSection((prev) =>
                    prev === section.sectionid ? null : section.sectionid
                  );
                }
              }}
              // Does not allow a student to click on a section that is not online
              style={{
                cursor: section.isonline ? 'pointer' : 'not-allowed',
                backgroundColor: selectedSection === section.sectionid ? 'rgba(128, 128, 128, 0.5)' : '',
                textAlign: 'center',
              }}
              className="highlightable-row"
            >
              <Table.Td>{section.sectionid}</Table.Td>
              <Table.Td>
                {/* Creates the online or offline boxes in the table */}
                <Box
                  style={{
                    backgroundColor: section.isonline ? theme.colors.green[0] : theme.colors.red[0],
                    color: section.isonline ? theme.colors.green[9] : theme.colors.red[9],
                    padding: '4px',
                    paddingRight: '25px',
                    paddingLeft: '25px',
                    borderRadius: '4px',
                    display: 'inline-block',
                  }}
                  className="isonlineCentered"
                >
                  {section.isonline ? 'Online' : 'Offline'}
                </Box>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );

  return (
    // Sets the display to dark mode
    <MantineProvider defaultColorScheme='dark'>
      <div className={classes.wrapper}>
        <Paper className={classes.form} radius={0} p={30}>
          {/* Displays the LEAP image */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '40px', scale: '0.75' }}>
            <Image
              radius="md"
              src={logo}
              h={200}
              fallbackSrc='https://placehold.co/600x400?text=Placeholder'
            />
          </div>

          {/* Clickable control that allows the switching of roles between student, observer, and administrator */}
          <div style={{ margin: '10px' }} >
            <SegmentedControl
              size="lg"
              data={['Student', 'Observer', 'Administrator']}
              value={role}
              onChange={setRole}
            />
          </div>

          {/* Clickable control that allows the switching of components between JFLCC and JFSOCC when their role is a student */}
          {/* {(role === 'Student') && (
            <div style={{ margin: '10px'}} >
              <SegmentedControl
                size="lg"
                data={['JFLCC', 'JFSOCC']}
                value={force}
                onChange={setForce}
              />
            </div>
          )} */}

          {/* If a user identifies as an administrator, this handles the password input */}
          {role === 'Administrator' && (
            <FocusTrap>
              <div ref={trapRef} tabIndex={-1}>
                <form onSubmit={form.onSubmit((values) => handleLogin(values))}>
                  <center>
                    <PasswordInput
                      label="Password"
                      placeholder="Admin password"
                      mt="md"
                      size="md"
                      style={{ justifyContent: 'center', width: '250px', alignItems: 'center' }}
                      {...form.getInputProps('password')}
                    />

                    <div style={{ margin: '10px', width: '250px', justifyContent: "center", textAlign: "center", alignItems: 'center' }} >
                      <Button
                        fullWidth
                        mt="xl"
                        size="md"
                        type="submit"
                        disabled={!form.values.password}
                      >
                        Login
                      </Button>
                    </div>
                  </center>
                </form>
              </div>
            </FocusTrap>
          )}

          {/* Displays the table with student sections and their online availability if the user is a student or observer */}
          {(role === 'Student' || role === 'Observer') && renderSectionsTable()}
          {(role === 'Student' || role === 'Observer') && (
            <div style={{ display: "flex", justifyContent: "center", textAlign: "center" }}>
              <Button
                style={{ height: '30px', width: '250px', textAlign: "center" }}
                mt="xl"
                size="md"
                onClick={() => handleLogin(form.values)} // Update route
                disabled={!selectedSection}
              >
                {/* button text based on role */}
                {role === 'Student' ? 'Launch Session' : 'Launch Observer Session'}
              </Button>

            </div>
          )}
        </Paper>
      </div>
    </MantineProvider>
  );
}
