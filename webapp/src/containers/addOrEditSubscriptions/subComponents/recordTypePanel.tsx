import React, {forwardRef, useState, useEffect} from 'react';

import ModalSubTitleAndError from 'components/modal/subComponents/modalSubtitleAndError';
import ModalFooter from 'components/modal/subComponents/modalFooter';
import Dropdown from 'components/dropdown';

type RecordTypePanelProps = {
    className?: string;
    error?: string;
    onContinue?: () => void;
    onBack?: () => void;
    actionBtnDisabled?: boolean;
    requiredFieldValidationErr?: boolean;
    recordType: string | null;
    setRecordType: (value: string) => void;
}

const recordTypeOptions: DropdownOptionType[] = [
    {
        label: 'Incident',
        value: 'Incident',
    },
    {
        label: 'Problem',
        value: 'Problem',
    },
    {
        label: 'Change Request',
        value: 'Change Request',
    },
];

const RecordTypePanel = forwardRef<HTMLDivElement, RecordTypePanelProps>(({className, error, onContinue, onBack, actionBtnDisabled, recordType, setRecordType}: RecordTypePanelProps, recordTypePanelRef): JSX.Element => {
    const [validationFailed, setValidationFailed] = useState(false);

    // Hide error state once the value is valid
    useEffect(() => {
        if (recordType) {
            setValidationFailed(false);
        }
    }, [recordType]);

    // Handle action when the continue button is clicked
    const handleContinue = () => {
        if (!recordType) {
            setValidationFailed(true);
            return;
        }

        if (onContinue) {
            onContinue();
        }
    };

    return (
        <div
            className={`modal__body modal-body secondary-panel ${className}`}
            ref={recordTypePanelRef}
        >
            <Dropdown
                placeholder='Select Record Type'
                value={recordType}
                onChange={(newValue) => setRecordType(newValue)}
                options={recordTypeOptions}
                required={true}
                error={validationFailed && 'Required'}
            />
            <ModalSubTitleAndError error={error}/>
            <ModalFooter
                onHide={onBack}
                onConfirm={handleContinue}
                cancelBtnText='Back'
                confirmBtnText='Continue'
                confirmDisabled={actionBtnDisabled}
                cancelDisabled={actionBtnDisabled}
            />
        </div>
    );
});

export default RecordTypePanel;
