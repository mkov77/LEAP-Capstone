import React, { useState } from 'react';
import { Modal, Button, TextInput, Select, Box, Loader, Text, Tabs, SegmentedControl, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import axios from 'axios';

interface UnitCreationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UnitCreationModule({ isOpen, onClose }: UnitCreationProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  // State to hold form values
  const form = useForm({
    initialValues: {
      unitName: '',
      unitType: '',
      unitRole: '',
      unitSize: '',
      unitPosture: '',
      unitMobility: '',
      unitReadiness: '',
      unitSkill: '',
      is_friendly: true,
    },
    validate: {
      unitName: (value) => (value ? null : 'Unit name is required'),
      unitType: (value) => (value ? null : 'Unit type is required'),
      unitRole: (value) => (value ? null : 'Unit role is required'),
      unitSize: (value) => (value ? null : 'Unit size is required'),
      unitPosture: (value) => (value ? null : 'Unit posture is required'),
      unitMobility: (value) => (value ? null : 'Unit mobility is required'),
      unitReadiness: (value) => (value ? null : 'Unit readiness is required'),
      unitSkill: (value) => (value ? null : 'Unit skill is required'),
      is_friendly: (value) => (value ? null : 'Unit status is required'),
    },
  });

  const [segmentValues, setSegmentValues] = useState({
    awareness: 1,
    logistics: 1,
    coverage: 1,
    gps: 1,
    comms: 1,
    fire: 1,
    pattern: 1
  });

  const handleSegmentChange = (value: string, segmentName: keyof typeof segmentValues) => {
    const updatedSegments = { ...segmentValues };

    // Map 'Yes' to 1 and 'No' to 0
    updatedSegments[segmentName] = value === 'Yes' ? 1 : 0;

    setSegmentValues(updatedSegments);
  };

  // Handle form submission
  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    setSubmitError(null);

    console.log(values.unitMobility)

    try {
      const response = await axios.post('http://localhost:5000/api/newpresetunit', {
        unit_name: values.unitName,
        unit_type: values.unitType,
        unit_role: values.unitRole,
        unit_size: values.unitSize,
        unit_posture: values.unitPosture,
        unit_mobility: values.unitMobility,
        unit_readiness: values.unitReadiness,
        unit_skill: values.unitSkill,
        is_friendly: values.is_friendly,
      });

      console.log('Form submitted with values:', response.data);

      // Second API call: Submit tactics data
      const tacticsResponse = await axios.post('http://localhost:5000/api/newpresetunit/tactics', {
        unit_name: values.unitName, // You may want to use the unit ID from unitResponse if available
        awareness: segmentValues.awareness,
        logistics: segmentValues.logistics,
        coverage: segmentValues.coverage,
        gps: segmentValues.gps,
        comms: segmentValues.comms,
        fire: segmentValues.fire,
        pattern: segmentValues.pattern,
      });

      console.log('Tactics submitted:', tacticsResponse.data);


      setSubmitSuccess(true);
      form.reset(); // Reset the form after successful submission
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('An error occurred while submitting the form.');
    } finally {
      setIsLoading(false);
      onClose(); // Close the modal after submission
    }
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Unit Creator">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        {isLoading && <Loader size={24} />}
        {submitError && <Text color="red">{submitError}</Text>}
        {submitSuccess && <Text color="green">Unit created successfully!</Text>}

        <Tabs defaultValue="unit">
          <Tabs.List>
            <Tabs.Tab value="unit">Unit selection</Tabs.Tab>
            <Tabs.Tab value="tactics">Unit Tactics</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="unit">
            {/* Unit Name */}
            <TextInput
              label="Unit Name"
              placeholder="Enter unit name"
              error={form.errors.unitName}
              {...form.getInputProps('unitName')}
            />

            {/* Unit Type */}
            <Select
              label="Unit Type"
              placeholder="Select unit type"
              error={form.errors.unitType}
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
              {...form.getInputProps('unitType')}
            />

            {/* Other Unit Fields */}
            <Select
              label="Unit Role"
              placeholder="Enter unit role"
              {...form.getInputProps('unitRole')}
              data={[
                'Combat',
                'Headquarters',
                'Support',
                'Supply Materials',
                'Facility',
              ]}
            />

            <Select
              label="Unit Size"
              placeholder="Enter unit size"
              {...form.getInputProps('unitSize')}
              data={[
                'Squad/Team',
                'Platoon',
                'Company/Battery',
                'Battalion',
                'Brigade/Regiment',
              ]}
            />

            <Select
              label="Force Posture"
              placeholder="Enter force posture"
              {...form.getInputProps('unitPosture')}
              data={['Offensive Only', 'Defensive Only', 'Offense and Defense']}
            />

            <Select
              label="Force Mobility"
              placeholder="Enter force mobility"
              {...form.getInputProps('unitMobility')}
              data={['Fixed',
                'Mobile (foot)',
                'Mobile (wheeled)',
                'Mobile (track)',
                'Stationary',
                'Flight (fixed wing)',
                'Flight (rotary wing)']}
            />

            <Select
              label="Force Readiness"
              placeholder="Enter force readiness"
              {...form.getInputProps('unitReadiness')}
              data={['Low', 'Medium', 'High']}
            />

            <Select
              label="Force Skill"
              placeholder="Enter force skill"
              {...form.getInputProps('unitSkill')}
              data={['Untrained', 'Basic', 'Advanced', 'Elite']}
            />

            <Select
              label="Unit Status"
              placeholder="Select unit status"
              error={form.errors.is_friendly}
              data={[
                { value: 'true', label: 'Friendly' },
                { value: 'false', label: 'Enemy' },
              ]}
              {...form.getInputProps('is_friendly')}
            />
          </Tabs.Panel>

          <Tabs.Panel value="tactics">
            <p>Aware of OPFOR presence?</p>
            <SegmentedControl size='md' radius='xs' color="gray" data={['Yes', 'No']}
              onChange={(value) => handleSegmentChange(value, 'awareness')}
            />
            <p>Within logistics support range?</p>
            <SegmentedControl size='md' radius='xs' color="gray" data={['Yes', 'No']}
              onChange={(value) => handleSegmentChange(value, 'logistics')}
            />
            <p>Under ISR coverage?</p>
            <SegmentedControl size='md' radius='xs' color="gray" data={['Yes', 'No']}
              onChange={(value) => handleSegmentChange(value, 'coverage')}
            />
            <p>Working GPS?</p>
            <SegmentedControl size='md' radius='xs' color="gray" data={['Yes', 'No']}
              onChange={(value) => handleSegmentChange(value, 'gps')}
            />
            <p>Working communications?</p>
            <SegmentedControl size='md' radius='xs' color="gray" data={['Yes', 'No']}
              onChange={(value) => handleSegmentChange(value, 'comms')}
            />
            <p>Within fire support range?</p>
            <SegmentedControl size='md' radius='xs' color="gray" data={['Yes', 'No']}
              onChange={(value) => handleSegmentChange(value, 'fire')}
            />
            <p>Accessible by pattern force?</p>
            <SegmentedControl size='md' radius='xs' color="gray" data={['Yes', 'No']}
              onChange={(value) => handleSegmentChange(value, 'pattern')}
            />
          </Tabs.Panel>
        </Tabs>

        <Group grow>
          <Button type="submit" mt="md">
            Submit
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
