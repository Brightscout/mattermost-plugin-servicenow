import {AutoSuggest, CustomModal as Modal, ModalFooter, ModalHeader} from '@brightscout/mattermost-ui-library';
import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import usePluginApi from 'src/hooks/usePluginApi';
import {resetGlobalModalState} from 'src/reducers/globalModal';
import {isFilterRecordsModalOpen} from 'src/selectors';
import RecordTypePanel from '../addOrEditSubscriptions/subComponents/recordTypePanel';
import Constants from 'src/plugin_constants';

import Utils from 'src/utils';

import './styles.scss';

// TODO: mock data, will change later
const AssignmentGroupOptions: FieldsFilterData[] = [
    {
        sys_id: 'mockId 1',
        name: 'group 1',
    },
    {
        sys_id: 'mockId 2',
        name: 'group 2',
    },
    {
        sys_id: 'mockId 3',
        name: 'group 3',
    },
];

const ServiceOptions: FieldsFilterData[] = [
    {
        sys_id: 'mockId 1',
        name: 'service 1',
    },
    {
        sys_id: 'mockId 2',
        name: 'service 2',
    },
    {
        sys_id: 'mockId 3',
        name: 'service 3',
    },
];

const ListRecords = () => {
    const [showModal, setShowModal] = useState(false);
    const [assignmentGroupOptions, setAssignmentGroupOptions] = useState<FieldsFilterData[]>(AssignmentGroupOptions);
    const [serviceOptions, setServiceOptions] = useState<FieldsFilterData[]>(ServiceOptions);
    const [assignmentGroupSuggestions, setAssignmentGroupSuggestions] = useState<Record<string, string>[]>([]);
    const [serviceSuggestions, setServiceSuggestions] = useState<Record<string, string>[]>([]);
    const [assignmentGroupAutoSuggestValue, setassignmentGroupAutoSuggestValue] = useState('');
    const [serviceAutoSuggestValue, setServiceAutoSuggestValue] = useState('');
    const [recordType, setRecordType] = useState<RecordType | null>(null);
    const [assignmentGroup, setAssignmentGroup] = useState<Record<string, string> | null>(null);
    const [service, setService] = useState<Record<string, string> | null>(null);

    const {pluginState} = usePluginApi();
    const dispatch = useDispatch();

    const open = isFilterRecordsModalOpen(pluginState);

    // Reset the field states
    const resetFieldStates = useCallback(() => {
        setRecordType(null);
        setAssignmentGroupOptions([]);
        setServiceOptions([]);
        setAssignmentGroupSuggestions([]);
        setServiceSuggestions([]);
        setassignmentGroupAutoSuggestValue('');
        setServiceAutoSuggestValue('');
        setAssignmentGroup(null);
        setService(null);
    }, []);

    // Hide the modal and reset the states
    const hideModal = useCallback(() => {
        dispatch(resetGlobalModalState());
        setShowModal(false);
        setTimeout(() => {
            resetFieldStates();
        });
    }, []);

    const showFilteredRecords = () => {
        // TODO: for testing remove after integration
        // eslint-disable-next-line no-console
        console.log(recordType, assignmentGroup, service);
        hideModal();
    };

    const getSuggestions = ({searchFor}: {searchFor?: string}) => {
        if (searchFor) {
            // TODO: Make Api call later
        }
    };

    const mapRequestsToSuggestions = (data: FieldsFilterData[]): Array<Record<string, string>> => data.map((d) => ({
        id: d.sys_id,
        name: d.name,
    }));

    const debouncedGetSuggestions = useCallback(Utils.debounce(getSuggestions, Constants.DebounceFunctionTimeLimit), [getSuggestions]);

    const handleAssignmentGroupInputChange = (currentValue: string) => {
        setassignmentGroupAutoSuggestValue(currentValue);
        if (currentValue) {
            if (currentValue.length >= Constants.DefaultCharThresholdToShowSuggestions) {
                debouncedGetSuggestions({searchFor: currentValue});
            }
        }
    };

    const handleServiceInputChange = (currentValue: string) => {
        setServiceAutoSuggestValue(currentValue);
        if (currentValue) {
            if (currentValue.length >= Constants.DefaultCharThresholdToShowSuggestions) {
                debouncedGetSuggestions({searchFor: currentValue});
            }
        }
    };

    const handleAssignmentGroupSelection = (suggestion: Record<string, string> | null) => {
        setassignmentGroupAutoSuggestValue(suggestion?.name || '');
        setAssignmentGroup(suggestion);
    };

    const handleServiceSelection = (suggestion: Record<string, string> | null) => {
        setServiceAutoSuggestValue(suggestion?.name || '');
        setService(suggestion);
    };

    useEffect(() => {
        setAssignmentGroupSuggestions(mapRequestsToSuggestions(assignmentGroupOptions));
    }, [assignmentGroupOptions]);

    useEffect(() => {
        setServiceSuggestions(mapRequestsToSuggestions(serviceOptions));
    }, [serviceOptions]);

    useEffect(() => {
        if (open && pluginState.connectedReducer.connected) {
            setShowModal(true);
        } else {
            dispatch(resetGlobalModalState());
        }
    }, [open]);

    return (
        <Modal
            show={showModal}
            onHide={hideModal}
            className='servicenow-rhs-modal'
        >
            <>
                <ModalHeader
                    title='List records'
                    onHide={hideModal}
                    showCloseIconInHeader={true}
                />
                <RecordTypePanel
                    className='margin-bottom-25'
                    recordType={recordType}
                    setRecordType={setRecordType}
                    recordTypeOptions={Constants.recordTypeOptions}
                />
                <div
                    className={
                        `servicenow-list-records-modal__auto-suggest
                        ${(assignmentGroup || serviceOptions) && 'servicenow-list-records-modal__suggestion-chosen'}
                    `}
                >
                    <AutoSuggest
                        placeholder='Search Assignment Groups'
                        inputValue={assignmentGroupAutoSuggestValue}
                        onInputValueChange={handleAssignmentGroupInputChange}
                        onChangeSelectedSuggestion={handleAssignmentGroupSelection}
                        suggestionConfig={{
                            suggestions: assignmentGroupSuggestions,
                            renderValue: (suggestion) => suggestion.name,
                        }}
                        charThresholdToShowSuggestions={Constants.DefaultCharThresholdToShowSuggestions}
                    />
                    <AutoSuggest
                        placeholder='Search Services'
                        inputValue={serviceAutoSuggestValue}
                        onInputValueChange={handleServiceInputChange}
                        onChangeSelectedSuggestion={handleServiceSelection}
                        suggestionConfig={{
                            suggestions: serviceSuggestions,
                            renderValue: (suggestion) => suggestion.name,
                        }}
                        charThresholdToShowSuggestions={Constants.DefaultCharThresholdToShowSuggestions}
                    />
                </div>
                <ModalFooter
                    onConfirm={showFilteredRecords}
                    confirmBtnText='Submit'
                    confirmDisabled={!recordType}
                    onHide={hideModal}
                    cancelBtnText='Cancel'
                />
            </>
        </Modal>
    );
};

export default ListRecords;
