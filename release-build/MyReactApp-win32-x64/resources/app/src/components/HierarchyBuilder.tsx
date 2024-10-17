import React, { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import Tree from 'react-d3-tree';
import { RawNodeDatum, CustomNodeElementProps } from 'react-d3-tree';
import { Unit } from './Cards';
import { SegmentedControl, Modal, Tabs, Select, TextInput, Button, Text, HoverCard, Group } from '@mantine/core';
import axios from 'axios';
import { useUserRole } from '../context/UserContext';
import getImageSRC from '../context/imageSrc';

type UnitAttributes = {
  id: number;
  unit_type: string;
  is_friendly: boolean;
  unit_health: number;
  role_type: string;
  unit_size: string;
  force_posture: string;
  force_mobility: string;
  force_readiness: string;
  force_skill: string;
};

type HierarchyProps = {
  is_friendly: boolean;
  hierarchyRefresh: Number;
  xCoord: Number;
  yCoord: Number;
};

const buildHierarchy = (units: Unit[]): RawNodeDatum[] | null => {

  const unitMap = new Map<string, RawNodeDatum>();

  // First pass: Add all units to a map
  units.forEach(unit => {
    unitMap.set(unit.unit_id, {
      name: unit.unit_id,
      attributes: {
        unit_type: unit.unit_type,
        is_friendly: unit.isFriendly,
        unit_health: unit.unit_health,
        role_type: unit.role_type,
        unit_size: unit.unit_size,
        force_posture: unit.force_posture,
        force_mobility: unit.force_mobility,
        force_readiness: unit.force_readiness,
        force_skill: unit.force_skill,
        id: unit.id
      },
      children: []
    });
  });

  // Second pass: Link children to their parents
  units.forEach(unit => {
    if (unit.children.length > 0) {
      unit.children.forEach(childID => {
        const parent = unitMap.get(unit.unit_id);
        const child = unitMap.get(childID);
        if (parent && child) {
          parent.children!.push(child);
        } else {
          console.error(`Parent or child not found: ParentID = ${unit.unit_id}, ChildID = ${childID}`);
        }
      });
    }
  });

  // Return the roots (units without a parent)
  const rootNodes = units.filter(unit => unit.root); // Filter units with root attribute true
  if (rootNodes.length === 0) {
    return null; // If no root nodes, return null
  }

  // Sort root nodes to appear at the top
  rootNodes.sort((a, b) => (a.root && !b.root ? -1 : 0));

  return rootNodes.map(unit => unitMap.get(unit.unit_id)!);
};

const CustomNode = ({ nodeDatum, toggleModal }: CustomNodeElementProps & { toggleModal: () => void }) => {
  const cardWidth = 140;
  const cardHeight = 110;
  const imageSize = 100;

  const {
    unit_type,
    is_friendly,
    unit_health,
    role_type,
    unit_size,
    force_posture,
    force_mobility,
    force_readiness,
    force_skill,
  } = nodeDatum.attributes as UnitAttributes;


  return (
    <HoverCard width={280} shadow="md" openDelay={750}>
      <HoverCard.Target>
        <g onClick={toggleModal}>

          <rect
            width={cardWidth}
            height={cardHeight}
            x={-cardWidth / 2}
            y={-cardHeight / 2}
            fill="#2E2E2F"
            rx={0}
            ry={0}
            style={{
              filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.5))',
              zIndex: -1,  // Ensures this element is on top
            }}
            stroke="none"
          />
          <image
            href={getImageSRC(unit_type,is_friendly)}
            x={is_friendly ? -imageSize / 2 + 7.5: -imageSize / 2.75 + 7.5}
            y={is_friendly ? -cardHeight / 2 + 10 : -cardHeight / 2 + 5 }
            width={is_friendly ? 100 : 75}
          />
          <text fill="white" x={((Number(nodeDatum.name.length) / 2)*-9.5)+7.5} y={cardHeight / 2 - 10} width={40} textAnchor="start" stroke="none">
            {nodeDatum.name}
          </text>

          <rect
    width={15}  // Width of the black rectangle
    height={cardHeight}  // Height of the card
    x={-cardWidth / 2}  // Positioning the rectangle to the left of the card
    y={-cardHeight / 2}  // Aligning the rectangle with the card height
    fill={unit_health >= 75 ? '#6aa84f' : (unit_health >= 50 ? '#f1c232' : (unit_health >= 25 ? '#e69138' : '#cc0000'))}
    rx={0}  // Optional: Rounded corner x-radius
    ry={0}  // Optional: Rounded corner y-radius
    style={{
      filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.5))',  // Drop shadow effect
      zIndex: 50,  // Ensures this element is on top
    }}
    stroke="none"  // No stroke
  />
  {/* if (unit_health >= 75) {
    healthColor = '#6aa84f';
  } else if (unit_health < 75 && unit_health >= 50) {
    healthColor = '#f1c232';
  } else if (unit_health < 50 && unit_health >= 25) {
    healthColor = '#e69138';
  } else {
    healthColor = '#cc0000';
  } */}

