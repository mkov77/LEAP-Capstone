/**
 * studentPage.tsx renders the student page where the students can view and start engagements with their units
 */
import '../App.css';
import CarouselC from '../components/carousel'; // Remove the '.tsx' extension
import SearchResultList from '../components/searchResults'
import { AppShell, Group, Image, TextInput, Button, MantineProvider, SegmentedControl } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect, SetStateAction } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserRole } from '../context/UserContext';
import { useUnitProvider } from '../context/UnitContext';
import { FaArrowAltCircleLeft } from "react-icons/fa";
import Hierarchy from '../components/HierarchyBuilder';
import logo from '../images/logo/Tr_FullColor_NoSlogan.png'

// Function where the page renders
function App() {
  const [mobileOpened] = useDisclosure(false);
  const [desktopOpened] = useDisclosure(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { sectionId } = useParams(); // Retrieve sectionId from route parameters
  const { userRole, userSection } = useUserRole();
  const { selectedUnit } = useUnitProvider();
  const [hierarchyToggle, setHierarchyToggle] = useState(false);
  const [view, setView] = useState('Unit Selection');

  // Redirects to the home page if the user is not a 'Student' or if their section ID does not match the current section ID.
  useEffect(() => {
    if (userRole !== 'Student' || userSection !== sectionId) {
      console.log(`user Role: ${userRole}`);
      console.log(`user section: ${sectionId}`);
      navigate('/');
    }
  }, [navigate, userRole]);

  const handleViewChange = (value: SetStateAction<string>) => {
    setView(value);
    if (value === 'After Action Reviews') {
      handleAARClick();
    } else if (value === 'Hierarchy View') {
      setHierarchyToggle(true);
    } else {
      setHierarchyToggle(false);
    }
  };

  // Updates the search state with the value from the input field
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearch(value);
  }

  // Navigate to the main login page
  const handleLogoClick = () => {
    navigate('/'); // Navigate to the main login page
  };

  // Navigate to the main login page
  const handleArrowClick = () => {
    navigate('/');
  };

  // Navigate to the After Action Reports page for the current section
  const handleAARClick = () => {
    navigate(`/AAR/${sectionId}`)
  }

  // Where student page renders
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
        {/* Header / Nav bar  */}
        <AppShell.Header>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {/* Back button */}
              <Button size='sm' variant='link' onClick={handleArrowClick} style={{ margin: '10px' }}>
                <FaArrowAltCircleLeft />
              </Button>
              {/* Clickable logo that takes user back to homepage */}
              <Image
                src={logo}
                radius="md"
                h={50}
                fallbackSrc="https://placehold.co/600x400?text=Placeholder"
                onClick={handleLogoClick}
                style={{ cursor: 'pointer', scale: '1', padding: '8px' }}
              />
            </div>
          </div>
        </AppShell.Header>

        {/* Everything that isn't the header / nav bar */}
        <AppShell.Main>
          {/* After action report Button where user can switch views */}
          {/* <div style={{ justifyContent: 'right', display: 'flex' }}>
            <Button size='sm' variant='link' onClick={handleAARClick} style={{ margin: '10px ' }}>After Action Reviews</Button>
          </div> */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

              {sectionId && (
                <h1>
                  Section <strong>{sectionId}</strong>
                </h1>
              )}
              
            </div>

            <SegmentedControl
            value={view}
            onChange={handleViewChange}
            data={[
              { label: 'Unit Selection', value: 'Unit Selection' },
              { label: 'Hierarchy View', value: 'Hierarchy View' },
              { label: 'After Action Reviews', value: 'After Action Reviews' }
            ]}
            size = 'md'
            style={{ margin: 15 }}
          />
            {/* Toggle between selection and hierarchy view */}
            {/* <div>
              <Button onClick={() => setHierarchyToggle(!hierarchyToggle)}>
                {hierarchyToggle ? 'Selection Menu' : 'Hierarchy View'}
              </Button>
            </div> */}
          </div>

          <div style={{ width: '250px' }}>

          {/* Unit Search Bar */}
          {!hierarchyToggle && (
                <TextInput
                  placeholder='Search'
                  style={{ width: '100%' }}
                  value={search}
                  onChange={handleChange}
                />
              )}
          </div>

          <div className="App">
            {/* Decides what to render depending on toggle */}
            {!hierarchyToggle ? (
              // Render carousel view
              <>
                {search && (
                  <SearchResultList search={search} />
                )}
                {!search && (
                  <CarouselC />
                )}
                {/* Start engagement / battle button */}
                <Group justify='center'>
                  {/* Button is only enabled if a unit with a positive health is presently selected */}
                  <Button
                    disabled={!selectedUnit || selectedUnit.unit_health <= 0}
                    size='compact-xl'
                    onClick={() => navigate(`/battlePage`)}
                    style={{ margin: '30px' }}
                  >
                    Select for Engagement
                  </Button>
                </Group>
              </>
            ) : (
              // Render the hierarchy
              <Hierarchy is_friendly={true} hierarchyRefresh={0} xCoord={1250} yCoord={70} />
            )}
          </div>
        </AppShell.Main>
      </AppShell>
    </MantineProvider >
  ); // End of return statement
}

export default App;
