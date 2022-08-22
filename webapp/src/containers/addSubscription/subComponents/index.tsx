import React, {createRef, useEffect, useState} from 'react';

import Modal from 'components/modal/customModal';
import ModalHeader from 'components/modal/subComponents/modalHeader';
import ModalLoader from 'components/modal/subComponents/modalLoader';
import CircularLoader from 'components/loader/circular';

import {PanelDefaultHeights} from 'plugin_constants';

import ChannelPanel from './channelPanel';
import RecordTypePanel from './recordTypePanel';
import EventsPanel from './eventsPanel';
import SearchRecordsPanel from './searchRecordsPanel';
import ResultPanel from './resultPanel';

import './styles.scss';

type AddSubscriptionProps = {
    open: boolean;
    close: () => void;
};

const AddSubscription = ({open, close}: AddSubscriptionProps) => {
    // Channel panel values
    const [channel, setChannel] = useState<string | null>(null);

    // Record panel values
    const [recordValue, setRecordValue] = useState('');
    const [suggestionChosen, setSuggestionChosen] = useState(false);

    // Alert type panel
    const [recordType, setRecordType] = useState<null | string>(null);

    // Opened panel states
    const [recordTypePanelOpen, setRecordTypePanelOpen] = useState(false);
    const [searchRecordsPanelOpen, setSearchRecordsPanelOpen] = useState(false);
    const [eventsPanelOpen, setEventsPanelOpen] = useState(false);
    const [successPanelOpen, setSuccessPanelOpen] = useState(false);

    // Events panel values
    const [stateChanged, setStateChanged] = useState(false);
    const [priorityChanged, setPriorityChanged] = useState(false);
    const [newCommentChecked, setNewCommentChecked] = useState(false);
    const [assignedToChecked, setAssignedToChecked] = useState(false);
    const [assignmentGroupChecked, setAssignmentGroupChecked] = useState(false);

    // API error
    const [apiError, setApiError] = useState<string | null>(null);
    const [apiResponseValid, setApiResponseValid] = useState(false);

    // Create refs to access height of the panels and providing height to modal-dialog
    // We've made all the panels absolute positioned to apply animations and because they are absolute positioned, their parent container, which is modal-dialog, won't expand the same as their heights
    const channelPanelRef = createRef<HTMLDivElement>();
    const recordTypePanelRef = createRef<HTMLDivElement>();
    const searchRecordsPanelRef = createRef<HTMLDivElement>();
    const eventsPanelRef = createRef<HTMLDivElement>();
    const resultPanelRef = createRef<HTMLDivElement>();

    // Reset input field states
    const resetFieldStates = () => {
        setChannel(null);
        setRecordValue('');
        setSuggestionChosen(false);
        setRecordType(null);
        setStateChanged(false);
        setPriorityChanged(false);
        setNewCommentChecked(false);
        setAssignedToChecked(false);
        setAssignmentGroupChecked(false);
    };

    // Reset panel states
    const resetPanelStates = () => {
        setRecordTypePanelOpen(false);
        setSearchRecordsPanelOpen(false);
        setEventsPanelOpen(false);
        setSuccessPanelOpen(false);
    };

    // Reset error states
    const resetError = () => {
        setApiResponseValid(false);
        setApiError(null);
    };

    const hideModal = () => {
        // Reset modal states
        resetFieldStates();
        resetError();

        // Close the modal
        close();

        // Resetting opened panel states so that there isn't unnecessary jump from one panel to another while closing the modal
        setTimeout(() => {
            resetPanelStates();
        }, 500);
    };

    // Handle action when add another subscription button is clicked
    const addAnotherSubscription = () => {
        resetFieldStates();
        resetPanelStates();
    };

    // Handle action when back button is clicked on failure modal
    const resetFailureState = () => {
        resetPanelStates();
        resetError();
    };

    // Set the height of the modal content according to different panels;
    // Added 65 in the given height because of (header + loader) height
    const setModalDialogHeight = (bodyHeight: number) => {
        const setHeight = (modalContent: Element) => modalContent.setAttribute('style', `height:${bodyHeight + PanelDefaultHeights.panelHeader}px`);

        // Select all the modal-content elements and set the height
        document.querySelectorAll('.rhs-modal.add-subscription-modal .modal-content').forEach((modalContent) => setHeight(modalContent));
    };

    // Change height of the modal depending on the height of the visible panel
    useEffect(() => {
        let height;

        if (successPanelOpen || (apiError && apiResponseValid)) {
            height = resultPanelRef.current?.offsetHeight || PanelDefaultHeights.successPanel;

            setModalDialogHeight(height);
            // eslint-disable-next-line no-unused-expressions
            resultPanelRef.current?.setAttribute('style', `max-height:${height}px;overflow:auto`);
            return;
        }
        if (eventsPanelOpen) {
            height = eventsPanelRef.current?.offsetHeight || PanelDefaultHeights.eventsPanel;

            setModalDialogHeight(height);
            // eslint-disable-next-line no-unused-expressions
            eventsPanelRef.current?.setAttribute('style', `max-height:${height}px;overflow:auto`);
            return;
        }
        if (searchRecordsPanelOpen) {
            height = searchRecordsPanelRef.current?.offsetHeight || PanelDefaultHeights.searchRecordPanel;

            if (suggestionChosen && height < PanelDefaultHeights.searchRecordPanelExpanded) {
                height = PanelDefaultHeights.searchRecordPanelExpanded;
            }

            setModalDialogHeight(height);
            // eslint-disable-next-line no-unused-expressions
            searchRecordsPanelRef.current?.setAttribute('style', `max-height:${height}px;overflow:auto`);
            return;
        }
        if (recordTypePanelOpen) {
            height = recordTypePanelRef.current?.offsetHeight || PanelDefaultHeights.recordTypePanel;

            setModalDialogHeight(height);
            // eslint-disable-next-line no-unused-expressions
            recordTypePanelRef.current?.setAttribute('style', `max-height:${height}px;overflow:auto`);
            return;
        }
        if (!recordTypePanelOpen && !searchRecordsPanelOpen && !eventsPanelOpen) {
            height = channelPanelRef.current?.offsetHeight || PanelDefaultHeights.channelPanel;

            setModalDialogHeight(height);
            // eslint-disable-next-line no-unused-expressions
            channelPanelRef.current?.setAttribute('style', `max-height:${height}px;overflow:auto`);
        }
    }, [eventsPanelOpen, searchRecordsPanelOpen, recordTypePanelOpen, channelPanelRef, recordTypePanelRef, searchRecordsPanelRef, eventsPanelRef, resultPanelRef, apiError, apiResponseValid, suggestionChosen, successPanelOpen]);

    return (
        <Modal
            show={open}
            onHide={hideModal}

            // If these classes are updated, please also update the query in the "setModalDialogHeight" function which is defined above.
            className='rhs-modal add-subscription-modal'
        >
            <>
                <ModalHeader
                    title={'Add Subscription'}
                    onHide={hideModal}
                    showCloseIconInHeader={true}
                />
                <ModalLoader loading={false}/>
                <ChannelPanel
                    className={`
                        ${recordTypePanelOpen && 'channel-panel--fade-out'}
                        ${(successPanelOpen || (apiResponseValid && apiError)) && 'channel-panel--fade-out'}
                    `}
                    ref={channelPanelRef}
                    onContinue={() => setRecordTypePanelOpen(true)}
                    channel={channel}
                    setChannel={setChannel}
                />
                <RecordTypePanel
                    className={`
                        ${recordTypePanelOpen && 'secondary-panel--slide-in'}
                        ${(searchRecordsPanelOpen || eventsPanelOpen) && 'secondary-panel--fade-out'}
                        ${(successPanelOpen || (apiResponseValid && apiError)) && 'secondary-panel--fade-out'}
                    `}
                    ref={recordTypePanelRef}
                    onContinue={() => setSearchRecordsPanelOpen(true)}
                    onBack={() => setRecordTypePanelOpen(false)}
                    recordType={recordType}
                    setRecordType={setRecordType}
                />
                <SearchRecordsPanel
                    className={`
                        ${searchRecordsPanelOpen && 'secondary-panel--slide-in'}
                        ${eventsPanelOpen && 'secondary-panel--fade-out'}
                        ${(successPanelOpen || (apiResponseValid && apiError)) && 'secondary-panel--fade-out'}
                    `}
                    ref={searchRecordsPanelRef}
                    onContinue={() => {
                        if (recordValue) {
                            setEventsPanelOpen(true);
                        } else {
                            setApiError('Please select a record(This is placeholder text for error).');
                            setApiResponseValid(true);
                        }
                    }}
                    onBack={() => setSearchRecordsPanelOpen(false)}
                    recordValue={recordValue}
                    setRecordValue={setRecordValue}
                    suggestionChosen={suggestionChosen}
                    setSuggestionChosen={setSuggestionChosen}
                />
                <EventsPanel
                    className={`
                        ${eventsPanelOpen && 'secondary-panel--slide-in'}
                        ${(successPanelOpen || (apiResponseValid && apiError)) && 'secondary-panel--fade-out'}
                    `}
                    ref={eventsPanelRef}
                    onContinue={() => setSuccessPanelOpen(true)}
                    onBack={() => setEventsPanelOpen(false)}
                    stateChanged={stateChanged}
                    setStateChanged={setStateChanged}
                    priorityChanged={priorityChanged}
                    setPriorityChanged={setPriorityChanged}
                    newCommentChecked={newCommentChecked}
                    setNewCommentChecked={setNewCommentChecked}
                    assignedToChecked={assignedToChecked}
                    setAssignedToChecked={setAssignedToChecked}
                    assignmentGroupChecked={assignmentGroupChecked}
                    setAssignmentGroupChecked={setAssignmentGroupChecked}
                    channel={channel as string}
                    record={recordValue}
                />
                <ResultPanel
                    onPrimaryBtnClick={apiError && apiResponseValid ? resetFailureState : addAnotherSubscription}
                    onSecondaryBtnClick={hideModal}
                    className={`${(successPanelOpen || (apiError && apiResponseValid)) && 'secondary-panel--slide-in'}`}
                    ref={resultPanelRef}
                    primaryBtnText={apiError && apiResponseValid ? 'Back' : 'Add Another Subscription'}
                    iconClass={apiError && apiResponseValid ? 'fa-times-circle-o result-panel-icon--error' : null}
                    header={apiResponseValid ? apiError : null}
                />
                {false && <CircularLoader/>}
            </>
        </Modal>
    );
};

export default AddSubscription;
