/**
 * Keep all common types here which are to be used throughout the project
*/

type TabData = {
    title: string,
    tabPanel: JSX.Element
}

type HttpMethod = 'GET' | 'POST';

type ApiServiceName = 'getChannels' | 'searchRecords' | 'getRecord' | 'createSubscription'

type PluginApiService = {
    path: string,
    method: httpMethod,
    apiServiceName: string
}

type PluginState = {
    'plugins-mattermost-plugin-servicenow': RootState<{ [x: string]: QueryDefinition<void, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta>, never, void, 'pluginApi'>; }, never, 'pluginApi'>
}

type DropdownOptionType = {
    label?: string | JSX.Element;
    value: string;
}

type ProjectDetails = {
    mattermostID: string
    projectID: string,
    projectName: string,
    organizationName: string
}

type SubscriptionDetails = {
    id: string
    name: string
    eventType: eventType
}

type EditSubscriptionData = {
    channel: string,
    recordValue: string,
    alertType: RecordType,
    stateChanged: boolean;
    priorityChanged: boolean;
    newCommentChecked: boolean;
    assignedToChecked: boolean;
    assignmentGroupChecked: boolean;
}

type RecordDataKeys = 'short_description' | 'state' | 'priority' | 'assigned_to' | 'assignment_group';

type RecordDataLabelConfigType = {
    key: RecordDataKeys;
    label: string;
}

type APIPayloadType = void | FetchChannelsParams | SearchRecordsParams | GetRecordParams | CreateSubscriptionPayload;
