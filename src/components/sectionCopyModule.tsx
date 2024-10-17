import React, { useState } from 'react';
import { Modal, Button, TextInput, Loader, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import axios from 'axios';

interface SectionCopyProps {
  isOpen: boolean;
  onClose: () => void;
  sectionToCopy: string | null;  // Section to copy
  onCopySuccess?: (newSectionId: string) => void;  // Callback after successful copy
}

export default function SectionCopyModule({ isOpen, onClose, sectionToCopy, onCopySuccess }: SectionCopyProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      newSectionId: '',
    },
  });

  // const handleCopy = async () => {
  //   const { newSectionId } = form.values;

  //   if (!newSectionId.trim() || !sectionToCopy) return;

  //   setLoading(true);

  //   try {
  //     // Make an API call to create a new section and copy units
  //     const response = await axios.post('http://localhost:5000/api/sections/copy', {
  //       originalSectionId: sectionToCopy,
  //       newSectionId: newSectionId.trim(),
  //     });

  //     if (response.status === 200) {
  //       // Notify the parent component of successful copy
  //       onCopySuccess?.(newSectionId.trim());
  //       onClose();
  //     } else {
  //       console.error('Error copying section:', response);
  //     }
  //   } catch (error) {
  //     console.error('Error copying section:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Function to handle copy action
  const handleCopy = async () => {
    const { newSectionId } = form.values;

    console.log("New scenerio: ", newSectionId);
    console.log("Scenerio to copy: ", sectionToCopy);

    if (!newSectionId) {
      console.log('New scenerio name is required');
      return;
    }

    if (!sectionToCopy) {
      console.log('Old scenerio name is required');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/copySection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            oldSectionId: sectionToCopy,
            newSectionId: newSectionId,
        })
      });

      if (response.ok) {
        console.log(`Scenerio ${sectionToCopy} copied to ${newSectionId} successfully.`);
      } else {
        const errorData = await response.json();
        console.log(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.log(`Error: ${error}`);
    }
    onClose();
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Copy Scenerio" centered>
      <form onSubmit={form.onSubmit(handleCopy)}>
        <TextInput
          label="New scenerio name"
          placeholder="Enter scenerio name"
          {...form.getInputProps('newSectionId')}
        />

        {loading ? <Loader size="sm" mt="md" /> : (
          <Button fullWidth mt="md" type="submit" disabled={!form.values.newSectionId.trim()}>
            Copy Section
          </Button>
        )}
      </form>
    </Modal>
  );
}
