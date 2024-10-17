import React from 'react';
import { Modal, Button, TextInput, Select, Box, Loader, Text } from '@mantine/core';
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

  const form = useForm({
    initialValues: {
      unitName: '',
      unitType: '',
    },
    validate: {
      unitName: (value) => (value ? null : 'Unit name is required'),
      unitType: (value) => (value ? null : 'Unit type is required'),
    },
  });

  const handleSubmit = async (values: { unitName: string; unitType: string }) => {
    setIsLoading(true);
    setSubmitError(null);
  
    try {
      const response = await axios.post('http://localhost:5000/api/newunit', {
        unit_id: values.unitName,
        is_friendly: values.unitType === 'friendly',
      });
  
      console.log('Form submitted with values:', response.data);
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
    <Modal opened={isOpen} onClose={onClose} title="Create a new unit">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Unit Name"
          placeholder="Enter unit name"
          error={form.errors.unitName}
          {...form.getInputProps('unitName')}
        />
        {form.errors.unitName && <Text color="red">{form.errors.unitName}</Text>}

        <Select
          label="Unit Status"
          placeholder="Select unit status"
          error={form.errors.unitType}
          data={[
            { value: 'friendly', label: 'Friendly' },
            { value: 'enemy', label: 'Enemy' },
          ]}
          {...form.getInputProps('unitType')}
        />
        {form.errors.unitType && <Text color="red">{form.errors.unitType}</Text>}

        {isLoading ? (
          <Loader size={24} />
        ) : (
          <>
            {submitError && <Text color="red">{submitError}</Text>}
            {submitSuccess && <Text color="green">Unit created successfully!</Text>}
            <Button type="submit" mt="md">
              Submit
            </Button>
          </>
        )}
      </form>
    </Modal>
  );
}