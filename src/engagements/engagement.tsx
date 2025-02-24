import React, { useEffect, useState } from 'react';
import { Stepper, Button, Text, Group, rem, Grid } from '@mantine/core';
import { IconHeartbeat, IconSwords, IconNumber1Small, IconNumber2Small, IconNumber3Small } from '@tabler/icons-react';
import { useUnitProvider } from '../context/UnitContext';
import { useUserRole } from '../context/UserContext';
import axios from 'axios';
import UnitSelection from './unitSelection';

// Engagement Data Interface
interface EngagementData {
    w: number; // Field of view
    A: number; // Area covered
    t: number; // Time spent detecting
    P: number; // Probability of detection
    r: number; // Radius of attack
    sigma: number; // Accuracy factor
    Ph: number; // Probability of hitting target
    b: number; // Range
    d_r: number; // Accuracy result
    d_mi: number; // Max damage inflicted
    D: number; // Final damage inflicted
    Fi: number; // Initial health
    Fn: number; // Final health
}

// Unit Interface
interface Unit {
    unit_id: number;
    unit_name: string;
    unit_type: string;
    unit_health: number;
    unit_size: string;
    unit_mobility: string;
}

// Function to initialize Engagement Data
const initializeUnit = (unit: Unit | null): EngagementData => {
    if (!unit) {
        return {
            w: 0, A: 0, t: 0, P: 0, r: 0, sigma: 0, Ph: 0, b: 0, d_r: 0, d_mi: 0, D: 0, Fi: 0, Fn: 0,
        };
    }

    const w = 10;
    const A = Math.PI * Math.pow(15, 2);
    const t = 5;
    const P = 1 - Math.exp((-w * t) / A);
    const r = 10;
    const sigma = 5;
    const Ph = 1 - Math.exp((-Math.pow(r, 2)) / (2 * Math.pow(sigma, 2)));
    const b = 20;
    const d_r = Math.exp((-Math.pow(r, 2)) / (2 * Math.pow(b, 2)));
    const d_mi = 50;
    const D = d_mi * Ph;
    const Fi = unit.unit_health;
    const Fn = Fi - D;

    return { w, A, t, P, r, sigma, Ph, b, d_r, d_mi, D, Fi, Fn };
};

