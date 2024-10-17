// DeleteConfirmationModal.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Button, Title, Group, Text } from '@mantine/core';

interface DeleteConfirmationModalProps {
  open: boolean;
  sectionId: string;
  onClose: () => void;
  onDeleteSuccess: () => void;
}

export default function DeleteConfirmationModal({open, sectionId, onClose, onDeleteSuccess}: DeleteConfirmationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Attempting to delete section :)")
      // Send delete request to the backend
      await axios.delete(`http://localhost:5000/api/sections/${sectionId}`);
      
      onDeleteSuccess();
      onClose(); // Close the modal on success
    } catch (err) {
      console.error('Error deleting section:', err);
      setError('Failed to delete section. Please try again.');
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  return (
    <Modal opened={open} onClose={onClose} title="Confirm Deletion" centered>
        <Text>
          Are you sure you want to delete the section {sectionId}? This action is irreversible.
        </Text>
  
        {error && (
          <Text color="red" mt="sm">
            {error}
          </Text>
        )}
  
        <Group  mt="md">
          <Button onClick={onClose} variant="default" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="red" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </Group>
    </Modal>
  ); 
} 