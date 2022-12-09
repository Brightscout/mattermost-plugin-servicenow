import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {GlobalState} from 'mattermost-webapp/types/store';

import {CustomModal as Modal, ModalFooter, ModalHeader, ResultPanel} from '@brightscout/mattermost-ui-library';

import useApiRequestCompletionState from 'src/hooks/useApiRequestCompletionState';
import usePluginApi from 'src/hooks/usePluginApi';

import Constants from 'src/plugin_constants';

import RecordTypePanel from 'src/containers/addOrEditSubscriptions/subComponents/recordTypePanel';
import SearchRecordsPanel from 'src/containers/addOrEditSubscriptions/subComponents/searchRecordsPanel';
import ChannelPanel from 'src/containers/addOrEditSubscriptions/subComponents/channelPanel';

import {setConnected} from 'src/reducers/connectedState';
import {resetGlobalModalState} from 'src/reducers/globalModal';
import {isShareRecordModalOpen} from 'src/selectors';

import Utils from 'src/utils';

const ShareRecords = () => {
    // Record states
    const [recordType, setRecordType] = useState<RecordType | null>(null);
    const [recordValue, setRecordValue] = useState('');
    const [recordId, setRecordId] = useState<string | null>(null);
    const [suggestionChosen, setSuggestionChosen] = useState(false);
    const [resetRecordPanelStates, setResetRecordPanelStates] = useState(false);
    const [channel, setChannel] = useState<string | null>(null);
    const [channelOptions, setChannelOptions] = useState<DropdownOptionType[]>([]);
    const [showChannelValidationError, setShowChannelValidationError] = useState<boolean>(false);
    const [shareRecordPayload, setShareRecordPayload] = useState<ShareRecordPayload | null>(null);
    const [recordData, setRecordData] = useState<RecordData | null>(null);
    const [showResultPanel, setShowResultPanel] = useState(false);
    const {currentChannelId} = useSelector((state: GlobalState) => state.entities.channels);

    // API error
    const [apiError, setApiError] = useState<APIError | null>(null);

    // usePluginApi hook
    const {pluginState, makeApiRequestWithCompletionStatus, getApiState} = usePluginApi();

    const dispatch = useDispatch();

    const resetFieldStates = useCallback(() => {
        setRecordType(null);
        setRecordValue('');
        setRecordId(null);
        setSuggestionChosen(false);
        setResetRecordPanelStates(false);
        setChannelOptions([]);
        setShowChannelValidationError(false);
        setApiError(null);
        setShareRecordPayload(null);
        setRecordData(null);
        setShowResultPanel(false);
    }, []);

    const hideModal = useCallback(() => {
        resetFieldStates();
        dispatch(resetGlobalModalState());
    }, []);

    // Opens share record modal
    const handleOpenShareRecordModal = useCallback(() => {
        resetFieldStates();
    }, []);

    const getShareRecordState = () => {
        const {isLoading} = getApiState(Constants.pluginApiServiceConfigs.shareRecord.apiServiceName, shareRecordPayload as ShareRecordPayload);
        return {isLoading};
    };

    useApiRequestCompletionState({
        serviceName: Constants.pluginApiServiceConfigs.shareRecord.apiServiceName,
        payload: shareRecordPayload,
        handleSuccess: () => setShowResultPanel(true),
        handleError: (error) => setApiError(error),
    });

    const shareRecord = () => {
        if (!channel) {
            setShowChannelValidationError(true);
            return;
        }

        const payload: ShareRecordPayload = {
            channel_id: channel,
            number: recordData?.number || '',
            record_type: recordType as RecordType,
            sys_id: recordId || '',
            assigned_to: recordData?.assigned_to || '',
            assignment_group: recordData?.assignment_group || '',
            priority: recordData?.priority || '',
            short_description: recordData?.short_description || '',
            state: recordData?.state || '',
            author: recordData?.author || '',
            kb_category: recordData?.kb_category || '',
            kb_knowledge_base: recordData?.kb_knowledge_base || '',
            workflow_state: recordData?.workflow_state || '',
        };

        setShareRecordPayload(payload);
        makeApiRequestWithCompletionStatus(Constants.pluginApiServiceConfigs.shareRecord.apiServiceName, payload);
    };

    // Remove validation error
    useEffect(() => {
        if (channel || !suggestionChosen) {
            setShowChannelValidationError(false);
        }
    }, [channel, suggestionChosen]);

    // Set the default channel to current channel
    useEffect(() => {
        if (currentChannelId) {
            setChannel(currentChannelId);
        }
    }, [isShareRecordModalOpen(pluginState)]);

    const getResultPanelPrimaryBtnActionOrText = useCallback((action: boolean) => {
        if (apiError?.id === Constants.ApiErrorIdNotConnected || apiError?.id === Constants.ApiErrorIdRefreshTokenExpired) {
            dispatch(setConnected(false));
            return action ? hideModal : 'Close';
        }
        return action ? handleOpenShareRecordModal : 'Share another record';
    }, [apiError]);

    const {isLoading} = getShareRecordState();
    return (
        <Modal
            show={isShareRecordModalOpen(pluginState)}
            onHide={hideModal}
            className='rhs-modal'
        >
            <>
                <ModalHeader
                    title='Share a record'
                    onHide={hideModal}
                    showCloseIconInHeader={true}
                />
                {showResultPanel || apiError ? (
                    <ResultPanel
                        header={Utils.getResultPanelHeader(apiError, hideModal, Constants.RecordSharedMsg)}
                        className={`${(showResultPanel || apiError) && 'wizard__secondary-panel--slide-in result-panel'}`}
                        primaryBtn={{
                            text: getResultPanelPrimaryBtnActionOrText(false) as string,
                            onClick: getResultPanelPrimaryBtnActionOrText(true) as (() => void) | null,
                        }}
                        secondaryBtn={{
                            text: 'Close',
                            onClick: apiError?.id === Constants.ApiErrorIdNotConnected || apiError?.id === Constants.ApiErrorIdRefreshTokenExpired ? null : hideModal,
                        }}
                        iconClass={apiError ? 'fa-times-circle-o result-panel-icon--error' : ''}
                    />
                ) : (
                    <>
                        <RecordTypePanel
                            recordType={recordType}
                            setRecordType={setRecordType}
                            setResetRecordPanelStates={setResetRecordPanelStates}
                            placeholder='Record Type'
                            recordTypeOptions={Constants.shareRecordTypeOptions}
                        />
                        <SearchRecordsPanel
                            recordValue={recordValue}
                            setRecordValue={setRecordValue}
                            suggestionChosen={suggestionChosen}
                            setSuggestionChosen={setSuggestionChosen}
                            recordType={recordType}
                            setApiError={setApiError}
                            recordId={recordId}
                            setRecordId={setRecordId}
                            resetStates={resetRecordPanelStates}
                            setResetStates={setResetRecordPanelStates}
                            setRecordData={setRecordData}
                            disabled={!recordType}
                        />
                        {suggestionChosen && (
                            <ChannelPanel
                                channel={channel}
                                setChannel={setChannel}
                                showModalLoader={isLoading}
                                setApiError={setApiError}
                                channelOptions={channelOptions}
                                setChannelOptions={setChannelOptions}
                                actionBtnDisabled={isLoading}
                                placeholder='Search channel to share'
                                validationError={showChannelValidationError}
                                editing={true}
                                required={true}
                                className='padding-top-10'
                            />
                        )}
                        <ModalFooter
                            onConfirm={recordData?.sys_id ? shareRecord : null}
                            confirmBtnText='Share'
                            confirmDisabled={isLoading}
                            onHide={hideModal}
                            cancelBtnText='Cancel'
                            cancelDisabled={isLoading}
                        />
                    </>
                )}
            </>
        </Modal>
    );
};

export default ShareRecords;