function Engagement() {
    const { selectedUnit, setSelectedUnit } = useUnitProvider();
    const { userSection } = useUserRole();

    const [active, setActive] = useState(0);
    const [units, setUnits] = useState<Unit[]>([]);
    const [enemyUnits, setEnemyUnits] = useState<Unit[]>([]);
    const [enemyUnit, setEnemyUnit] = useState<Unit | null>(null);
    const [friendlyUnit, setFriendlyUnit] = useState<EngagementData | null>(null);
    const [enemyEngagementData, setEnemyEngagementData] = useState<EngagementData | null>(null);
    const [inEngagement, setInEngagement] = useState<boolean>(false);

    // Fetch friendly units
    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const response = await axios.get<Unit[]>(`${process.env.REACT_APP_BACKEND_URL}/api/sectionunits/sectionSort`, {
                    params: { sectionid: userSection },
                });
                setUnits(response.data);
            } catch (error) {
                console.error('Error fetching units:', error);
            }
        };
        fetchUnits();
    }, [userSection]);

    // Fetch enemy units
    useEffect(() => {
        const fetchEnemyUnits = async () => {
            try {
                const response = await axios.get<Unit[]>(`${process.env.REACT_APP_BACKEND_URL}/api/sectionunits/enemyUnits`, {
                    params: { sectionid: userSection },
                });
                setEnemyUnits(response.data);
            } catch (error) {
                console.error('Error fetching enemy units:', error);
            }
        };
        fetchEnemyUnits();
    }, [userSection]);

    // Set engagement data when a unit is selected
    useEffect(() => {
        if (selectedUnit) {
            const unit = units.find((u) => u.unit_id === selectedUnit);
            if (unit) {
                setFriendlyUnit(initializeUnit(unit));
            }
        }
    }, [selectedUnit, units]);

    // Set engagement data when an enemy unit is selected
    const handleSelectEnemy = (value: string | null) => {
        const selected = enemyUnits.find((unit) => unit.unit_id.toString() === value);
        setEnemyUnit(selected || null);
        setEnemyEngagementData(initializeUnit(selected || null));
    };

    // Deselect enemy unit
    const handleDeselectEnemy = () => {
        setEnemyUnit(null);
        setEnemyEngagementData(null);
    };

    // Start engagement
    const handleStartEngagement = () => {
        setInEngagement(true);
        setActive(1);
    };

    return (
        <>
            <Stepper active={active} onStepClick={setActive}>
                <Stepper.Step allowStepSelect={false} icon={<IconSwords stroke={1.5} style={{ width: rem(27), height: rem(27) }} />}>
                    <Text>Round Setup</Text>
                    <Text>Selected Unit: {selectedUnit ? units.find((u) => u.unit_id === selectedUnit)?.unit_name : 'None'}</Text>
                    <UnitSelection
                        enemyUnits={enemyUnits}
                        enemyUnit={enemyUnit}
                        setEnemyUnit={setEnemyUnit}
                        handleSelectEnemy={handleSelectEnemy}
                        handleDeselectEnemy={handleDeselectEnemy}
                        handleStartEngagement={handleStartEngagement}
                        inEngagement={inEngagement}
                    />
                </Stepper.Step>

                <Stepper.Step allowStepSelect={false} label="Detection" icon={<IconNumber1Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}>
                    <Text size="xl" >Detection Phase</Text>

                </Stepper.Step>


                <Stepper.Step allowStepSelect={false} label="Engagement" icon={<IconNumber2Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}>
                    <Text>Engagement Phase</Text>
                </Stepper.Step>

                <Stepper.Step allowStepSelect={false} label="Accuracy" icon={<IconNumber3Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}>
                    <Text>Accuracy Phase</Text>
                </Stepper.Step>

                <Stepper.Step allowStepSelect={false} icon={<IconHeartbeat stroke={1.5} style={{ width: rem(35), height: rem(35) }} />}>
                    {/* Grid layout to display friendly and enemy unit properties side by side */}
                    <Grid gutter="xl">
                        {/* Friendly Unit Properties */}
                        {friendlyUnit && (
                            <Grid.Col span={6}>
                                <Text size="xl" >Friendly Unit Properties</Text>
                                <Text>Field of View (w): {friendlyUnit.w}</Text>
                                <Text>Area Covered (A): {friendlyUnit.A.toFixed(2)}</Text>
                                <Text>Time Spent Detecting (t): {friendlyUnit.t}</Text>
                                <Text>Probability of Detection (P): {friendlyUnit.P.toFixed(4)}</Text>
                                <Text>Radius of Attack (r): {friendlyUnit.r}</Text>
                                <Text>Accuracy Factor (σ): {friendlyUnit.sigma}</Text>
                                <Text>Probability of Hit (Ph): {friendlyUnit.Ph.toFixed(4)}</Text>
                                <Text>Range (b): {friendlyUnit.b}</Text>
                                <Text>Accuracy Result (d_r): {friendlyUnit.d_r.toFixed(4)}</Text>
                                <Text>Max Damage Inflicted (d_mi): {friendlyUnit.d_mi}</Text>
                                <Text>Final Damage Inflicted (D): {friendlyUnit.D.toFixed(2)}</Text>
                                <Text>Initial Health (Fi): {friendlyUnit.Fi}</Text>
                                <Text>Final Health (Fn): {friendlyUnit.Fn.toFixed(2)}</Text>
                            </Grid.Col>
                        )}

                        {/* Enemy Unit Properties */}
                        {enemyEngagementData && (
                            <Grid.Col span={6}>
                                <Text size="xl" >Enemy Unit Properties</Text>
                                <Text>Field of View (w): {enemyEngagementData.w}</Text>
                                <Text>Area Covered (A): {enemyEngagementData.A.toFixed(2)}</Text>
                                <Text>Time Spent Detecting (t): {enemyEngagementData.t}</Text>
                                <Text>Probability of Detection (P): {enemyEngagementData.P.toFixed(4)}</Text>
                                <Text>Radius of Attack (r): {enemyEngagementData.r}</Text>
                                <Text>Accuracy Factor (σ): {enemyEngagementData.sigma}</Text>
                                <Text>Probability of Hit (Ph): {enemyEngagementData.Ph.toFixed(4)}</Text>
                                <Text>Range (b): {enemyEngagementData.b}</Text>
                                <Text>Accuracy Result (d_r): {enemyEngagementData.d_r.toFixed(4)}</Text>
                                <Text>Max Damage Inflicted (d_mi): {enemyEngagementData.d_mi}</Text>
                                <Text>Final Damage Inflicted (D): {enemyEngagementData.D.toFixed(2)}</Text>
                                <Text>Initial Health (Fi): {enemyEngagementData.Fi}</Text>
                                <Text>Final Health (Fn): {enemyEngagementData.Fn.toFixed(2)}</Text>
                            </Grid.Col>
                        )}
                    </Grid>
                </Stepper.Step>
            </Stepper>

            <Group justify="center" mt="xl">
                {/* These buttons are just for development use */}
                <Button variant="default" onClick={() => setActive((current) => Math.max(0, current - 1))}>Back</Button>
                <Button onClick={() => setActive((current) => Math.min(4, current + 1))}>Next</Button>
            </Group>
        </>
    );
}

export default Engagement;