<rect
    width={15}  // Width of the red rectangle
    height={cardHeight - (unit_health/100 * cardHeight)}  // Height of the card
    x={-cardWidth / 2}  // Positioning the rectangle next to the black one
    y={-cardHeight / 2}  // Aligning the rectangle with the card height
    fill="black"  // Color of the rectangle
    rx={0}  // Optional: Rounded corner x-radius
    ry={0}  // Optional: Rounded corner y-radius
    style={{
      filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.5))',  // Drop shadow effect
      zIndex: 2,  // Ensures this element is on top of the black rectangle
    }}
    stroke="none"  // No stroke
  />
        </g>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text size="sm">
          <strong>Unit ID:</strong> {nodeDatum.name}<br />
          <strong>Type:</strong> {unit_type}<br />
          <strong>Friendly:</strong> {is_friendly ? 'Yes' : 'No'}<br />
          <strong>Health:</strong> {unit_health}<br />
          <strong>Role Type:</strong> {role_type}<br />
          <strong>Unit Size:</strong> {unit_size}<br />
          <strong>Force Posture:</strong> {force_posture}<br />
          <strong>Force Mobility:</strong> {force_mobility}<br />
          <strong>Force Readiness:</strong> {force_readiness}<br />
          <strong>Force Skill:</strong> {force_skill}<br />
        </Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
};



