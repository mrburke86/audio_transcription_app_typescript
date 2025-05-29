// src\hooks\useRoleDescriptionModal.ts
import { useEffect, useState } from 'react';

// src\hooks\useRoleDescriptionModal.ts
export const useRoleDescriptionModal = (initialRole?: string) => {
    const [roleDescription, setRoleDescription] = useState(initialRole || '');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!roleDescription || roleDescription.trim() === '') {
            setShowModal(true);
        }
    }, [roleDescription]);

    const handleRoleSubmit = (newRole: string) => {
        setRoleDescription(newRole);
        setShowModal(false);
    };

    return {
        roleDescription,
        showModal,
        handleRoleSubmit,
    };
};
