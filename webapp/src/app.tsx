import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {FetchBaseQueryError} from '@reduxjs/toolkit/dist/query';

import usePluginApi from 'src/hooks/usePluginApi';

import Constants from 'src/plugin_constants';

import {getGlobalModalState} from './selectors';
import {setCurrentModalState} from './reducers/currentModal';
import {resetGlobalModalState} from './reducers/globalModal';

const GetConfig = (): JSX.Element => {
    const {makeApiRequest, pluginState, getApiState} = usePluginApi();
    const {modalId, data} = getGlobalModalState(pluginState);
    const dispatch = useDispatch();

    const getConnectedUserState = () => {
        const {isLoading, isSuccess, isError, data: userData, error: apiErr} = getApiState(Constants.pluginApiServiceConfigs.getConnectedUser.apiServiceName);
        return {isLoading, isSuccess, isError, data: userData as ConnectedState, error: (apiErr as FetchBaseQueryError)?.data as APIError | undefined};
    };

    const getSubscriptionsConfiguredState = () => {
        const {isLoading, isSuccess, isError, error: apiErr} = getApiState(Constants.pluginApiServiceConfigs.checkSubscriptionsConfigured.apiServiceName);
        return {isLoading, isSuccess, isError, error: (apiErr as FetchBaseQueryError)?.data as APIError | undefined};
    };

    useEffect(() => {
        makeApiRequest(Constants.pluginApiServiceConfigs.getConfig.apiServiceName);
    }, []);

    useEffect(() => {
        if (modalId) {
            switch (modalId) {
            case 'shareRecord':
                makeApiRequest(Constants.pluginApiServiceConfigs.getConnectedUser.apiServiceName);
                break;
            case 'addSubscription':
            case 'editSubscription':
                makeApiRequest(Constants.pluginApiServiceConfigs.checkSubscriptionsConfigured.apiServiceName);
            }
        }
    }, [modalId]);

    useEffect(() => {
        const {data: userData, isLoading} = getConnectedUserState();
        if (!isLoading && modalId) {
            if (userData?.connected) {
                switch (modalId) {
                case 'shareRecord':
                    dispatch(setCurrentModalState({modalId: 'shareRecord'}));
                    break;
                }
            }
            dispatch(resetGlobalModalState());
        }
    }, [getConnectedUserState().isLoading, getConnectedUserState().data]);

    useEffect(() => {
        const {isLoading, isSuccess} = getSubscriptionsConfiguredState();
        if (!isLoading && modalId) {
            if (isSuccess) {
                switch (modalId) {
                case 'addSubscription':
                    dispatch(setCurrentModalState({modalId: 'addSubscription'}));
                    break;
                case 'editSubscription':
                    dispatch(setCurrentModalState({modalId: 'editSubscription', data}));
                    break;
                }
            }
            dispatch(resetGlobalModalState());
        }
    }, [getSubscriptionsConfiguredState().isLoading, getSubscriptionsConfiguredState().isSuccess]);

    // This container is used just for making the API call for fetching the config, it doesn't render anything.
    return <></>;
};

export default GetConfig;
