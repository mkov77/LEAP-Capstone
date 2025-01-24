import React, { useEffect, useState } from 'react';
import { Modal, Button, Select, Loader, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import axios from 'axios';

interface UnitDeleteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Unit {
  unit_name: string;
}

export default function UnitDeleteModule({ isOpen, onClose }: UnitDeleteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);

  const form = useForm({
    initialValues: {
      unit_name: '', // Store the unit_name instead of id
    },
    validate: {
      unit_name: (value) => (value ? null : 'Unit selection is required'),
    },
  });

  useEffect(() => {
    if (isOpen) {
      const fetchUnits = async () => {
        try {
          setIsLoading(true);
          const response = await axios.get<Unit[]>(`${process.env.REACT_APP_BACKEND_URL}/api/presetunits`);
          console.log('API Response:', response.data);
          setUnits(response.data);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching units:', error);
          setIsLoading(false);
        }
      };
      fetchUnits();
    }
  }, [isOpen]);

  const handleSubmit = async (values: { unit_name: string }) => {
    console.log('Trying to delete unit with name:', values.unit_name);

    try {
      setIsLoading(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      // Send delete request with the unit_name
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/units/${values.unit_name}`);

      setSubmitSuccess(true);
      setIsLoading(false);
      form.reset();
      onClose(); // Close the modal after successful deletion
    } catch (error) {
      console.error('Error deleting unit:', error);
      setSubmitError('Failed to delete unit');
      setIsLoading(false);
    }
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Delete a unit">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Select
          label="Unit Name"
          placeholder="Select unit to delete"
          error={form.errors.unit_name}
          searchable
          data={units.map((unit) => ({
            value: unit.unit_name, // Use unit_name as the value
            label: unit.unit_name,
          }))}
          onChange={(value) => form.setFieldValue('unit_name', value || '')} // Update unit_name in form state
          value={form.values.unit_name} // Bind the value to the form state
        />
        {/* {form.errors.unit_name && <Text color="red">{form.errors.unit_name}</Text>} */}

        {isLoading ? (
          <Loader size={24} />
        ) : (
          <>
            {submitError && <Text color="red">{submitError}</Text>}
            {/* {submitSuccess && <Text color="green">Unit deleted successfully!</Text>} */}
            <Button type="submit" mt="md" color="red">
              Delete Unit
            </Button>
          </>
        )}
      </form>
    </Modal>
  );
}