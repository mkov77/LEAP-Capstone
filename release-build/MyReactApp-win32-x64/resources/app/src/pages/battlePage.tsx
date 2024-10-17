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


// The interface that is used to take in and send variables for the tactics tables
export interface Form {
  ID: string;
  friendlyScore: number;
  enemyScore: number;
}

interface UnitTactics {
  awareness: number;
  logistics: number;
  coverage: number;
  gps: number;
  comms: number;
  fire: number;
  pattern: number;
}

function BattlePage() {
  //Initializes global variables
  const navigate = useNavigate(); // A way to navigate to different pages
  const { userSection } = useUserRole(); // Tracks the class section
  const [active, setActive] = useState(0);
  const closeLocation = '/studentPage/' + userSection; // A way to navigate back to the correct section of the student page
  const { selectedUnit, setSelectedUnit } = useUnitProvider(); // Tracks the selected unit for an engagement
  const [baseValue, setBaseValue] = useState<number>(0); // State to track the base value (based on characteristics of each individual unit) of a unit
  const [realTimeScore, setRealTimeScore] = useState<number | null>(null); // State to track the real time (tactics) score of a unit
  const [units, setUnits] = useState<Unit[]>([]);
  const [progress, setProgress] = useState(0); // Used to calculate the progress of the animation for the finalize tactics button
  const [loaded, setLoaded] = useState(false);
  const theme = useMantineTheme();
  const [friendlyHealth, setFriendlyHealth] = useState<number>(0); // Variables for setting and getting the friendly unit health
  const [enemyHealth, setEnemyHealth] = useState<number>(0); // Variables for setting and getting the enemy unit health
  const [enemyUnit, setEnemyUnit] = useState<Unit | null>(null); // Variables for setting and getting the enemy unit
  const [inEngagement, setInEngagement] = useState<Boolean>(false); // Used to track whether a unit is in an engagement or not
  const [round, setRound] = useState<number>(1); // Sets the round number for each round of the engagement
  const [totalEnemyDamage, setTotalEnemyDamage] = useState<number>(0);
  const [totalFriendlyDamage, setTotalFriendlyDamage] = useState<number | null>(null);
  const [enemyUnits, setEnemyUnits] = useState<Unit[]>([]);
  const [unitTactics, setUnitTactics] = useState<UnitTactics | null>(null);
  const [enemyBaseValue, setEnemyBaseValue] = useState<number>(0); // Sets and gets the state for the enemy base value 

  // Fetches data of the units based on class section
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<Unit[]>('http://localhost:5000/api/units/sectionSort', {
          params: {
            sectionid: userSection  // Pass userSection as a query parameter
          }
        });
        setUnits(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Fetches data of the enemy units based on class section
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<Unit[]>('http://localhost:5000/api/units/enemyUnits', {
          params: {
            sectionid: userSection  // Pass userSection as a query parameter
          }
        });
        setEnemyUnits(response.data);
        console.log('Enemy units:', enemyUnits);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);


  useEffect(() => {
    const fetchUnitTactics = async () => {
      try {
        const response = await axios.get<UnitTactics>(`http://localhost:5000/api/unitTactics/${enemyUnit?.id}`);
        setUnitTactics(response.data);
      } catch (error) {
        console.error('Error fetching unit tactics:', error);
      }
    };

    if (enemyUnit) {
      fetchUnitTactics();
    }
  }, [enemyUnit]);



  // // Function to filter units where isFriendly is false
  // const filterUnfriendlyUnits = () => {
  //   const unfriendlyUnits = units.filter(unit => unit.isFriendly === false);
  //   setEnemyUnits(unfriendlyUnits);
  // };

  // // Optionally call the filter function when units data is fetched
  // useEffect(() => {
  //   console.log(units)
  //   if (units.length > 0) {
  //     console.log('Its running');
  //     filterUnfriendlyUnits();
  //     console.log(enemyUnits)
  //   }
  // }, [units]);



  // initializes the characteristics of each enemy unit
  const unit = units.find((u) => u.unit_id === selectedUnit);
  const {
    unit_id,
    unit_type,
    unit_health,
    unit_size,
    force_mobility,
    force_readiness,
    force_skill,
    id
  } = unit || {};




  // function to update unit health after each round of an engagement
  const updateUnitHealth = async (id: number, newHealth: number) => {
    const url = `http://localhost:5000/api/units/health`; // Corrected URL to point to the server running on port 5000
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, newHealth }), // Send both id and newHealth in the body
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Failed to update unit health: ${response.statusText}`);
      }
      const updatedUnit = await response.json();
      console.log('Updated unit:', updatedUnit);
      return updatedUnit;
    } catch (error) {
      console.error('Error updating unit health:', error);
    }
  };

  // function for the button (either 'Next Round' or 'Done') that moves an engagement from one round to another based on health of both the enemy and friendly units
  const handleNextRound = (currentFriendlyHealth: number, currentEnemyHealth: number) => {
    if (currentEnemyHealth > 0 && currentFriendlyHealth > 0) {
      setActive(0);
      setLoaded(false);
    } else {
      if (friendlyHealth > 0) {
        updateUnitHealth(Number(id), friendlyHealth);
      } else {
        updateUnitHealth(Number(id), 0);
      }

      if (enemyHealth > 0) {
        updateUnitHealth(Number(enemyUnit?.id), enemyHealth);
      } else {
        updateUnitHealth(Number(enemyUnit?.id), 0);
      }

      setSelectedUnit(null);
      navigate(closeLocation);
    }
  }

  // Function that selects an enemy unit when it is clicked on to start an engagement
  // Handle select enemy unit change
  const handleSelectEnemy = (value: string | null) => {
    const selectedUnit = enemyUnits.find(unit => unit.id.toString() === value);
    setEnemyUnit(selectedUnit || null);
    // Set initial enemyHealth based on enemy unit health
    setEnemyHealth(selectedUnit?.unit_health ?? 0);
  };

  // Handle deselect enemy unit
  const handleDeselectEnemy = () => {
    setEnemyUnit(null);
  };

  //handler function to start an engagement and move into the yes/no question pages
  const handleStartEngagement = () => {
    setInEngagement(true);
    nextStep();
  }

  //function that calculates the base value based on the overall characteristics of a unit
  const calculateBaseValue = (unit: Unit) => {
    const unitTypeValues: Record<string, number> = {
      "Command and Control": 20, "Infantry": 30, "Reconnaissance": 10, "Armored Mechanized": 40,
      "Combined Arms": 50, "Armored Mechanized Tracked": 60, "Field Artillery": 30, "Self-propelled": 40,
      "Electronic Warfare": 10, "Signal": 5, "Special Operations Forces": 40, "Ammunition": 5,
      "Air Defense": 30, "Engineer": 5, "Air Assault": 50, "Medical Treatment Facility": 5,
      "Aviation Rotary Wing": 60, "Combat Support": 20, "Sustainment": 10, "Unmanned Aerial Systems": 10,
      "Combat Service Support": 20, "Petroleum, Oil and Lubricants": 10, "Sea Port": 5, "Railhead": 5
    };
    const roleTypeValues: Record<string, number> = { "Combat": 90, "Headquarters": 50, "Support": 30, "Supply Materials": 20, "Facility": 10 };
    const unitSizeValues: Record<string, number> = { "Squad/Team": 20, "Platoon": 40, "Company/Battery": 50, "Battalion": 60, "Brigade/Regiment": 70, "Division": 80, "Corps": 90, "UAS (1)": 30, "Aviation Section (2)": 80, "Aviation Flight (4)": 30 };
    const forcePostureValues: Record<string, number> = { "Offensive Only": 50, "Defensive Only": 70, "Offense and Defense": 90 };
    const forceMobilityValues: Record<string, number> = { "Fixed": 10, "Mobile (foot)": 30, "Mobile (wheeled)": 50, "Mobile (track)": 40, "Stationary": 20, "Flight (fixed wing)": 90, "Flight (rotary wing)": 70 };
    const forceReadinessValues: Record<string, number> = { "Low": 10, "Medium": 50, "High": 90 };
    const forceSkillValues: Record<string, number> = { "Untrained": 10, "Basic": 40, "Advanced": 70, "Elite": 90 };

    const typeValue = unitTypeValues[unit.unit_type] || 0;
    const roleValue = roleTypeValues[unit.role_type] || 0;
    const sizeValue = unitSizeValues[unit.unit_size] || 0;
    const postureValue = forcePostureValues[unit.force_posture] || 0;
    const mobilityValue = forceMobilityValues[unit.force_mobility] || 0;
    const readinessValue = forceReadinessValues[unit.force_readiness] || 0;
    const skillValue = forceSkillValues[unit.force_skill] || 0;

    // Overall equation to calculate the base score based on different weight values
    const baseValue = 0.15 * typeValue + 0.02 * roleValue + 0.25 * sizeValue + 0.10 * postureValue +
      0.10 * mobilityValue + 0.04 * readinessValue + 0.04 * skillValue;

    return baseValue;
  };

  //calls the calculateBaseValue() equation and initializes health variables for each unit and ensures that each unit is not currently in an engagement
  useEffect(() => {
    if (unit) {
      const calculatedValue = calculateBaseValue(unit);
      setBaseValue(calculatedValue);

      // Set initial friendlyHealth based on unit_health
      if (!inEngagement) {
        console.log('FriendlyHealth set to ' + unit.unit_health);
        setFriendlyHealth(unit.unit_health ?? 0);
      }

      // Set initial inEngagement to false
      setInEngagement(false);
    }
  }, [unit]);

  //calls the calculateBaseValue() equation and initializes health variables for each enemy unit and ensures that each unit is not currently in an engagement
  useEffect(() => {
    if (enemyUnit) {
      const calculatedValue = calculateBaseValue(enemyUnit);
      setEnemyBaseValue(calculatedValue);

      // Set initial inEngagement to false
      setInEngagement(false);
    }
  }, [enemyUnit]);


  //function to move to the next set of questions or backwards in the yes/no questions sections
  const nextStep = () => setActive((current) => (current < 6 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));



  // Update user answers
  const [question1, setQuestion1] = useState('Yes')
  const [question2, setQuestion2] = useState('Yes')
  const [question3, setQuestion3] = useState('Yes')
  const [question4, setQuestion4] = useState('Yes')
  const [question5, setQuestion5] = useState('Yes')
  const [question6, setQuestion6] = useState('Yes')
  const [question7, setQuestion7] = useState('Yes')

  // This function handles the engagement tactics form submission
  const finalizeTactics = async () => {

    // Dummy data for enemyscore
    const enemyTotalScore = ((enemyBaseValue * .70) + (Number(realTimeScore) * .30));

    // Calculates the total friendly score which is 70% of the base value plue 30% of the tactics value
    const friendlyTotalScore = ((baseValue * .70) + (Number(realTimeScore) * .30));

    // Checks whether the friendly unit won the engagement or not
    const isWin = friendlyTotalScore > enemyTotalScore;

    // 'r' generates a random number 
    let r = Math.floor(Math.random() * (5 - 0 + 1)) + 0;
    let r_enemy = Math.floor(Math.random() * (5 - 0 + 1)) + 0;

    // Initializes 'b' to zero. 'b' is the variable for the range of weapons given for each unit type
    let b = 0;
    let b_enemy = 0;

    // These are based on values given by Lt. Col. Rayl
    if (unit_type === 'Armored Mechanized' || unit_type === 'Armored Mechanized Tracked' || unit_type === 'Field Artillery') {
      b = 20;
    }
    else if (unit_type === 'Air Defense') {
      b = 50;
    }
    else if (unit_type === 'Infantry') {
      b = 3;
    }
    else if (unit_type === 'Reconnaissance' || unit_type === 'Unmanned Aerial Systems') {
      b = 5;
    }
    else if (unit_type === 'Combined Arms') {
      b = 30;
    }
    else if (unit_type === 'Self-propelled' || unit_type === 'Electronic Warfare' || unit_type === 'Air Assault' || unit_type === 'Aviation Rotary Wing') {
      b = 15;
    }
    else if (unit_type === 'Signal' || unit_type === 'Special Operations Forces') {
      b = 10;
    }
    else {
      b = 0;
    }

    // These are based on values given by Lt. Col. Rayl
    if (enemyUnit?.unit_type === 'Armored Mechanized' || enemyUnit?.unit_type === 'Armored Mechanized Tracked' || enemyUnit?.unit_type === 'Field Artillery') {
      b_enemy = 20;
    }
    else if (enemyUnit?.unit_type === 'Air Defense') {
      b_enemy = 50;
    }
    else if (enemyUnit?.unit_type === 'Infantry') {
      b_enemy = 3;
    }
    else if (enemyUnit?.unit_type === 'Reconnaissance' || enemyUnit?.unit_type === 'Unmanned Aerial Systems') {
      b_enemy = 5;
    }
    else if (enemyUnit?.unit_type === 'Combined Arms') {
      b_enemy = 30;
    }
    else if (enemyUnit?.unit_type === 'Self-propelled' || enemyUnit?.unit_type === 'Electronic Warfare' || enemyUnit?.unit_type === 'Air Assault' || unit_type === 'Aviation Rotary Wing') {
      b_enemy = 15;
    }
    else if (enemyUnit?.unit_type === 'Signal' || enemyUnit?.unit_type === 'Special Operations Forces') {
      b_enemy = 10;
    }
    else {
      b_enemy = 0;
    }

    // Calculates the damage previously done to the friendly unit
    let prevFriendlyDamage
    if (b_enemy > 0) {
      prevFriendlyDamage = Math.exp(-((r ** 2) / (2 * (b_enemy ** 2))));
    }
    else {
      prevFriendlyDamage = 0;
    }

    // Calculates the maximum damage that the friendly striking unit can inflict in a particular engagement
    let maxFriendlyDamage = .5 * Number(enemyUnit?.unit_health);

    let friendlyDamage = maxFriendlyDamage * prevFriendlyDamage;
    console.log("First friendly damage: ", friendlyDamage)
    console.log("Friendly Health: ", Number(friendlyHealth))
    if (Number(friendlyHealth) < friendlyDamage) {
      friendlyDamage = Number(friendlyHealth);
    }
    console.log("Second friendly damage: ", friendlyDamage)


    // Calculates the overall damage to the friendly unit
    setTotalFriendlyDamage(friendlyDamage);

    // Subtracts the total damage from the previous friendly health in order to set a new health for the friendly unit
    setFriendlyHealth(Math.round((Number(friendlyHealth)) - friendlyDamage));

    // Calculates the maximum damage that the enemy striking unit can inflict in a particular engagement
    let maxEnemyDamage = .5 * Number(unit_health);

    let prevEnemyDamage = 0;
    // Calculates the damage previously done to the enemy unit
    if (b > 0) {
      prevEnemyDamage = Math.exp(-((r_enemy ** 2) / (2 * (b ** 2))));
    }
    else {
      prevEnemyDamage = 0;
    }

    // Make sure enemy health is never negative
    let enemyDamage = maxEnemyDamage * prevEnemyDamage;
    console.log("First enemy damage: ", enemyDamage)
    console.log("Enemy Health: ", enemyHealth)
    if (enemyHealth < enemyDamage) {
      enemyDamage = enemyHealth;
    }
    console.log("Second enemy damage: ", enemyDamage)

    // // Calculates the overall damage to the enemy unit and sets it to the totalEnemyDamage variable
    setTotalEnemyDamage(enemyDamage);

    // Subtracts the total damage from the previous enemy health in order to set a new health for the enemy unit
    setEnemyHealth(Math.round((Number(enemyHealth)) - enemyDamage));

    // Calls the function that calculates the score for each unit and sets the score as finalized
    const score = calculateRealTimeScore();
    setRealTimeScore(score);

    setRound(round + 1); // Updates the round as the scores are finalized

    console.log(unit_id);

    // Prepare data for engagement and tactics
    const engagementData = {
      SectionID: userSection,
      FriendlyID: unit_id,
      EnemyID: enemyUnit?.unit_id,
      FriendlyBaseScore: baseValue,
      EnemyBaseScore: enemyBaseValue,
      FriendlyTacticsScore: realTimeScore,
      EnemyTacticsScore: realTimeScore,
      FriendlyTotalScore: friendlyTotalScore,
      EnemyTotalScore: enemyTotalScore,
      isWin: isWin,
    };

    const tacticsData = {
      FriendlyAwareness: question1 === "Yes" ? 1 : 0,
      EnemyAwareness: unitTactics?.awareness,
      FriendlyLogistics: question2 === "Yes" ? 1 : 0,
      EnemyLogistics: unitTactics?.logistics,
      FriendlyCoverage: question3 === "Yes" ? 1 : 0,
      EnemyCoverage: unitTactics?.coverage,
      FriendlyGPS: question4 === "Yes" ? 1 : 0,
      EnemyGPS: unitTactics?.gps,
      FriendlyComms: question5 === "Yes" ? 1 : 0,
      EnemyComms: unitTactics?.comms,
      FriendlyFire: question6 === "Yes" ? 1 : 0,
      EnemyFire: unitTactics?.fire,
      FriendlyPattern: question7 === "Yes" ? 1 : 0,
      EnemyPattern: unitTactics?.pattern,
    };

    // Submit answers to backend
    try {
      // Submit engagement data
      const engagementResponse = await fetch('http://localhost:5000/api/engagements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(engagementData),
      });

      if (!engagementResponse.ok) {
        throw new Error('Failed to create engagement');
      }

      const engagementResult = await engagementResponse.json();
      console.log('Engagement created:', engagementResult);

      // Submit tactics data
      const tacticsResponse = await fetch('http://localhost:5000/api/tactics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tacticsData),
      });

      if (!tacticsResponse.ok) {
        throw new Error('Failed to record tactics');
      }

      const tacticsResult = await tacticsResponse.json();
      console.log('Tactics recorded:', tacticsResult);

    } catch (error) {
      console.error('Error submitting data:', error);
    }

  }; // End of finalize tactics

  // This is the intervale for the Finalize Tactics button animation
  const interval = useInterval(
    () =>
      setProgress((current) => {
        if (current < 100) {
          return current + 1;
        }

        interval.stop();
        setLoaded(true);

        nextStep();

        return 0;
      }),
    40
  );

  // Variable Conditions and corresponding weights
  const weights: Record<WeightKeys, { yes: number; no: number }> = {
    awareOfPresence: { yes: 20, no: 0 },
    logisticsSupportRange: { yes: 25, no: 0 },
    isrCoverage: { yes: 10, no: 0 },
    gpsWorking: { yes: 10, no: 0 },
    communicationsWorking: { yes: 10, no: 0 },
    fireSupportRange: { yes: 15, no: 0 },
    patternForceRange: { yes: 10, no: 0 }
  };

  // Defines the keys for the different tactics to assign to different weights
  type WeightKeys = 'awareOfPresence' | 'logisticsSupportRange' | 'isrCoverage' | 'gpsWorking' | 'communicationsWorking' | 'fireSupportRange' | 'patternForceRange';

  // Calculates the score based on different tactics for each engagement
  const calculateRealTimeScore = () => {
    let score = 0;

    // Variable Conditions and corresponding weights
    const weights: Record<WeightKeys, { yes: number; no: number }> = {
      awareOfPresence: { yes: 20, no: 0 },
      logisticsSupportRange: { yes: 25, no: 0 },
      isrCoverage: { yes: 10, no: 0 },
      gpsWorking: { yes: 10, no: 0 },
      communicationsWorking: { yes: 10, no: 0 },
      fireSupportRange: { yes: 15, no: 0 },
      patternForceRange: { yes: 10, no: 0 }
    };

    // Calculate score based on current state values of questions
    score += weights.awareOfPresence[question1.toLowerCase() as 'yes' | 'no'];
    score += weights.logisticsSupportRange[question2.toLowerCase() as 'yes' | 'no'];
    score += weights.isrCoverage[question3.toLowerCase() as 'yes' | 'no'];
    score += weights.gpsWorking[question4.toLowerCase() as 'yes' | 'no'];
    score += weights.communicationsWorking[question5.toLowerCase() as 'yes' | 'no'];
    score += weights.fireSupportRange[question6.toLowerCase() as 'yes' | 'no'];
    score += weights.patternForceRange[question7.toLowerCase() as 'yes' | 'no'];

    return score;
  };

  // Calculates the score based on different tactics for each engagement
  const calculateEnemyRealTimeScore = () => {
    let score = 0;

    score = ((20 * Number(unitTactics?.awareness)) + (25 * Number(unitTactics?.logistics) + (10 * Number(unitTactics?.coverage)) + (10 * Number(unitTactics?.gps)) +
      (10 * Number(unitTactics?.comms)) + (15 * Number(unitTactics?.fire)) + (10 * Number(unitTactics?.pattern))));

    return score;
  };


  // Printing scores into the Engagement Data card in AAR
  const answers: Form[] = [
    { ID: 'Aware of OPFOR?', friendlyScore: weights.awareOfPresence[question1.toLowerCase() as 'yes' | 'no'], enemyScore: 20 * Number(unitTactics?.awareness) },
    { ID: 'Within Logistics Support Range?', friendlyScore: weights.logisticsSupportRange[question2.toLowerCase() as 'yes' | 'no'], enemyScore: 25 * Number(unitTactics?.logistics) },
    { ID: 'Within RPA/ISR Coverage?', friendlyScore: weights.isrCoverage[question3.toLowerCase() as 'yes' | 'no'], enemyScore: 10 * Number(unitTactics?.coverage) },
    { ID: 'Working GPS?', friendlyScore: weights.gpsWorking[question4.toLowerCase() as 'yes' | 'no'], enemyScore: 10 * Number(unitTactics?.gps) },
    { ID: 'Working Communications?', friendlyScore: weights.communicationsWorking[question5.toLowerCase() as 'yes' | 'no'], enemyScore: 10 * Number(unitTactics?.comms) },
    { ID: 'Within Fire Support Range?', friendlyScore: weights.fireSupportRange[question6.toLowerCase() as 'yes' | 'no'], enemyScore: 15 * Number(unitTactics?.fire) },
    { ID: 'Within Range of a Pattern Force?', friendlyScore: weights.patternForceRange[question7.toLowerCase() as 'yes' | 'no'], enemyScore: 10 * Number(unitTactics?.pattern) }
  ]


  // Maps each tactic and its corresponding blue/red score to a row
  const tacticToRow = (answers: Form[]) => (
    answers.map((tactic) => (
      <Table.Tr key={tactic.ID}>
        <Table.Td>{tactic.ID}</Table.Td>
        <Table.Td>{tactic.friendlyScore}</Table.Td>
        <Table.Td>{tactic.enemyScore}</Table.Td>
      </Table.Tr>
    ))
  );

  // Sets value of readiness bar in inital display based on readiness level that is initialized
  const getReadinessProgress = (force_readiness: string | undefined) => {
    switch (force_readiness) {
      case 'Untrained':
        return 0;
      case 'Low':
        return 25;
      case 'Medium':
        return 50;
      case 'High':
        return 75;
      case 'Elite':
        return 100;
      default:
        return <div>Error: Invalid Force Readiness</div>
    }
  }

  // Sets value of skill bar in intial display based on skill level thtat is intialized
  const getForceSkill = (force_skill: string | undefined) => {
    switch (force_skill) {
      case 'Untrained':
        return 0;
      case 'Basic':
        return 33;
      case 'Advanced':
        return 66;
      case 'Elite':
        return 100;
      default:
        return <div>Error: Invalid Force Skill</div>
    }
  }


  // Sets color of Force Readiness bar on the initial engagement page based on initialized readiness value
  const CustomProgressBarReadiness = ({ value }: { value: number }) => {
    let color = 'blue';

    // Set color based on value for readiness
    if (value === 0) {
      color = 'red';
    }
    else if (value <= 25) {
      color = 'orange';
    }
    else if (value <= 50) {
      color = 'yellow';
    }
    else if (value <= 75) {
      color = 'lime';
    }
    else {
      color = 'green';
    }

    return (
      <Group grow gap={5} mb="xs">
        <Progress
          size="xl"
          color={color}
          value={value > 0 ? 100 : 0}
          transitionDuration={0}
        />
        <Progress size="xl" color={color} transitionDuration={0} value={value < 30 ? 0 : 100} />
        <Progress size="xl" color={color} transitionDuration={0} value={value < 50 ? 0 : 100} />
        <Progress size="xl" color={color} transitionDuration={0} value={value < 70 ? 0 : 100} />
      </Group>
    );
  };

  // Sets color of the Force Skill bar on the initial engagement page based on initialized skill value
  const CustomProgressBarSkill = ({ value }: { value: number }) => {
    let color = 'blue';

    // Set color based on value for readiness
    if (value === 0) {
      color = 'red';
    }
    else if (value <= 50) {
      color = 'yellow';
    }
    else {
      color = 'green';
    }

    return (
      <Group grow gap={5} mb="xs">
        <Progress
          size="xl"
          color={color}
          value={value > 0 ? 100 : 0}
          transitionDuration={0}
        />
        <Progress size="xl" color={color} transitionDuration={0} value={value < 30 ? 0 : 100} />
        <Progress size="xl" color={color} transitionDuration={0} value={value < 50 ? 0 : 100} />
        <Progress size="xl" color={color} transitionDuration={0} value={value < 70 ? 0 : 100} />
      </Group>
    );
  };

  // Sets color of the Unit Health bar on the initial engagement page based on the initialized health value
  // Color may change after each round as each unit's health decreases
  const CustomProgressBarHealth = ({ value }: { value: number }) => {
    let color = 'blue';

    // Set color based on value for readiness
    if (value <= 25) {
      color = 'red';
    }
    else if (value <= 50) {
      color = 'orange';
    }
    else if (value <= 75) {
      color = 'yellow';
    }
    else {
      color = 'green';
    }

    return (
      <Progress value={value} color={color} size={'xl'} mb='xs' />
    );
  };

  // const displayWinner = (friendlyHealth: number, enemyHealth: number): string => {
  //   if (friendlyHealth <= 0 || enemyHealth <= 0) {
  //     return friendlyHealth > enemyHealth ? 'Friendly Won' : 'Enemy Won';
  //   }
  //   return 'Round Summary';
  // };


  // Checks that there is a unit to run an engagement
  const unitNull = () => {
    if (unit_id !== undefined) {
      return true;
    }
  }

  // Starts the battle page if a unit has been selected
  if (unitNull()) {
    return (
      <MantineProvider defaultColorScheme='dark'>
        <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false} style={{ padding: '20px' }}>
          <Stepper.Step allowStepSelect={false} icon={<IconSwords stroke={1.5} style={{ width: rem(27), height: rem(27) }} />}>
            <h1 style={{ justifyContent: 'center', display: 'flex', alignItems: 'center' }}>Round {round}</h1>
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
                    <Card.Section><Center><h2>{selectedUnit}</h2></Center></Card.Section>
                    {unit ? (
                      <Text size="xl" style={{ whiteSpace: 'pre-line' }}>
                        <strong>Type:</strong> {unit_type}<br />
                        <Space mb="5px" />
                        <strong>Unit Size:</strong> {unit_size}<br />
                        <Space mb="5px" />
                        <strong>Force Mobility:</strong> {force_mobility}<br />
                        <Space mb="5px" />

                        <strong>Force Readiness:</strong> {force_readiness}<br />
                        <CustomProgressBarReadiness value={Number(getReadinessProgress(force_readiness))} />

                        <strong>Force Skill:</strong> {force_skill}<br />
                        <CustomProgressBarSkill value={Number(getForceSkill((force_skill)))} />

                        <strong>Health:</strong> {friendlyHealth}<br />
                        <CustomProgressBarHealth value={Number(friendlyHealth)} />
                      </Text>
                    ) : (
                      <Text size="sm">Unit not found</Text>
                    )}
                  </Card>
                </Grid.Col>


                {/* Displays a card that contains pertinent information about the selected enemy unit */}
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

                      <Card.Section><Center><h2>{enemyUnit.unit_id}</h2></Center></Card.Section>
                      {unit ? (
                        <Text size="xl">
                          <strong>Type:</strong> {enemyUnit.unit_type}<br />
                          <Space mb="5px" />
                          <strong>Unit Size:</strong> {enemyUnit.unit_size}<br />
                          <Space mb="5px" />
                          <strong>Force Mobility:</strong> {enemyUnit.force_mobility}<br />
                          <Space mb="5px" />

                          <strong>Force Readiness:</strong> {enemyUnit.force_readiness}<br />
                          <CustomProgressBarReadiness value={Number(getReadinessProgress(enemyUnit.force_readiness))} />

                          <strong>Force Skill:</strong> {enemyUnit.force_skill}<br />
                          <CustomProgressBarSkill value={Number(getForceSkill((enemyUnit.force_skill)))} />

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
                          data={enemyUnits.map(eUnit => ({ value: eUnit.id.toString(), label: eUnit.unit_id }))}
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
          </Stepper.Step>

          {/* This begins the yes/no pages for the students to answer about individual tactics*/}
          {/* Phase 1 questions about OPFOR and logistics support */}
          <Stepper.Step allowStepSelect={false} label="Force Strength" icon={<IconNumber1Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}>
            <div>
              <p>Phase 1: Force Strength</p>
              <Grid>
                <Grid.Col span={4}>
                  <h1>Friendly: {selectedUnit}</h1>
                  <p>Aware of OPFOR presence?</p>
                  <SegmentedControl value={question1} onChange={setQuestion1} size='xl' radius='xs' color="gray" data={['Yes', 'No']} />
                  <p>Within logistics support range?</p>
                  <SegmentedControl value={question2} onChange={setQuestion2} size='xl' radius='xs' color="gray" data={['Yes', 'No']} />
                </Grid.Col>
                <Grid.Col span={6}>
                  <h1>Enemy: {enemyUnit?.unit_id}</h1>
                  <p>Aware of OPFOR presence?</p>
                  <SegmentedControl
                    size='xl'
                    radius='xs'
                    color="gray"
                    data={['Yes', 'No']}
                    value={unitTactics?.awareness ? 'Yes' : 'No'} // Assuming awareness is a boolean in unitTactics
                    disabled
                  />
                  <p>Within logistics support range?</p>
                  <SegmentedControl
                    size='xl'
                    radius='xs'
                    color="gray"
                    data={['Yes', 'No']}
                    value={unitTactics?.logistics ? 'Yes' : 'No'}
                    disabled
                  />
                </Grid.Col>
              </Grid>

              {/* Button to continue to the next page */}
              <Group justify="center" mt="xl">
                <Button onClick={nextStep}>Continue</Button>
              </Group>

            </div>
          </Stepper.Step>

          {/* Phase 2 questions about ISR coverage and GPS*/}
          <Stepper.Step allowStepSelect={false} label="Tactical Advantage" icon={<IconNumber2Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}>
            <div>
              <p>Phase 2: Tactical Advantage</p>
              <Grid>
                <Grid.Col span={6}>
                  <h1>Friendly: {selectedUnit}</h1>
                  <p>Under ISR coverage?</p>
                  <SegmentedControl value={question3} onChange={setQuestion3} size='xl' radius='xs' color="gray" data={['Yes', 'No']} />
                  <p>Working GPS?</p>
                  <SegmentedControl value={question4} onChange={setQuestion4} size='xl' radius='xs' color="gray" data={['Yes', 'No']} />
                </Grid.Col>
                <Grid.Col span={6}>
                  <h1>Enemy: {enemyUnit?.unit_id}</h1>
                  <p>Under ISR coverage?</p>
                  <SegmentedControl
                    size='xl'
                    radius='xs'
                    color="gray"
                    data={['Yes', 'No']}
                    value={unitTactics?.coverage ? 'Yes' : 'No'}
                    disabled
                  />
                  <p>Working GPS?</p>
                  <SegmentedControl
                    size='xl'
                    radius='xs'
                    color="gray"
                    data={['Yes', 'No']}
                    value={unitTactics?.gps ? 'Yes' : 'No'}
                    disabled
                  />
                </Grid.Col>
              </Grid>

              {/* Separate buttons to continue or return to previous page */}
              <Group justify="center" mt="xl">
                <Button onClick={prevStep}>Go Back</Button>
                <Button onClick={nextStep}>Next Phase</Button>
              </Group>
            </div>
          </Stepper.Step>

          {/* Phase 3 questions about communications and fire support range */}
          <Stepper.Step allowStepSelect={false} label="Fire Support" icon={<IconNumber3Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />} >
            <div>
              <p>Phase 3: Fire Support</p>
              <Grid>
                <Grid.Col span={6}>
                  <h1>Friendly: {selectedUnit}</h1>
                  <p>Working communications?</p>
                  <SegmentedControl value={question5} onChange={setQuestion5} size='xl' radius='xs' color="gray" data={['Yes', 'No']} />
                  <p>Within fire support range?</p>
                  <SegmentedControl value={question6} onChange={setQuestion6} size='xl' radius='xs' color="gray" data={['Yes', 'No']} />
                </Grid.Col>
                <Grid.Col span={6}>
                  <h1>Enemy: {enemyUnit?.unit_id}</h1>
                  <p>Working communications?</p>
                  <SegmentedControl
                    size='xl'
                    radius='xs'
                    color="gray"
                    data={['Yes', 'No']}
                    value={unitTactics?.comms ? 'Yes' : 'No'}
                    disabled
                  />
                  <p>Within fire support range?</p>
                  <SegmentedControl
                    size='xl'
                    radius='xs'
                    color="gray"
                    data={['Yes', 'No']}
                    value={unitTactics?.fire ? 'Yes' : 'No'}
                    disabled
                  />
                </Grid.Col>
              </Grid>

              {/* Separate buttons to go back or continue to the next page */}
              <Group justify="center" mt="xl">
                <Button onClick={prevStep}>Go Back</Button>
                <Button onClick={nextStep}>Next Phase</Button>
              </Group>
            </div>
          </Stepper.Step>

          {/* Phase 4 question about the unit being accessible by a pattern force */}
          <Stepper.Step allowStepSelect={false} label="Terrain" icon={<IconNumber4Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}>
            <div>
              <p>Phase 4: Terrain</p>
              <Grid>
                <Grid.Col span={6}>
                  <h1>Friendly: {selectedUnit}</h1>
                  <p>Accessible by pattern force?</p>
                  <SegmentedControl value={question7} onChange={setQuestion7} size='xl' radius='xs' color="gray" data={['Yes', 'No']} disabled={progress !== 0} />
                </Grid.Col>
                <Grid.Col span={6}>
                  <h1>Enemy: {enemyUnit?.unit_id}</h1>
                  <p>Accessible by pattern force?</p>
                  <SegmentedControl
                    size='xl'
                    radius='xs'
                    color="gray"
                    data={['Yes', 'No']}
                    value={unitTactics?.pattern ? 'Yes' : 'No'}
                    disabled
                  />
                </Grid.Col>
              </Grid>
              <Group justify="center" mt="xl">

                {/* Button to go back */}
                <Button onClick={prevStep} disabled={progress !== 0}>Go Back</Button>

                {/* Finalize Score button that includes a animated progress bar to visually slow down the calculations to the cadet*/}
                <Button
                  className={classes.button}
                  onClick={() => {
                    if (!interval.active) {
                      interval.start();
                    }
                    finalizeTactics();
                    console.log("total friendly damage: ", totalFriendlyDamage);
                  }}
                  color={theme.primaryColor}
                >
                  <div className={classes.label}>    {progress !== 0 ? 'Calculating Scores...' : loaded ? 'Complete' : 'Finalize Tactics'}</div>
                  {progress !== 0 && (
                    <Progress
                      style={{ height: '100px', width: '200px' }}
                      value={progress}
                      className={classes.progress}
                      color={rgba(theme.colors.blue[2], 0.35)}
                      radius="0px"
                    />
                  )}
                </Button>
              </Group>
            </div>
          </Stepper.Step>
          {/* Dnd of yes/no questions for cadets */}

          {/* AAR PAGE */}
          {/* Displays the round summary page with comparisons between friendly and enemy units */}
          <Stepper.Step allowStepSelect={false} icon={<IconHeartbeat stroke={1.5} style={{ width: rem(35), height: rem(35) }} />}>
            <div>
              {/*  style={{backgroundColor: 'yellow'}} */}
              {/* <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{((Number(friendlyHealth) <= 0) || (Number(enemyHealth) <= 0)) ? displayWinner(Number(friendlyHealth), Number(enemyHealth)) : 'Round ' + (round - 1) + ' After Action Review'}</h1> */}

              <Group justify="center" mt="xl" display={'flex'}>
                <Card shadow="sm" padding="md" radius="md" withBorder style={{ width: '600px', textAlign: 'center' }} display={'flex'}>
                  <Card.Section withBorder inheritPadding py="xs">
                    <div style={{ textAlign: 'center' }}>
                      <h2>{((Number(friendlyHealth) <= 0) || (Number(enemyHealth) <= 0)) ? 'Final After Action Review' : 'Round After Action Review'}</h2>
                    </div>
                  </Card.Section>

                  <Card.Section withBorder inheritPadding py="xs">
                    <Container>
                      <Text size="xl" fw={700}>Damage</Text>
                    </Container>

                    {/* Friendly Damage Bar */}
                    <Grid >
                      <Grid.Col span={2} style={{ display: 'flex', alignItems: 'center' }}>
                        <Text size="sm">{unit_id}</Text>
                      </Grid.Col>

                      <Grid.Col span={10}>
                        <Tooltip
                          color="gray"
                          position="bottom"
                          transitionProps={{ transition: 'fade-up', duration: 400 }}
                          label={"Friendly Health Remaining: " + (friendlyHealth)}
                        >
                          <Progress.Root size={30} classNames={{ label: classes.progressLabel }} m={10}>
                            <Progress.Section value={friendlyHealth} color={'#3d85c6'} key={'remaining'}>
                              {totalFriendlyDamage === 0 ? 'No Damage' : ''}
                            </Progress.Section>

                            <Progress.Section value={Number(totalFriendlyDamage)} color={'#2b5d8b'} key={'taken'}>
                              {friendlyHealth <= 0 ? 'FATAL' : '-' + Number(totalFriendlyDamage).toFixed(0)}
                            </Progress.Section>
                          </Progress.Root>
                        </Tooltip>
                      </Grid.Col>

                    </Grid>

                    {/* Enemy Damage Bar */}
                    <Grid >
                      <Grid.Col span={2} style={{ display: 'flex', alignItems: 'center' }}>
                        <Text size="sm">{enemyUnit?.unit_id}</Text>
                      </Grid.Col>

                      <Grid.Col span={10}>
                        <Tooltip
                          color="gray"
                          position="bottom"
                          transitionProps={{ transition: 'fade-up', duration: 400 }}
                          label={"Enemy Health Remaining: " + enemyHealth}
                        >
                          <Progress.Root size={30} classNames={{ label: classes.progressLabel }} m={10}>
                            <Progress.Section value={enemyHealth} color={'#c1432d'} key={'remaining'}>
                              {totalEnemyDamage === 0 ? 'No Damage' : ''}
                            </Progress.Section>

                            <Progress.Section value={Number(totalEnemyDamage)} color={'#872f1f'} key={'taken'}>
                              {enemyHealth <= 0 ? 'FATAL' : '-' + Number(totalEnemyDamage).toFixed(0)}
                            </Progress.Section>
                          </Progress.Root>
                        </Tooltip>
                      </Grid.Col>
                    </Grid>
                  </Card.Section>


                  <Card.Section withBorder inheritPadding py="xs">
                    <Container>
                      <Text size="xl" fw={700}>Tactics</Text>
                    </Container>

                    {/* Displays a table with the scoring of each tactic of both friendly and enemy units */}
                    <Table verticalSpacing={'xs'} style={{ justifyContent: 'center' }}>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Tactic</Table.Th>
                          <Table.Th style={{ color: '#3d85c6' }}>Friendly Score</Table.Th>
                          <Table.Th style={{ color: '#c1432d' }}>Enemy Score</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>{tacticToRow(answers)}</Table.Tbody>
                    </Table>
                  </Card.Section>


                  <Card.Section withBorder inheritPadding py="xs">


                    <Text size="xl" fw={700}>Scores</Text>

                    {/* This displays the round summary based on calculations for tactics and overall unit characteristics for the friendly units */}
                    <Grid style={{ justifyContent: 'center', alignItems: 'center' }}>
                      <Group style={{ flex: 1, textAlign: 'center' }}>
                        <Grid.Col>
                          <Text size="lg" fw={500}>Attributes</Text>

                          {/* Friendly Attribute Score */}
                          <Tooltip
                            color="gray"
                            position="bottom"
                            transitionProps={{ transition: 'fade-up', duration: 400 }}
                            label="Friendly Attribute Score"
                          >
                            <Progress.Root m={10} style={{ height: '20px' }}>

                              <Progress.Section
                                className={classes.progressSection}
                                value={baseValue}
                                color='#3d85c6'>
                                {baseValue.toFixed(0)}
                              </Progress.Section>

                            </Progress.Root>
                          </Tooltip>

                          {/* Enemy Attribute Score */}
                          <Tooltip
                            color="gray"
                            position="bottom"
                            transitionProps={{ transition: 'fade-up', duration: 400 }}
                            label="Enemy Attribute Score"
                          >
                            <Progress.Root m={10} style={{ height: '20px' }}>

                              <Progress.Section
                                className={classes.progressSection}
                                value={enemyBaseValue}
                                color='#c1432d'>
                                {enemyBaseValue.toFixed(0)}
                              </Progress.Section>

                            </Progress.Root>
                          </Tooltip>
                          {/* 
                          <Text size="lg">Friendly Damage Taken:</Text>
                          <Text> {Number(totalFriendlyDamage).toFixed(0)}</Text> */}
                        </Grid.Col>
                      </Group>


                      {/* This displays the round summary based on calculations for tactics and overall unit characteristics for the enemy units */}
                      <Group style={{ flex: 1, textAlign: 'center' }}>
                        <Grid.Col>
                          <Text size="lg" fw={500}>Tactics</Text>

                          {/* Friendly Tactics Score */}
                          <Tooltip
                            color="gray"
                            position="bottom"
                            transitionProps={{ transition: 'fade-up', duration: 400 }}
                            label="Friendly Tactics Score"
                          >
                            <Progress.Root m={10} style={{ height: '20px' }}>

                              <Progress.Section
                                className={classes.progressSection}
                                value={calculateRealTimeScore()}
                                color='#3d85c6'>
                                {calculateRealTimeScore()}
                              </Progress.Section>

                            </Progress.Root>
                          </Tooltip>

                          {/* Enemy Tactics Score */}
                          <Tooltip
                            color="gray"
                            position="bottom"
                            transitionProps={{ transition: 'fade-up', duration: 400 }}
                            label="Enemy Tactics Score"
                          >
                            <Progress.Root m={10} style={{ height: '20px' }}>

                              <Progress.Section
                                className={classes.progressSection}
                                value={calculateEnemyRealTimeScore()}
                                color='#c1432d'>
                                {calculateEnemyRealTimeScore()}
                              </Progress.Section>

                            </Progress.Root>
                          </Tooltip>

                          {/* <Text size="lg">Enemy Damage Taken:</Text>
                          <Text> {totalEnemyDamage.toFixed(0)}</Text> */}
                        </Grid.Col>
                      </Group>
                    </Grid>

                    {/* Displays a progress bar with the total score (overall characteristics and tactics) for the friendly unit */}
                    {/* <div style={{ display: 'flex', justifyContent: 'space-between', padding: '30px' }}>
                      <Progress.Root style={{ width: '200px', height: '25px' }}>
                        <Tooltip
                          position="top"
                          transitionProps={{ transition: 'fade-up', duration: 300 }}
                          label="Overall Score Out of 100"
                        >
                          <Progress.Section
                            className={classes.progressSection}
                            value={Math.round((baseValue * .70) + (Number(realTimeScore) * .30))}
                            color="#4e87c1">
                            {Math.round((baseValue * .70) + (Number(realTimeScore) * .30))}
                          </Progress.Section>
                        </Tooltip>
                      </Progress.Root> */}

                    {/* Displays a progress bar with the total score (overall characteristics and tactics) for the enemy unit */}
                    {/* <Progress.Root style={{ width: '200px', height: '25px' }}>
                        <Tooltip
                          position="top"
                          transitionProps={{ transition: 'fade-up', duration: 300 }}
                          label="Overall Score Out of 100"
                        >
                          <Progress.Section
                            className={classes.progressSection}
                            value={Math.round((enemyBaseValue * .70) + (Number(realTimeScore) * .30))}
                            color="#bd3058">
                            {Math.round((enemyBaseValue * .70) + (Number(realTimeScore) * .30))}
                          </Progress.Section>
                        </Tooltip>
                      </Progress.Root>
                    </div> */}

                  </Card.Section>





                </Card>
              </Group>


              {/* Button that either moves the engagement to the next round or ends the engagement based off of friendly and enemy health */}
              <Group justify="center" mt="xl" display={'flex'}>
                <Button display='flex' onClick={() => handleNextRound(Number(friendlyHealth), Number(enemyHealth))}>
                  {((Number(friendlyHealth) <= 0) || (Number(enemyHealth) <= 0)) ? 'Exit' : 'Continue Enagement'}
                </Button>
              </Group>
            </div>
          </Stepper.Step>
        </Stepper>
      </MantineProvider>
    );
  }
  // End of the rendering of the battle page

  // If there is no selected unit, navigate back to the home page
  // Deals with an issue with the refresh button
  else {
    console.log('Selected Unit: ', selectedUnit);
    navigate('/')
    return (
      <Text> Error. Rerouting. </Text>
    );
  }
}

export default BattlePage;