function Hierarchy({ is_friendly, hierarchyRefresh, xCoord, yCoord }: HierarchyProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [tree, setTree] = useState<RawNodeDatum[] | null>();
  const { userRole, userSection } = useUserRole()
  const [formValues, setFormValues] = useState({
    ID: 0,
    unitType: '',
    unitHealth: 100,
    unitRole: '',
    unitSize: '',
    forcePosture: '',
    forceReadiness: '',
    forceSkill: '',
    root: false
  });
  const [selectedNode, setSelectedNode] = useState<number>();
  const [isRoot, setIsRoot] = useState(false);
  const [segmentValues, setSegmentValues] = useState({
    awareness: 1,
    logistics: 1,
    coverage: 1,
    gps: 1,
    comms: 1,
    fire: 1,
    pattern: 1
  });

  useEffect(() => {
    console.log('reset');
    setTree(null); // Reset tree state to null when is_friendly changes
  }, [is_friendly, hierarchyRefresh]);

  const fetchData = async () => {
    try {
      console.log('Fetching data for section:', userSection);

      const response = await axios.get<Unit[]>(`http://localhost:5000/api/units/sectionNullandAllianceSort`, {
        params: {
          sectionid: userSection,
          isFriendly: is_friendly
        }
      });
      const normalizedData = response.data.map(unit => ({
        ...unit,
        children: unit.children || [] // Ensure children is an array
      }));
      setUnits(normalizedData);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  useEffect(() => {
    fetchData();
  }, [userSection, is_friendly]);

  useEffect(() => {
    // Convert the data to the RawNodeDatum format
    if (units.length <= 0) {
      console.log("waiting");
    }
    else {
      const formattedData = buildHierarchy(units);
      setTree(formattedData);
    }
  }, [units]);


  const handleNodeClick = (nodeData: RawNodeDatum) => {
    const attributes = nodeData.attributes as any;
    setSelectedNode(attributes.id);

    if (userRole === "Administrator") {
      open();
    }

  };

  const handleParentClick = () => {
    setIsRoot(true);
    open();
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const requiredFields = ['ID', 'unitType', 'unitHealth', 'unitRole', 'unitSize', 'forcePosture', 'forceReadiness', 'forceSkill'];

    for (const field of requiredFields) {
      if (!formValues[field as keyof typeof formValues]) {
        alert(`The field "${field}" is required.`);
        return; // Stop submission
      }
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/units/update`, {
        parent_id: selectedNode,
        unit_id: Number(formValues.ID),
        unit_type: formValues.unitType,
        unit_health: formValues.unitHealth,
        role_type: formValues.unitRole,
        unit_size: formValues.unitSize,
        force_posture: formValues.forcePosture,
        force_readiness: formValues.forceReadiness,
        force_skill: formValues.forceSkill,
        section_id: userSection,
        root: isRoot,
      });

      if (response.status === 200 || response.status === 201) {
        // Successfully updated the unit, update the state to reflect the changes
        setUnits(prevUnits => prevUnits.map(unit => unit.id === Number(formValues.ID) ? response.data : unit));
        fetchData();
      } else {
        console.error('Failed to update unit:', response);
      }
    } catch (error) {
      console.error('Error updating unit:', error);
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/unitTactics/update`, {
        awareness: segmentValues.awareness,
        logistics: segmentValues.logistics,
        coverage: segmentValues.coverage,
        gps: segmentValues.gps,
        comms: segmentValues.comms,
        fire: segmentValues.fire,
        pattern: segmentValues.pattern,
        ID: Number(formValues.ID)
      });

    } catch (error) {
      console.error('Error updating unit:', error);
    }

    // Close the modal
    close();
    setIsRoot(false);
    setFormValues({
      ID: 0,
      unitType: '',
      unitHealth: 100,
      unitRole: '',
      unitSize: '',
      forcePosture: '',
      forceReadiness: '',
      forceSkill: '',
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
    console.log(formValues);
  };

  const handleSegmentChange = (value: string, segmentName: keyof typeof segmentValues) => {
    const updatedSegments = { ...segmentValues };

    // Map 'Yes' to 1 and 'No' to 0
    updatedSegments[segmentName] = value === 'Yes' ? 1 : 0;

    setSegmentValues(updatedSegments);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.currentTarget;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string | null, name: string) => {
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: value ?? ''
    }));

  };
  const filteredUnits = units.filter(unit => {
    const isChild = units.some(parent => parent.children.includes(unit.unit_id));
    return !unit.root && !isChild;
  });



  return (
    <div style={{ width: '100%', height: '100vh' }}>

      {tree ? (
        <>
          {(userRole === "Administrator" ? <h1>Select a unit to add a child to it</h1> : <></>)}
          <Tree
            data={tree}
            orientation='vertical'
            nodeSize={{ x: 160, y: 150 }}
            translate={{ x: Number(xCoord), y: Number(yCoord) }}
            collapsible={false}
            pathFunc={'step'}
            zoom={1.2}
            scaleExtent={{ min: 0.5, max: 3 }}
            renderCustomNodeElement={(rd3tProps) => <CustomNode {...rd3tProps} toggleModal={() => handleNodeClick(rd3tProps.nodeDatum)} />}
            onNodeClick={() => handleNodeClick}
          />
        </>
        ) : (
        (userRole === "Administrator" ? <Button onClick={() => handleParentClick()} size='xl' mt='lg' left={6}>Add Parent</Button> : <></>)
      )

      }

      <Modal opened={opened} onClose={close} title="Add Unit">
        <form onSubmit={handleSubmit}>
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
                label="Unit ID"
                placeholder="Pick one"
                name='unit'
                required
                searchable
                value={formValues.ID.toString()}
                onChange={(value) => handleSelectChange(value, 'ID')}
                data={filteredUnits.map(unit => ({
                  value: unit.id.toString(),
                  label: unit.unit_id,
                }))}
              />

              <Select
                label="Unit Type"
                placeholder="Enter unit type"
                required
                name='unitType'
                mt="md"
                value={formValues.unitType}
                onChange={(value) => handleSelectChange(value, 'unitType')}
                searchable
                data={[
                  'Command and Control',
                  'Infantry',
                  'Reconnaissance',
                  'Armored Mechanized',
                  'Combined Arms',
                  'Armored Mechanized Tracked',
                  'Field Artillery',
                  'Self-propelled',
                  'Electronic Warfare',
                  'Signal',
                  'Special Operations Forces',
                  'Ammunition',
                  'Air Defense',
                  'Engineer',
                  'Air Assault',
                  'Medical Treatment Facility',
                  'Aviation Rotary Wing',
                  'Combat Support',
                  'Sustainment',
                  'Unmanned Aerial Systems',
                  'Combat Service Support',
                  'Petroleum, Oil and Lubricants',
                  'Sea Port',
                  'Railhead'
                ]}
              />

              <TextInput
                label="Unit Health"
                placeholder="Enter unit health"
                required
                name='unitHealth'
                mt="md"
                type='number'
                value={formValues.unitHealth}
                onChange={handleChange}
              />

              <Select
                label="Unit Role"
                placeholder="Enter unit role"
                required
                name='unitRole'
                mt="md"
                value={formValues.unitRole}
                onChange={(value) => handleSelectChange(value, 'unitRole')}
                searchable
                data={[
                  'Combat',
                  'Headquarters',
                  'Support',
                  'Supply Materials',
                  'Facility'
                ]}
              />

              <Select
                label="Unit size"
                placeholder="Enter unit size"
                required
                name='unitSize'
                mt="md"
                value={formValues.unitSize}
                onChange={(value) => handleSelectChange(value, 'unitSize')}
                searchable
                data={[
                  'Squad/Team',
                  'Platoon',
                  'Company/Battery',
                  'Battalion',
                  'Brigade/Regiment',
                  'Division',
                  'Corps',
                  'UAS (1)',
                  'Aviation Section (2)',
                  'Aviation Flight (4)'
                ]}
              />

              <Select
                label="Force Posture"
                placeholder="Enter force posture"
                required
                name='forcePosture'
                mt="md"
                value={formValues.forcePosture}
                onChange={(value) => handleSelectChange(value, 'forcePosture')}
                data={[
                  'Offensive Only',
                  'Defensive Only',
                  'Offense and Defense'
                ]}
              />

              <Select
                label="Force Readiness"
                placeholder="Enter force readiness"
                required
                name='forceReadiness'
                mt="md"
                value={formValues.forceReadiness}
                onChange={(value) => handleSelectChange(value, 'forceReadiness')}
                data={[
                  'Low',
                  'Medium',
                  'High'
                ]}
              />

              <Select
                label="Force Skill"
                placeholder="Enter force skill"
                required
                name='forceSkill'
                mt="md"
                value={formValues.forceSkill}
                onChange={(value) => handleSelectChange(value, 'forceSkill')}
                data={[
                  'Untrained',
                  'Basic',
                  'Advanced',
                  'Elite'
                ]}
              />



            </Tabs.Panel>

            <Tabs.Panel value="tactics">

              <p>Aware of OPFOR presence?</p>
              <SegmentedControl size='md' radius='xs' color="gray" data={['Yes', 'No']} onChange={(value) => handleSegmentChange(value, 'awareness')} />
              <p>Within logistics support range?</p>
              <SegmentedControl size='md' radius='xs' color="gray" data={['Yes', 'No']} onChange={(value) => handleSegmentChange(value, 'logistics')} />
              <p>Under ISR coverage?</p>
              <SegmentedControl size='md' radius='xs' color="gray" data={['Yes', 'No']} onChange={(value) => handleSegmentChange(value, 'coverage')} />
              <p>Working GPS?</p>
              <SegmentedControl size='md' radius='xs' color="gray" data={['Yes', 'No']} onChange={(value) => handleSegmentChange(value, 'gps')} />
              <p>Working communications?</p>
              <SegmentedControl size='md' radius='xs' color="gray" data={['Yes', 'No']} onChange={(value) => handleSegmentChange(value, 'comms')} />
              <p>Within fire support range?</p>
              <SegmentedControl size='md' radius='xs' color="gray" data={['Yes', 'No']} onChange={(value) => handleSegmentChange(value, 'fire')} />
              <p>Accessible by pattern force?</p>
              <SegmentedControl size='md' radius='xs' color="gray" data={['Yes', 'No']} onChange={(value) => handleSegmentChange(value, 'pattern')} />


            </Tabs.Panel>
          </Tabs>
          <Group grow>
            <Button type="submit" mt="md">Submit</Button>

          </Group>
        </form>

      </Modal>
    </div>
  );
}

export default Hierarchy;