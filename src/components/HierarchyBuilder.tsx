import React, { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import Tree from 'react-d3-tree';
import { RawNodeDatum, CustomNodeElementProps } from 'react-d3-tree';
import pathProps from 'react-d3-tree'
import { Unit } from './Cards';
import { SegmentedControl, Modal, Tabs, Select, TextInput, Button, Text, HoverCard, Group } from '@mantine/core';
import axios from 'axios';
import { useUserRole } from '../context/UserContext';
import getImageSRC from '../context/imageSrc';
import NodeEditModal from './NodeEditModal';

type UnitAttributes = {
  id: number;
  unit_type: string;
  is_friendly: boolean;
  unit_health: number;
  unit_role: string;
  unit_size: string;
  unit_posture: string;
  unit_mobility: string;
  unit_readiness: string;
  unit_skill: string;
};

type HierarchyProps = {
  is_friendly: boolean;
  hierarchyRefresh: Number;
  xCoord: Number;
  yCoord: Number;
};

const buildHierarchy = (units: Unit[], childrenData: { parent_id: number; child_id: number }[]): RawNodeDatum[] | null => {
  const unitMap = new Map<number, RawNodeDatum>();

  console.log("FIRST PASS");
  // First pass: Add all units to the map
  units.forEach(unit => {
    unitMap.set(unit.unit_id, {
      name: unit.unit_name,
      attributes: {
        unit_type: unit.unit_type,
        is_friendly: unit.is_friendly,
        unit_health: unit.unit_health,
        unit_role: unit.unit_role,
        unit_size: unit.unit_size,
        unit_posture: unit.unit_posture,
        unit_mobility: unit.unit_mobility,
        unit_readiness: unit.unit_readiness,
        unit_skill: unit.unit_skill,
        id: unit.unit_id,
      },
      children: []
    });
  });

  console.log("SECOND PASS");
  units.forEach(unit => {
    const parent = unitMap.get(unit.unit_id); // Get parent unit from map
    if (unit.children && unit.children.length > 0) {
      // Map child unit_id to their actual objects
      unit.children.forEach(childId => {
        const child = unitMap.get(childId);
        if (parent && child) {
          parent.children!.push(child); // Link the child object
        } else {
          console.error(`Parent or child not found: ParentID = ${unit.unit_id}, ChildID = ${childId}`);
        }
      });
    }
  });

  // Return the roots (units without a parent)
  console.log("CHECKING FOR ROOTS");
  const rootNodes = units.filter(unit => unit.is_root); // Filter units with root attribute true
  if (rootNodes.length === 0) {
    console.log("CHECKING IF ROOT");
    return null; // If no root nodes, return null
  }

  return rootNodes.map(unit => unitMap.get(unit.unit_id)!);
};

const CustomNode = ({ nodeDatum, toggleModal }: CustomNodeElementProps & { toggleModal: () => void }) => {
  const cardWidth = 140;
  const cardHeight = 110;
  const imageSize = 100;

  const {
    unit_type,
    is_friendly,  // This now comes from nodeDatum.attributes, which represents the specific unit's data
    unit_health,
    unit_role,
    unit_size,
    unit_posture,
    unit_mobility,
    unit_readiness,
    unit_skill,
  } = nodeDatum.attributes as UnitAttributes;

  const isFriendlyBoolean = typeof is_friendly === 'boolean' ? is_friendly : is_friendly === 'true';

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
            href={getImageSRC(unit_type, isFriendlyBoolean)}
            x={isFriendlyBoolean ? -imageSize / 2 + 7.5 : -imageSize / 2.75 + 7.5}
            y={isFriendlyBoolean ? -cardHeight / 2 + 10 : -cardHeight / 2 + 5}
            width={isFriendlyBoolean ? 100 : 75}
          />
          <text fill="white" x={(-cardWidth / 2 + 15 + cardWidth / 2) / 2} y={cardHeight / 2 - 10} width={40} textAnchor="middle" stroke="none">
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

          <rect
            width={15}  // Width of the red rectangle
            height={cardHeight - (unit_health / 100 * cardHeight)}  // Height of the card
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
          <strong>Role Type:</strong> {unit_role}<br />
          <strong>Unit Size:</strong> {unit_size}<br />
          <strong>Force Posture:</strong> {unit_posture}<br />
          <strong>Force Mobility:</strong> {unit_mobility}<br />
          <strong>Force Readiness:</strong> {unit_readiness}<br />
          <strong>Force Skill:</strong> {unit_skill}<br />
        </Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
};

function Hierarchy({ is_friendly, hierarchyRefresh, xCoord, yCoord }: HierarchyProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  console.log("CHECKING UNITS ", units)
  const [presetUnits, setPresetUnits] = useState<Unit[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [tree, setTree] = useState<RawNodeDatum[] | null>();
  const { userRole, userSection } = useUserRole()
  const [selectedNode, setSelectedNode] = useState<number>();
  const [isRoot, setIsRoot] = useState(false);
  const [childrenData, setChildrenData] = useState<Array<{ parent_id: number; child_id: number }>>([]);

  useEffect(() => {
    console.log('reset');
    setTree(null); // Reset tree state to null when is_friendly changes
  }, [is_friendly, hierarchyRefresh]);

  const fetchData = async () => {
    try {
      console.log('Fetching section units for section:', userSection);
  
      const [unitResponse, childrenResponse] = await Promise.all([
        axios.get<Unit[]>(`${process.env.REACT_APP_BACKEND_URL}/api/units/sectionNullandAllianceSort`, { 
          params: { sectionid: userSection, isFriendly: is_friendly } 
        }),
        axios.get<{ parent_id: number; child_id: number }[]>(`${process.env.REACT_APP_BACKEND_URL}/api/units/children`)
      ]);
  
      const normalizedUnits = unitResponse.data.map(unit => ({
        ...unit,
        children: [] // Start with empty children array
      }));
  
      setUnits(normalizedUnits); // Store the units
  
      // Now fetch children for each unit based on unit_id (parent_id)
      const allChildrenPromises = normalizedUnits.map(unit => 
        axios.get<{ parent_id: number; child_id: number }[]>(`${process.env.REACT_APP_BACKEND_URL}/api/units/children`, {
          params: { parent_id: unit.unit_id }
        })
      );
  
      const childrenResponses = await Promise.all(allChildrenPromises);
  
      // Process the children data by storing child unit_ids in the children field
      const updatedUnits = normalizedUnits.map(unit => {
        const unitChildren = childrenResponses
          .find(response => response.data.some(relation => relation.parent_id === unit.unit_id))?.data || [];
        
        return {
          ...unit,
          children: unitChildren.map(relation => relation.child_id) // Store only the child IDs (numbers)
        };
      });
  
      setUnits(updatedUnits); // Update state with units and their children (unit_ids only)
      console.log("Updated Units with Children:", updatedUnits);
  
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };  
  

  const fetchPresetUnits = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/preset_units`);

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

  const refreshHierarchy = async () => {
    await fetchData(); // Fetch new data for the units and children
    const formattedData = buildHierarchy(units, childrenData); // Rebuild hierarchy
    setTree(formattedData); // Update tree state with new data
  };
  

  const handleCloseEditor = () => {
    close();
    refreshHierarchy();
  }

  useEffect(() => {
    fetchData();
    fetchPresetUnits();
  }, [userSection, is_friendly]);

  useEffect(() => {
    console.log("units: ", units.length, " and children: ", childrenData.length)
    console.log("HERE HERE HERE HERE HERE HERE HERE");
    if (units.length > 0) {
      console.log("Calling build hiearchy");
      const formattedData = buildHierarchy(units, childrenData);
      setTree(formattedData);
      console.log("this is THE tree: ", tree);
    }
  }, [units, childrenData]);

  const handleNodeClick = (nodeData: RawNodeDatum) => {
    console.log("Node Data:", nodeData); // Log the entire nodeData object
    const attributes = nodeData.attributes as any;

    if (attributes && attributes.id) {
      setSelectedNode(attributes.id);
    } else {
      console.error("Node attributes or ID not found.");
    }

    if (userRole === "Administrator") {
      open();
    }
  };

  const handleParentClick = () => {
    setIsRoot(true);
    open();
  }

  return (
    <div style={{ width: '100%', height: '100vh' }}>

      {tree ? (
        <>
          {(userRole === "Administrator" ? <h1>Select a unit to edit it</h1> : <></>)}
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
        (userRole === "Administrator" ? <Button onClick={() => handleParentClick()} size='xl' mt='lg' left={6}>Build Force</Button> : <></>)
      )

      }
      
      <NodeEditModal isOpen={opened} onClose={handleCloseEditor} nodeID={Number(selectedNode)} is_friendly={is_friendly} userSection={userSection} is_root={isRoot}/>
    </div>
  );
}

export default Hierarchy;