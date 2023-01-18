import React, {forwardRef, useCallback, useEffect, useState} from 'react';
import {FetchBaseQueryError} from '@reduxjs/toolkit/dist/query';

import {AutoSuggest, ModalFooter} from '@brightscout/mattermost-ui-library';

import useApiRequestCompletionState from 'src/hooks/useApiRequestCompletionState';
import usePluginApi from 'src/hooks/usePluginApi';
import Constants, {SupportedFilters} from 'src/plugin_constants';

import Utils from 'src/utils';

import './styles.scss';

type FiltersPanelProps = {
    className?: string;
    onContinue?: () => void;
    onBack?: () => void;
    filters: FiltersData[];
    setFilters: (filters: FiltersData[]) => void;
    resetStates: boolean;
    setResetStates: (reset: boolean) => void;
    editing: boolean;
    setEditing: (editing: boolean) => void;
}

const FiltersPanel = forwardRef<HTMLDivElement, FiltersPanelProps>(({
    className,
    onBack,
    onContinue,
    filters,
    setFilters,
    resetStates,
    setResetStates,
    editing,
    setEditing,
}: FiltersPanelProps, filtersPanelRef) => {
    const [assignmentGroupOptions, setAssignmentGroupOptions] = useState<FieldsFilterData[]>([]);
    const [serviceOptions, setServiceOptions] = useState<FieldsFilterData[]>([]);
    const [assignmentGroupSuggestions, setAssignmentGroupSuggestions] = useState<Record<string, string>[]>([]);
    const [serviceSuggestions, setServiceSuggestions] = useState<Record<string, string>[]>([]);
    const [assignmentGroupAutoSuggestValue, setAssignmentGroupAutoSuggestValue] = useState('');
    const [serviceAutoSuggestValue, setServiceAutoSuggestValue] = useState('');
    const [searchItemsPayload, setSearchItemsPayload] = useState<SearchFilterItemsParams | null>(null);
    const [getAssignmentGroupPayload, setGetAssignmentGroupPayload] = useState<SearchFilterItemsParams | null>(null);
    const [getServicePayload, setGetServicePayload] = useState<SearchFilterItemsParams | null>(null);
    const [defaultAssignmentGroup, setDefaultAssignmentGroup] = useState<Record<string, string>>();
    const [defaultService, setDefaultService] = useState<Record<string, string>>();

    const {makeApiRequestWithCompletionStatus, getApiState} = usePluginApi();

    // Reset the field states
    const resetFieldStates = useCallback(() => {
        setFilters([]);
        setAssignmentGroupOptions([]);
        setServiceOptions([]);
        setAssignmentGroupSuggestions([]);
        setServiceSuggestions([]);
        setAssignmentGroupAutoSuggestValue('');
        setServiceAutoSuggestValue('');
        setSearchItemsPayload(null);
        setGetAssignmentGroupPayload(null);
        setGetServicePayload(null);
        setEditing(false);
    }, []);

    const getSuggestions = ({searchFor, type}: {searchFor?: string, type?: string}) => {
        if (searchFor) {
            const payload: SearchFilterItemsParams = {
                search: searchFor,
            };

            if (type === SupportedFilters.ASSIGNMENT_GROUP) {
                payload.filter = SupportedFilters.ASSIGNMENT_GROUP;
            } else {
                payload.filter = SupportedFilters.SERVICE;
            }

            setSearchItemsPayload(payload);
            makeApiRequestWithCompletionStatus(Constants.pluginApiServiceConfigs.getFilterData.apiServiceName, payload);
        }
    };

    const mapRequestsToSuggestions = (data: FieldsFilterData[]): Array<Record<string, string>> => data.map((d) => ({
        id: d.sys_id,
        name: d.name,
    }));

    const debouncedGetSuggestions = useCallback(Utils.debounce(getSuggestions, Constants.DebounceFunctionTimeLimit), [getSuggestions]);

    const setFiltersValue = (filterType: string, filterValue: string | null) => {
        const currentFilters = [...filters];
        const filterIndex = currentFilters.findIndex((filter) => filter.filterType === filterType);
        if (currentFilters[filterIndex]) {
            currentFilters[filterIndex].filterValue = filterValue;
        } else {
            currentFilters.push({filterType, filterValue});
        }

        setFilters(currentFilters);
    };

    const handleAssignmentGroupInputChange = (currentValue: string) => {
        setAssignmentGroupAutoSuggestValue(currentValue);
        setFiltersValue(SupportedFilters.ASSIGNMENT_GROUP, null);
        setEditing(false);
        if (currentValue) {
            if (currentValue.length >= Constants.DefaultCharThresholdToShowSuggestions) {
                debouncedGetSuggestions({searchFor: currentValue, type: SupportedFilters.ASSIGNMENT_GROUP});
            }
        }
    };

    const handleServiceInputChange = (currentValue: string) => {
        setServiceAutoSuggestValue(currentValue);
        setFiltersValue(SupportedFilters.SERVICE, null);
        setEditing(false);
        if (currentValue) {
            if (currentValue.length >= Constants.DefaultCharThresholdToShowSuggestions) {
                debouncedGetSuggestions({searchFor: currentValue, type: SupportedFilters.SERVICE});
            }
        }
    };

    const handleAssignmentGroupSelection = (suggestion: Record<string, string> | null) => {
        if (suggestion) {
            setAssignmentGroupAutoSuggestValue(suggestion.name);
            setFiltersValue(SupportedFilters.ASSIGNMENT_GROUP, suggestion.id);
        }
    };

    const handleServiceSelection = (suggestion: Record<string, string> | null) => {
        if (suggestion) {
            setServiceAutoSuggestValue(suggestion.name);
            setFiltersValue(SupportedFilters.SERVICE, suggestion.id);
        }
    };

    const getItemsSuggestions = () => {
        const {isLoading, data, isError, error: apiErr} = getApiState(Constants.pluginApiServiceConfigs.getFilterData.apiServiceName, searchItemsPayload);
        return {isLoading, data: data as FieldsFilterData[], isError, error: (apiErr as FetchBaseQueryError)?.data as APIError | undefined};
    };

    const getItems = (payload: SearchFilterItemsParams | null) => {
        const {isLoading, data: getItemsData, isError, isSuccess, error: apiErr} = getApiState(Constants.pluginApiServiceConfigs.getFilterData.apiServiceName, payload);
        return {isLoading, data: getItemsData as FieldsFilterData[], isError, isSuccess, error: (apiErr as FetchBaseQueryError)?.data as APIError | undefined};
    };

    useApiRequestCompletionState({
        serviceName: Constants.pluginApiServiceConfigs.getFilterData.apiServiceName,
        payload: searchItemsPayload,
        handleSuccess: () => {
            if (searchItemsPayload?.filter === SupportedFilters.ASSIGNMENT_GROUP) {
                setAssignmentGroupOptions(data);
            } else {
                setServiceOptions(data);
            }
        },
    });

    useEffect(() => {
        if (assignmentGroupOptions) {
            setAssignmentGroupSuggestions(mapRequestsToSuggestions(assignmentGroupOptions));
        }

        if (serviceOptions) {
            setServiceSuggestions(mapRequestsToSuggestions(serviceOptions));
        }
    }, [assignmentGroupOptions, serviceOptions]);

    useEffect(() => {
        if (editing && filters.length) {
            filters.map((filter) => {
                const payload: SearchFilterItemsParams = {
                    search: filter.filterValue ?? '',
                    filter: filter.filterType,
                };

                if (filter.filterType === SupportedFilters.ASSIGNMENT_GROUP) {
                    setGetAssignmentGroupPayload(payload);
                } else {
                    setGetServicePayload(payload);
                }

                makeApiRequestWithCompletionStatus(Constants.pluginApiServiceConfigs.getFilterData.apiServiceName, payload);
                return '';
            });
        }
    }, [editing, filters]);

    const {data: assignmentGroupData, isLoading: assignmentGroupDataLoading} = getItems(getAssignmentGroupPayload);
    const {data: serviceData, isLoading: serviceDataLoading} = getItems(getServicePayload);
    useApiRequestCompletionState({
        serviceName: Constants.pluginApiServiceConfigs.getFilterData.apiServiceName,
        payload: getAssignmentGroupPayload,
        handleSuccess: () => {
            if (editing) {
                const filterValue = mapRequestsToSuggestions(assignmentGroupData?.filter((f) => f.sys_id === getAssignmentGroupPayload?.search) as unknown as FieldsFilterData[])?.[0];
                setDefaultAssignmentGroup(filterValue);
            }
        },
    });

    useApiRequestCompletionState({
        serviceName: Constants.pluginApiServiceConfigs.getFilterData.apiServiceName,
        payload: getServicePayload,
        handleSuccess: () => {
            if (editing) {
                const filterValue = mapRequestsToSuggestions(serviceData?.filter((f) => f.sys_id === getServicePayload?.search) as unknown as FieldsFilterData[])?.[0];
                setDefaultService(filterValue);
            }
        },
    });

    // If the "resetStates" is set, reset the data
    useEffect(() => {
        if (resetStates) {
            resetFieldStates();

            // Set the resetState to "false" once we've reset the states
            setResetStates(false);
        }
    }, [resetStates]);

    const {isLoading, data, isError, error} = getItemsSuggestions();
    return (
        <div
            className={className}
            ref={filtersPanelRef}
        >
            <div className='filters-panel filters-panel__auto-suggest'>
                <label className='filters-panel__label font-16 wt-400'>{'Available filters:'}</label>
                <AutoSuggest
                    className='margin-bottom-35'
                    placeholder='Search Assignment Groups'
                    inputValue={assignmentGroupAutoSuggestValue}
                    onInputValueChange={handleAssignmentGroupInputChange}
                    onChangeSelectedSuggestion={handleAssignmentGroupSelection}
                    loadingSuggestions={(isLoading && searchItemsPayload?.filter === SupportedFilters.ASSIGNMENT_GROUP) || assignmentGroupDataLoading}
                    suggestionConfig={{
                        suggestions: assignmentGroupSuggestions,
                        renderValue: (suggestion) => suggestion.name,
                    }}
                    disabled={assignmentGroupDataLoading}
                    defaultValue={defaultAssignmentGroup}
                    charThresholdToShowSuggestions={Constants.DefaultCharThresholdToShowSuggestions}
                    error={(isError && searchItemsPayload?.filter === SupportedFilters.ASSIGNMENT_GROUP) ? error?.message : ''}
                />
                <AutoSuggest
                    placeholder='Search Services'
                    inputValue={serviceAutoSuggestValue}
                    onInputValueChange={handleServiceInputChange}
                    onChangeSelectedSuggestion={handleServiceSelection}
                    loadingSuggestions={(isLoading && searchItemsPayload?.filter === SupportedFilters.SERVICE) || serviceDataLoading}
                    suggestionConfig={{
                        suggestions: serviceSuggestions,
                        renderValue: (suggestion) => suggestion.name,
                    }}
                    disabled={serviceDataLoading}
                    defaultValue={defaultService}
                    charThresholdToShowSuggestions={Constants.DefaultCharThresholdToShowSuggestions}
                    error={(isError && searchItemsPayload?.filter === SupportedFilters.SERVICE) ? error?.message : ''}
                />
            </div>
            <ModalFooter
                onHide={onBack}
                onConfirm={onContinue}
                cancelBtnText='Back'
                confirmBtnText='Continue'
                confirmDisabled={isLoading}
                cancelDisabled={isLoading}
            />
        </div>

    );
});

export default FiltersPanel;
