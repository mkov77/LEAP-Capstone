/**
 * studentPage.tsx renders the student page where the students can view and start engagements with their units
 */
import '../App.css';
import { AppShell, Image, Button, MantineProvider, Grid } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserRole } from '../context/UserContext';
import { FaArrowAltCircleLeft } from "react-icons/fa";
import Hierarchy from '../components/HierarchyBuilder';
import logo from '../images/logo/Tr_FullColor_NoSlogan.png'

// Function where the page renders
function ObserverPage() {
  const [mobileOpened] = useDisclosure(false);
  const [desktopOpened] = useDisclosure(false);
  const navigate = useNavigate();
  const { sectionId } = useParams(); // Retrieve sectionId from route parameters
  const { userRole, userSection } = useUserRole();

  // Redirects to the home page if the user is not a 'Student' or if their section ID does not match the current section ID.
  useEffect(() => {
    if (userRole !== 'Observer' || userSection !== sectionId) {
      console.log(`user Role: ${userRole}`);
      console.log(`user section: ${sectionId}`);
      navigate('/');
    }
  }, [navigate, userRole]);

  // Navigate to the main login page
  const handleLogoClick = () => {
    navigate('/'); // Navigate to the main login page
  };

  // Navigate to the main login page
  const handleArrowClick = () => {
    navigate('/');
  };

  // Navigate to the After Action Reviews page for the current section
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
          <div style={{ justifyContent: 'right', display: 'flex' }}>
            {/* After action report Button where user can switch views */}
            <Button size='sm' variant='link' onClick={handleAARClick} style={{ margin: '10px ' }}>After Action Reports</Button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

              {sectionId && (
                <p>
                  You are observing: <strong>{sectionId}</strong>
                </p>
              )}

            </div>

          </div>
          <Grid>
            <Grid.Col span={6} style={{ justifyContent: 'center', alignItems: 'center' }}>
              <div className="App">
                <Hierarchy is_friendly={true} hierarchyRefresh={0} xCoord={650} yCoord={70}/>
              </div>
            </Grid.Col>
            <Grid.Col span={6} style={{justifyContent: 'center', alignItems: 'center' }}>
              <div className="App">
                <Hierarchy is_friendly={false} hierarchyRefresh={0} xCoord={650} yCoord={70} />
              </div>
            </Grid.Col>
          </Grid>
        </AppShell.Main>
      </AppShell>
    </MantineProvider >
  ); // End of return statement
}

export default ObserverPage;
