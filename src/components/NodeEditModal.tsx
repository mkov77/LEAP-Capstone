import React, { useEffect, useState } from 'react';
import { Modal, Container, Center, Button, Grid, UnstyledButton, TextInput, Select, Box, Loader, Text, Tabs, SegmentedControl, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import axios from 'axios';
import { Unit } from './Cards';
import { IconEdit, IconSquarePlus, IconSquareX } from '@tabler/icons-react';

interface NodeEditProps {
    isOpen: boolean;
    onClose: () => void;
    nodeID: number;
    is_friendly: boolean;
    userSection: string;
    is_root: boolean
}



export default function NodeEditModal({ isOpen, onClose, nodeID, is_friendly, userSection, is_root }: NodeEditProps) {

    const [formValues, setFormValues] = useState({
        unit_name: '',
        updated_unit_name: '',
        unit_type: '',
        unit_health: 100,
        unit_role: '',
        unit_size: '',
        unit_posture: '',
        unit_readiness: '',
        unit_skill: '',
        unit_mobility: '',
        is_friendly,
        root: false
    });
    const [presetUnits, setPresetUnits] = useState<Unit[]>([]);
    const [segmentValues, setSegmentValues] = useState({
        awareness: 1,
        logistics: 1,
        coverage: 1,
        gps: 1,
        comms: 1,
        fire: 1,
        pattern: 1
    });
    const [unitTactics, setUnitTactics] = useState({
        awareness: 1,
        logistics: 1,
        coverage: 1,
        gps: 1,
        comms: 1,
        fire: 1,
        pattern: 1
    });
    const [addNodeOpened, { open: openAddNode, close: closeAddNode }] = useDisclosure(false);
    const [unit, setUnit] = useState<Unit>();
    const [deleteConfirmOpened, { open: openDeleteConfirm, close: closeDeleteConfirm }] = useDisclosure(false);
    const [editNodeOpened, { open: openEditNode, close: closeEditNode }] = useDisclosure(false);

    const [nodeValues, setNodeValues] = useState({
        unit_name: '',
        unit_type: '',
        unit_health: 100,
        unit_role: '',
        unit_size: '',
        unit_posture: '',
        unit_readiness: '',
        unit_skill: '',
        unit_mobility: '',
        is_friendly,
        root: false,
    });




    useEffect(() => {
        const fetchUnitData = async () => {
            // Check if we are a root first
            if (is_root) {
                console.log("!!WE A ROOT. WE A ROOT.");
                onClose();        // Close the main modal
                openAddNode();    // Open the Add Node modal
                return;           // Skip fetching the unit data if is_root is true
            }

            try {
                // Fetch unit data
                const response = await axios.get(`http://localhost:5000/api/unit/${nodeID}`);
                console.log("Retrieving unit: ", nodeID);
                const data = response.data[0]; // Accessing data directly from response
                setUnit(data); // Set the fetched data to the unit state
                console.log("Unit updated: ", data); // Log the new unit data

                // Fetch unit tactics based on unit_id from unit data
                if (data?.unit_id) {
                    const tacticsResponse = await axios.get(`http://localhost:5000/api/unitTactics/${data.unit_id}`);
                    console.log("Fetching unit tactics for unit ID:", data.unit_id);
                    const tacticsData = tacticsResponse.data;
                    setUnitTactics(tacticsData); // Update the unitTactics state
                    console.log("Unit tactics updated:", tacticsData);
                }
            } catch (error) {
                console.error('Error fetching unit data or unit tactics:', error);
            }
        };

        // Fetch data when the page is rendered or nodeID changes
        fetchUnitData();
        fetchPresetUnits();
    }, [nodeID, is_root]); // Add is_root as a dependency so it triggers when this value changes


    // Update nodeValues when the unit data changes
    useEffect(() => {
        if (unit) {
            setNodeValues({
                unit_name: unit?.unit_name || '',
                unit_type: unit?.unit_type || '',
                unit_health: Number(unit?.unit_health) || 0,
                unit_role: unit?.unit_role || '',
                unit_size: unit?.unit_size || '',
                unit_posture: unit?.unit_posture || '',
                unit_readiness: unit?.unit_readiness || '',
                unit_skill: unit?.unit_skill || '',
                unit_mobility: unit?.unit_mobility || '',
                is_friendly,
                root: unit?.is_root,
            });
        }
    }, [unit]); // Update nodeValues when unit data is fetched and set

    const handleModalClose = () => {
        resetForm();  // Reset the form on modal close
        closeAddNode();    // Close the modal
      };

    // FUNCTION: FETCH PRESET UNITS
    const fetchPresetUnits = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/preset_units');

            const normalizedData = response.data.map((unit: any) => ({
                unit_name: unit.unit_name,
                unit_type: unit.unit_type,
                is_friendly: unit.is_friendly,
                unit_health: 100, // Default health
                unit_role: unit.unit_role,
                unit_size: unit.unit_size,
                unit_posture: unit.unit_posture,
                unit_mobility: unit.unit_mobility || 'Unknown',
                unit_readiness: unit.unit_readiness,
                unit_skill: unit.unit_skill
            }));

            // Filter preset units based on the is_friendly prop
            const filteredPresetUnits = normalizedData.filter((unit: { is_friendly: boolean; }) => unit.is_friendly === is_friendly);

            console.log("Fetching and filtering preset units");
            console.log(filteredPresetUnits);

            setPresetUnits(filteredPresetUnits); // Set filtered preset units
        } catch (error) {
            console.error('Error fetching preset units:', error);
        }
    };


    // FUNCTION: HANDLE DELETE NODE
    const handleDeleteNode = async () => {
        if (!nodeID) {
            console.log('Node ID cannot be empty');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/deleteNode/${nodeID}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                console.log(`Node ${nodeID} and its children have been deleted successfully.`);
            } else {
                console.log(`Error: Unable to delete node ${nodeID}.`);
            }
        } catch (error) {
            console.log(`Error: ${error}`);
        }

        console.log("hmmm yeah this will delete one of these days")
        closeDeleteConfirm();
        onClose();
    };


    // FUNCTION HANDLE SELECT CHANGE
    const handleSelectChange = async (value: string | null, name: string) => {
        if (name === 'ID') {
            console.log("handling select change...?");

            const selectedUnit = presetUnits.find(unit => unit.unit_name === value);

            if (selectedUnit) {
                // Auto-populate form fields with the selected unit's data
                setFormValues({
                    unit_name: selectedUnit.unit_name,
                    updated_unit_name: selectedUnit.unit_name,
                    unit_type: selectedUnit.unit_type,
                    unit_health: 100, // Default value, or use `selectedUnit.unit_health` if available
                    unit_role: selectedUnit.unit_role,
                    unit_size: selectedUnit.unit_size,
                    unit_posture: selectedUnit.unit_posture,
                    unit_readiness: selectedUnit.unit_readiness,
                    unit_skill: selectedUnit.unit_skill,
                    unit_mobility: selectedUnit.unit_mobility,
                    is_friendly: is_friendly,
                    root: true, // Adjust if needed based on the selected unit
                });

                try {
                    // Step 1: Fetch tactics from `preset_tactics` where unit_name matches
                    const tacticsResponse = await axios.get(`http://localhost:5000/api/preset_tactics`, {
                        params: {
                            unit_name: selectedUnit.unit_name,
                        }
                    });

                    if (tacticsResponse.status === 200 && tacticsResponse.data) {
                        const presetTactics = tacticsResponse.data.tactics; // Assuming the API response contains tactics data

                        console.log("But do we get the tactics? ", tacticsResponse.data.tactics)

                        // Step 2: Auto-populate segmentValues (for tactics)
                        setSegmentValues({
                            awareness: presetTactics.awareness,
                            logistics: presetTactics.logistics,
                            coverage: presetTactics.coverage,
                            gps: presetTactics.gps,
                            comms: presetTactics.comms,
                            fire: presetTactics.fire,
                            pattern: presetTactics.pattern
                        });
                    } else {
                        console.warn("No tactics found for the selected unit.");
                    }
                } catch (error) {
                    console.error("Error fetching preset tactics:", error);
                }
            }
        } else {
            // Update form values for other fields
            setFormValues(prevValues => ({
                ...prevValues,
                [name]: value ?? '',
            }));
        }
    };


    // FUNCTION HANDLE NODE CHANGE
    const handleNodeChange = (value: string | null, fieldName: string) => {
        setNodeValues((prevValues) => ({
            ...prevValues,
            [fieldName]: value,
        }));
    };

    //   FUNCTION: HANDLE SUBMIT
    const handleAddSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const requiredFields = [
            'updated_unit_name', 'unit_type', 'unit_health', 
            'unit_role', 'unit_size', 'unit_posture', 
            'unit_readiness', 'unit_skill'
          ];

        // Check required fields
        for (const field of requiredFields) {
            if (!formValues[field as keyof typeof formValues]) {
                alert(`The field "${field}" is required.`);
                return; // Stop submission if any required field is missing
            }
        }

        try {
            // Step 1: Submit the unit data to the section_units table
            const unitResponse = await axios.post(`http://localhost:5000/api/section_units`, {
                unit_name: formValues.updated_unit_name,
                unit_health: formValues.unit_health,
                unit_type: formValues.unit_type,
                unit_role: formValues.unit_role,
                unit_size: formValues.unit_size,
                unit_posture: formValues.unit_posture,
                unit_mobility: formValues.unit_mobility,
                unit_readiness: formValues.unit_readiness,
                unit_skill: formValues.unit_skill,
                is_friendly: formValues.is_friendly,
                is_root: is_root,
                section_id: userSection
            });

            if (unitResponse.status === 200 || unitResponse.status === 201) {
                const newNodeID = unitResponse.data.node.unit_id; // Assuming response contains the new node's ID
                console.log('New node added with ID:', newNodeID);

                // Step 2: Submit the tactics data to the section_tactics table
                const tacticsResponse = await axios.post('http://localhost:5000/api/newsectionunit/tactics', {
                    awareness: segmentValues.awareness,
                    logistics: segmentValues.logistics,
                    coverage: segmentValues.coverage,
                    gps: segmentValues.gps,
                    comms: segmentValues.comms,
                    fire: segmentValues.fire,
                    pattern: segmentValues.pattern,
                });

                if (tacticsResponse.status === 200 || tacticsResponse.status === 201) {
                    console.log('Tactics successfully added for unit ID:', newNodeID);
                } else {
                    console.error('Failed to add tactics:', tacticsResponse);
                }

                if (!is_root) {
                    await axios.post('http://localhost:5000/api/newchildnode', {
                        child_id: newNodeID,  // The new child node's ID
                        parent_id: unit?.unit_id  // The parent node's ID
                    });
                }

            } else {
                console.error('Failed to add unit:', unitResponse);
            }
        } catch (error) {
            console.error('Error adding unit and tactics:', error);
        }

        // Close the modal and reset the form
        closeAddNode();
        resetForm();
        onClose();
    };


    const handleEditSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
    
        const requiredFields = ['unit_name', 'unit_type', 'unit_health', 'unit_role', 'unit_size', 'unit_posture', 'unit_readiness', 'unit_skill'];
    
        // Check required fields
        for (const field of requiredFields) {
            if (!nodeValues[field as keyof typeof nodeValues]) {
                alert(`The field "${field}" is required.`);
                return; // Stop submission if any required field is missing
            }
        }
    
        try {
            // Step 1: Submit the unit data to the section_units table
            const unitResponse = await axios.post(`http://localhost:5000/api/update_unit`, {
                unit_id: unit?.unit_id,
                unit_name: nodeValues.unit_name,
                unit_health: nodeValues.unit_health,
                unit_type: nodeValues.unit_type,
                unit_role: nodeValues.unit_role,
                unit_size: nodeValues.unit_size,
                unit_posture: nodeValues.unit_posture,
                unit_mobility: nodeValues.unit_mobility,
                unit_readiness: nodeValues.unit_readiness,
                unit_skill: nodeValues.unit_skill,
                is_friendly: nodeValues.is_friendly,
                is_root: is_root,
                section_id: userSection
            });
    
            if (unitResponse.status === 200 || unitResponse.status === 201) {
                console.log('Updated unit:', unit?.unit_id);
    
                // Step 2: Submit the tactics data to the section_tactics table
                const tacticsResponse = await axios.post('http://localhost:5000/api/update/tactics', {
                    unit_id: unit?.unit_id, // Include unit_id to associate tactics with the correct unit
                    awareness: unitTactics.awareness,
                    logistics: unitTactics.logistics,
                    coverage: unitTactics.coverage,
                    gps: unitTactics.gps,
                    comms: unitTactics.comms,
                    fire: unitTactics.fire,
                    pattern: unitTactics.pattern,
                });
    
                if (tacticsResponse.status === 200 || tacticsResponse.status === 201) {
                    console.log('Tactics successfully updated for unit ID:', unit?.unit_id);
                } else {
                    console.error('Failed to update tactics:', tacticsResponse);
                }
    
            } else {
                console.error('Failed to update unit:', unitResponse);
            }
        } catch (error) {
            console.error('Error updating unit and tactics:', error);
        }
    
        // Close the modal and reset the form
        closeAddNode();
        resetForm();
        onClose();
    };    

    // FUNCTION: RESET FORM
    const resetForm = () => {
        setFormValues({
            unit_name: '',
            updated_unit_name: '',
            unit_type: '',
            unit_health: 100,
            unit_role: '',
            unit_size: '',
            unit_posture: '',
            unit_readiness: '',
            unit_skill: '',
            unit_mobility: '',
            is_friendly: is_friendly, // Reset friendly status if it's part of your form
            root: false
        });
        setSegmentValues({
            awareness: 1,
            logistics: 1,
            coverage: 1,
            gps: 1,
            comms: 1,
            fire: 1,
            pattern: 1
        });
    };

    // FUNCTION: HANDLE CHANGE
    const handleChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        console.log('handling change..?');
        const { name, value } = event.currentTarget;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value
        }));
    };

    // FUNCTION: HANDLE SEGMENT CHANGE
    const handleSegmentChange = (value: string, segmentName: keyof typeof segmentValues) => {
        console.log("handling segment change...?");
        const updatedSegments = { ...segmentValues };

        // Map 'Yes' to 1 and 'No' to 0
        updatedSegments[segmentName] = value === 'Yes' ? 1 : 0;

        setSegmentValues(updatedSegments);
    };


    // FUNCTION: HANDLE SEGMENT CHANGE
    const handleTacticsChange = (value: string, segmentName: keyof typeof unitTactics) => {
        console.log("handling segment change...?");
        const updatedSegments = { ...unitTactics };

        // Map 'Yes' to 1 and 'No' to 0
        updatedSegments[segmentName] = value === 'Yes' ? 1 : 0;

        setUnitTactics(updatedSegments);
    };


    const isCompleteNodeEdit = () => {
        const requiredFields = ['unit_name', 'unit_type', 'unit_health', 'unit_role', 'unit_size', 'unit_posture', 'unit_readiness', 'unit_skill'];
        return requiredFields.every(field => !!nodeValues[field as keyof typeof nodeValues]);
    };


    const isCompleteAddNode = () => {
        const requiredFields = ['unit_name', 'unit_type', 'unit_health', 'unit_role', 'unit_size', 'unit_posture', 'unit_readiness', 'unit_skill'];
        return requiredFields.every(field => !!formValues[field as keyof typeof formValues]);
    };


    return (
        <>
            <Modal opened={isOpen} onClose={onClose} title={unit?.unit_name + " Options"} centered>
                <Container mt={10}>
                    <Grid grow justify="space-around" align="stretch" mb={20} mt={20} >
                        {/* <Card><IconSquarePlus /><Text>Add Child</Text></Card>
                <Card><IconEdit /><Text>Edit Node</Text></Card>

                <Card><IconSquareX /><Text>Delete Node</Text></Card> */}

                        {/* Add Node */}
                        <UnstyledButton onClick={openAddNode} p={10} style={{ borderRadius: 5, backgroundColor: '#3b3b3b' }}>
                            <Center>
                                <IconSquarePlus size="50" strokeWidth="1.5" />
                            </Center>

                            <Text size="lg" m={5}>
                                Add Sub-Unit
                            </Text>
                        </UnstyledButton>

                        {/* Edit Node */}
                        <UnstyledButton onClick={openEditNode} p={10} style={{ borderRadius: 5, backgroundColor: '#3b3b3b' }} >
                            <Center>
                                <IconEdit size="50" strokeWidth="1.5" />
                            </Center>

                            <Text size="lg" m={5}>
                                Edit Unit
                            </Text>
                        </UnstyledButton>

                        {/* Delete Node */}
                        <UnstyledButton
                            onClick={openDeleteConfirm}
                            p={10}
                            style={{ borderRadius: 5, backgroundColor: '#e03131' }}
                        >
                            <Center>
                                <IconSquareX size="50" strokeWidth="1.5" />
                            </Center>
                            <Text size="lg" m={5}>
                                Delete Unit
                            </Text>
                        </UnstyledButton>



                    </Grid>
                </Container>

            </Modal>

            <Modal opened={addNodeOpened} onClose={handleModalClose} title={is_root ? "Add Parent" : "Add Child to " + unit?.unit_name}>
                <form onSubmit={handleAddSubmit}>
                    <Tabs defaultValue="unit">
                        <Tabs.List>
                            <Tabs.Tab value="unit" >
                                Unit selection
                            </Tabs.Tab>
                            <Tabs.Tab value="tactics" >
                                Unit Tactics
                            </Tabs.Tab>

                        </Tabs.List>

                        <Tabs.Panel value="unit">

                            <Select
                                label="Preset Unit"
                                placeholder="Pick one"
                                name="unit"
                                mt="md"
                                searchable
                                value={formValues.unit_name}
                                onChange={(value) => handleSelectChange(value, 'ID')}
                                data={presetUnits
                                    .filter(unit => unit && unit.unit_name)  // Filter out invalid units
                                    .map(unit => ({
                                        value: unit.unit_name,  // Set unit name as `value`
                                        label: unit.unit_name,  // Set unit name as `label`
                                    }))}
                            />

                            {/* Text input that auto-populates from the dropdown */}
                            <TextInput
                                label="Unit Name"
                                mt="md"
                                required
                                value={formValues.updated_unit_name}  // Controlled input tied to updated_unit_name
                                onChange={(e) =>
                                    setFormValues({
                                        ...formValues,
                                        updated_unit_name: e.target.value  // Allow user to modify the name
                                    })
                                }
                                placeholder="Update unit name"
                            />

                            <Select
                                label="Unit Type"
                                placeholder="Enter unit type"
                                required
                                name='unit_type'
                                mt="md"
                                value={formValues.unit_type}
                                onChange={(value) => handleSelectChange(value, 'unit_type')}
                                searchable
                                data={[
                                    { value: 'Command and Control', label: 'Command and Control' },
                                    { value: 'Infantry', label: 'Infantry' },
                                    { value: 'Reconnaissance', label: 'Reconnaissance' },
                                    { value: 'Armored Mechanized', label: 'Armored Mechanized' },
                                    { value: 'Combined Arms', label: 'Combined Arms' },
                                    { value: 'Armored Mechanized Tracked', label: 'Armored Mechanized Tracked' },
                                    { value: 'Field Artillery', label: 'Field Artillery' },
                                    { value: 'Self-propelled', label: 'Self-propelled' },
                                    { value: 'Electronic Warfare', label: 'Electronic Warfare' },
                                    { value: 'Signal', label: 'Signal' },
                                    { value: 'Special Operations Forces', label: 'Special Operations Forces' },
                                    { value: 'Ammunition', label: 'Ammunition' },
                                    { value: 'Air Defense', label: 'Air Defense' },
                                    { value: 'Engineer', label: 'Engineer' },
                                    { value: 'Air Assault', label: 'Air Assault' },
                                    { value: 'Medical Treatment Facility', label: 'Medical Treatment Facility' },
                                    { value: 'Aviation Rotary Wing', label: 'Aviation Rotary Wing' },
                                    { value: 'Combat Support', label: 'Combat Support' },
                                    { value: 'Sustainment', label: 'Sustainment' },
                                    { value: 'Unmanned Aerial Systems', label: 'Unmanned Aerial Systems' },
                                    { value: 'Combat Service Support', label: 'Combat Service Support' },
                                    { value: 'Petroleum, Oil and Lubricants', label: 'Petroleum, Oil and Lubricants' },
                                    { value: 'Sea Port', label: 'Sea Port' },
                                    { value: 'Railhead', label: 'Railhead' }
                                ]}
                            />

                            <TextInput
                                label="Unit Health"
                                placeholder="Enter unit health"
                                required
                                name='unit_health'
                                mt="md"
                                type='number'
                                value={formValues.unit_health}
                                onChange={handleChange}
                            />

                            <Select
                                label="Unit Role"
                                placeholder="Enter unit role"
                                required
                                name='unit_role'
                                mt="md"
                                value={formValues.unit_role}
                                onChange={(value) => handleSelectChange(value, 'unit_role')}
                                searchable
                                data={[
                                    { value: 'Combat', label: 'Combat' },
                                    { value: 'Headquarters', label: 'Headquarters' },
                                    { value: 'Support', label: 'Support' },
                                    { value: 'Supply Materials', label: 'Supply Materials' },
                                    { value: 'Facility', label: 'Facility' }
                                ]}
                            />

                            <Select
                                label="Unit Size"
                                placeholder="Enter unit size"
                                required
                                name='unit_size'
                                mt="md"
                                value={formValues.unit_size}
                                onChange={(value) => handleSelectChange(value, 'unit_size')}
                                searchable
                                data={[
                                    { value: 'Squad/Team', label: 'Squad/Team' },
                                    { value: 'Platoon', label: 'Platoon' },
                                    { value: 'Company/Battery', label: 'Company/Battery' },
                                    { value: 'Battalion', label: 'Battalion' },
                                    { value: 'Brigade/Regiment', label: 'Brigade/Regiment' },
                                    { value: 'Division', label: 'Division' },
                                    { value: 'Corps', label: 'Corps' },
                                    { value: 'UAS (1)', label: 'UAS (1)' },
                                    { value: 'Aviation Section (2)', label: 'Aviation Section (2)' },
                                    { value: 'Aviation Flight (4)', label: 'Aviation Flight (4)' }
                                ]}
                            />

                            <Select
                                label="Force Posture"
                                placeholder="Enter force posture"
                                required
                                name='unit_posture'
                                mt="md"
                                value={formValues.unit_posture}
                                onChange={(value) => handleSelectChange(value, 'unit_posture')}
                                data={[
                                    { value: 'Offensive Only', label: 'Offensive Only' },
                                    { value: 'Defensive Only', label: 'Defensive Only' },
                                    { value: 'Offense and Defense', label: 'Offense and Defense' }
                                ]}
                            />

                            <Select
                                label="Force Mobility"
                                placeholder="Enter force mobility"
                                required
                                name='unit_mobility'
                                mt="md"
                                value={formValues.unit_mobility}
                                onChange={(value) => handleSelectChange(value, 'unit_mobility')}
                                data={[
                                    { value: 'Fixed', label: 'Fixed' },
                                    { value: 'Mobile (foot)', label: 'Mobile (foot)' },
                                    { value: 'Mobile (wheeled)', label: 'Mobile (wheeled)' },
                                    { value: 'Mobile (track)', label: 'Mobile (track)' },
                                    { value: 'Stationary', label: 'Stationary' },
                                    { value: 'Flight (fixed wing)', label: 'Flight (fixed wing)' },
                                    { value: 'Flight (rotary wing)', label: 'Flight (rotary wing)' }
                                ]}
                            />

                            <Select
                                label="Force Readiness"
                                placeholder="Enter force readiness"
                                required
                                name='unit_readiness'
                                mt="md"
                                value={formValues.unit_readiness}
                                onChange={(value) => handleSelectChange(value, 'unit_readiness')}
                                data={[
                                    { value: 'Low', label: 'Low' },
                                    { value: 'Medium', label: 'Medium' },
                                    { value: 'High', label: 'High' },
                                ]}
                            />

                            <Select
                                label="Force Skill"
                                placeholder="Enter force skill"
                                required
                                name='unit_skill'
                                mt="md"
                                value={formValues.unit_skill}
                                onChange={(value) => handleSelectChange(value, 'unit_skill')}
                                data={[
                                    { value: 'Untrained', label: 'Untrained' },
                                    { value: 'Basic', label: 'Basic' },
                                    { value: 'Advanced', label: 'Advanced' },
                                    { value: 'Elite', label: 'Elite' }
                                ]}
                            />

                        </Tabs.Panel>

                        <Tabs.Panel value="tactics">
                            <p>Aware of OPFOR presence?</p>
                            <SegmentedControl
                                size='md'
                                radius='xs'
                                color="gray"
                                data={['Yes', 'No']}
                                value={segmentValues.awareness === 1 ? 'Yes' : 'No'} // Bind value
                                onChange={(value) => handleSegmentChange(value, 'awareness')}
                            />
                            <p>Within logistics support range?</p>
                            <SegmentedControl
                                size='md'
                                radius='xs'
                                color="gray"
                                data={['Yes', 'No']}
                                value={segmentValues.logistics === 1 ? 'Yes' : 'No'} // Bind value
                                onChange={(value) => handleSegmentChange(value, 'logistics')}
                            />
                            <p>Under ISR coverage?</p>
                            <SegmentedControl
                                size='md'
                                radius='xs'
                                color="gray"
                                data={['Yes', 'No']}
                                value={segmentValues.coverage === 1 ? 'Yes' : 'No'} // Bind value
                                onChange={(value) => handleSegmentChange(value, 'coverage')}
                            />
                            <p>Working GPS?</p>
                            <SegmentedControl
                                size='md'
                                radius='xs'
                                color="gray"
                                data={['Yes', 'No']}
                                value={segmentValues.gps === 1 ? 'Yes' : 'No'} // Bind value
                                onChange={(value) => handleSegmentChange(value, 'gps')}
                            />
                            <p>Working communications?</p>
                            <SegmentedControl
                                size='md'
                                radius='xs'
                                color="gray"
                                data={['Yes', 'No']}
                                value={segmentValues.comms === 1 ? 'Yes' : 'No'} // Bind value
                                onChange={(value) => handleSegmentChange(value, 'comms')}
                            />
                            <p>Within fire support range?</p>
                            <SegmentedControl
                                size='md'
                                radius='xs'
                                color="gray"
                                data={['Yes', 'No']}
                                value={segmentValues.fire === 1 ? 'Yes' : 'No'} // Bind value
                                onChange={(value) => handleSegmentChange(value, 'fire')}
                            />
                            <p>Accessible by pattern force?</p>
                            <SegmentedControl
                                size='md'
                                radius='xs'
                                color="gray"
                                data={['Yes', 'No']}
                                value={segmentValues.pattern === 1 ? 'Yes' : 'No'} // Bind value
                                onChange={(value) => handleSegmentChange(value, 'pattern')}
                            />
                        </Tabs.Panel>
                    </Tabs>
                    <Group grow>
                        <Button type="submit" mt="md" disabled={!isCompleteAddNode()}>Submit</Button>
                    </Group>
                </form>

            </Modal>


            <Modal opened={deleteConfirmOpened} onClose={closeDeleteConfirm} title="Confirm Deletion" centered>
                <Box>
                    <Text>This action will delete {unit?.unit_name} and all of its children.</Text>
                    <Group mt="md">
                        <Button color="gray" onClick={closeDeleteConfirm}>
                            Cancel
                        </Button>
                        <Button color="red" onClick={handleDeleteNode}>
                            Delete
                        </Button>
                    </Group>
                </Box>
            </Modal>

            <Modal opened={editNodeOpened} onClose={closeEditNode} title={"Edit " + unit?.unit_name}>
                <form onSubmit={handleEditSubmit}>
                    <Tabs defaultValue="unit">
                        <Tabs.List>
                            <Tabs.Tab value="unit" >
                                Unit selection
                            </Tabs.Tab>
                            <Tabs.Tab value="tactics" >
                                Unit Tactics
                            </Tabs.Tab>

                        </Tabs.List>

                        <Tabs.Panel value="unit">

                            <TextInput
                                label="Unit ID"
                                placeholder="Enter unit name"
                                name="unit"
                                required
                                value={nodeValues.unit_name}
                            // onChange={(value) => handleNodeChange(value, 'ID')}
                            // data={unit?.unit_name}
                            />

                            <Select
                                label="Unit Type"
                                placeholder="Select unit type"
                                required
                                name='unit_type'
                                mt="md"
                                value={nodeValues.unit_type}
                                onChange={(value) => handleNodeChange(value, 'unit_type')}
                                searchable
                                data={[
                                    { value: 'Command and Control', label: 'Command and Control' },
                                    { value: 'Infantry', label: 'Infantry' },
                                    { value: 'Reconnaissance', label: 'Reconnaissance' },
                                    { value: 'Armored Mechanized', label: 'Armored Mechanized' },
                                    { value: 'Combined Arms', label: 'Combined Arms' },
                                    { value: 'Armored Mechanized Tracked', label: 'Armored Mechanized Tracked' },
                                    { value: 'Field Artillery', label: 'Field Artillery' },
                                    { value: 'Self-propelled', label: 'Self-propelled' },
                                    { value: 'Electronic Warfare', label: 'Electronic Warfare' },
                                    { value: 'Signal', label: 'Signal' },
                                    { value: 'Special Operations Forces', label: 'Special Operations Forces' },
                                    { value: 'Ammunition', label: 'Ammunition' },
                                    { value: 'Air Defense', label: 'Air Defense' },
                                    { value: 'Engineer', label: 'Engineer' },
                                    { value: 'Air Assault', label: 'Air Assault' },
                                    { value: 'Medical Treatment Facility', label: 'Medical Treatment Facility' },
                                    { value: 'Aviation Rotary Wing', label: 'Aviation Rotary Wing' },
                                    { value: 'Combat Support', label: 'Combat Support' },
                                    { value: 'Sustainment', label: 'Sustainment' },
                                    { value: 'Unmanned Aerial Systems', label: 'Unmanned Aerial Systems' },
                                    { value: 'Combat Service Support', label: 'Combat Service Support' },
                                    { value: 'Petroleum, Oil and Lubricants', label: 'Petroleum, Oil and Lubricants' },
                                    { value: 'Sea Port', label: 'Sea Port' },
                                    { value: 'Railhead', label: 'Railhead' }
                                ]}
                            />

                            <TextInput
                                label="Unit Health"
                                placeholder="Enter unit health"
                                required
                                name='unit_health'
                                mt="md"
                                type='number'
                                value={nodeValues.unit_health}
                                onChange={(event) =>
                                    setNodeValues((prevValues) => ({
                                        ...prevValues,
                                        unit_health: Number(event.target.value), // Ensure the value is updated as a number
                                    }))
                                }
                            />

                            <Select
                                label="Unit Role"
                                placeholder="Select unit role"
                                required
                                name='unit_role'
                                mt="md"
                                value={nodeValues.unit_role}
                                onChange={(value) => handleNodeChange(value, 'unit_role')}
                                searchable
                                data={[
                                    { value: 'Combat', label: 'Combat' },
                                    { value: 'Headquarters', label: 'Headquarters' },
                                    { value: 'Support', label: 'Support' },
                                    { value: 'Supply Materials', label: 'Supply Materials' },
                                    { value: 'Facility', label: 'Facility' }
                                ]}
                            />

                            <Select
                                label="Unit Size"
                                placeholder="Select unit size"
                                required
                                name='unit_size'
                                mt="md"
                                value={nodeValues.unit_size}
                                onChange={(value) => handleNodeChange(value, 'unit_size')}
                                searchable
                                data={[
                                    { value: 'Squad/Team', label: 'Squad/Team' },
                                    { value: 'Platoon', label: 'Platoon' },
                                    { value: 'Company/Battery', label: 'Company/Battery' },
                                    { value: 'Battalion', label: 'Battalion' },
                                    { value: 'Brigade/Regiment', label: 'Brigade/Regiment' },
                                    { value: 'Division', label: 'Division' },
                                    { value: 'Corps', label: 'Corps' },
                                    { value: 'UAS (1)', label: 'UAS (1)' },
                                    { value: 'Aviation Section (2)', label: 'Aviation Section (2)' },
                                    { value: 'Aviation Flight (4)', label: 'Aviation Flight (4)' }
                                ]}
                            />

                            <Select
                                label="Force Posture"
                                placeholder="Select force posture"
                                required
                                name='unit_posture'
                                mt="md"
                                value={nodeValues.unit_posture}
                                onChange={(value) => handleNodeChange(value, 'unit_posture')}
                                data={[
                                    { value: 'Offensive Only', label: 'Offensive Only' },
                                    { value: 'Defensive Only', label: 'Defensive Only' },
                                    { value: 'Offense and Defense', label: 'Offense and Defense' }
                                ]}
                            />

                            <Select
                                label="Force Mobility"
                                placeholder="Select force mobility"
                                required
                                name='unit_mobility'
                                mt="md"
                                value={nodeValues.unit_mobility}
                                onChange={(value) => handleNodeChange(value, 'unit_mobility')}
                                data={[
                                    { value: 'Fixed', label: 'Fixed' },
                                    { value: 'Mobile (foot)', label: 'Mobile (foot)' },
                                    { value: 'Mobile (wheeled)', label: 'Mobile (wheeled)' },
                                    { value: 'Mobile (track)', label: 'Mobile (track)' },
                                    { value: 'Stationary', label: 'Stationary' },
                                    { value: 'Flight (fixed wing)', label: 'Flight (fixed wing)' },
                                    { value: 'Flight (rotary wing)', label: 'Flight (rotary wing)' }
                                ]}
                            />

                            <Select
                                label="Force Readiness"
                                placeholder="Select force readiness"
                                required
                                name='unit_readiness'
                                mt="md"
                                value={nodeValues.unit_readiness}
                                onChange={(value) => handleNodeChange(value, 'unit_readiness')}
                                data={[
                                    { value: 'Low', label: 'Low' },
                                    { value: 'Medium', label: 'Medium' },
                                    { value: 'High', label: 'High' },
                                ]}
                            />

                            <Select
                                label="Force Skill"
                                placeholder="Select force skill"
                                required
                                name='unit_skill'
                                mt="md"
                                value={nodeValues.unit_skill}
                                onChange={(value) => handleNodeChange(value, 'unit_skill')}
                                data={[
                                    { value: 'Untrained', label: 'Untrained' },
                                    { value: 'Basic', label: 'Basic' },
                                    { value: 'Advanced', label: 'Advanced' },
                                    { value: 'Elite', label: 'Elite' }
                                ]}
                            />

                        </Tabs.Panel>

                        <Tabs.Panel value="tactics">
                            <p>Aware of OPFOR presence?</p>
                            <SegmentedControl
                                size='md'
                                radius='xs'
                                color="gray"
                                data={['Yes', 'No']}
                                value={unitTactics.awareness === 1 ? 'Yes' : 'No'} // Bind value
                                onChange={(value) => handleTacticsChange(value, 'awareness')}
                            />
                            <p>Within logistics support range?</p>
                            <SegmentedControl
                                size='md'
                                radius='xs'
                                color="gray"
                                data={['Yes', 'No']}
                                value={unitTactics.logistics === 1 ? 'Yes' : 'No'} // Bind value
                                onChange={(value) => handleTacticsChange(value, 'logistics')}
                            />
                            <p>Under ISR coverage?</p>
                            <SegmentedControl
                                size='md'
                                radius='xs'
                                color="gray"
                                data={['Yes', 'No']}
                                value={unitTactics.coverage === 1 ? 'Yes' : 'No'} // Bind value
                                onChange={(value) => handleTacticsChange(value, 'coverage')}
                            />
                            <p>Working GPS?</p>
                            <SegmentedControl
                                size='md'
                                radius='xs'
                                color="gray"
                                data={['Yes', 'No']}
                                value={unitTactics.gps === 1 ? 'Yes' : 'No'} // Bind value
                                onChange={(value) => handleTacticsChange(value, 'gps')}
                            />
                            <p>Working communications?</p>
                            <SegmentedControl
                                size='md'
                                radius='xs'
                                color="gray"
                                data={['Yes', 'No']}
                                value={unitTactics.comms === 1 ? 'Yes' : 'No'} // Bind value
                                onChange={(value) => handleTacticsChange(value, 'comms')}
                            />
                            <p>Within fire support range?</p>
                            <SegmentedControl
                                size='md'
                                radius='xs'
                                color="gray"
                                data={['Yes', 'No']}
                                value={unitTactics.fire === 1 ? 'Yes' : 'No'} // Bind value
                                onChange={(value) => handleTacticsChange(value, 'fire')}
                            />
                            <p>Accessible by pattern force?</p>
                            <SegmentedControl
                                size='md'
                                radius='xs'
                                color="gray"
                                data={['Yes', 'No']}
                                value={unitTactics.pattern === 1 ? 'Yes' : 'No'} // Bind value
                                onChange={(value) => handleTacticsChange(value, 'pattern')}
                            />
                        </Tabs.Panel>
                    </Tabs>
                    <Group grow>
                        <Button type="submit" mt="md" disabled={!isCompleteNodeEdit()}>Submit</Button>
                    </Group>
                </form>
            </Modal>

        </>

    );
}
