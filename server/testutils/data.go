package testutils

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/Brightscout/mattermost-plugin-servicenow/server/constants"
	"github.com/Brightscout/mattermost-plugin-servicenow/server/serializer"
	"github.com/mattermost/mattermost-server/v5/api4"
	"github.com/mattermost/mattermost-server/v5/model"
)

func GetSecret() string {
	return "test-secret"
}

func GetID() string {
	return "sfmq19kpztg5iy47ebe51hb31w"
}

func GetChannel(channelType string) *model.Channel {
	return &model.Channel{
		Id:   api4.GenerateTestId(),
		Type: channelType,
	}
}

func GetPost() *model.Post {
	return &model.Post{
		Id: api4.GenerateTestId(),
	}
}

func GetChannels(count int, channelType string) []*model.Channel {
	if count == 0 {
		return nil
	}

	if channelType == "" {
		channelType = model.CHANNEL_OPEN
	}

	channels := make([]*model.Channel, count)
	for i := 0; i < count; i++ {
		channels[i] = GetChannel(channelType)
	}

	return channels
}

func GetBadRequestAppError() *model.AppError {
	return &model.AppError{
		StatusCode: http.StatusBadRequest,
	}
}

func GetInternalServerAppError() *model.AppError {
	return &model.AppError{
		StatusCode: http.StatusInternalServerError,
	}
}

func GetNotFoundAppError() *model.AppError {
	return &model.AppError{
		StatusCode: http.StatusNotFound,
	}
}

func GetServiceNowSysID() string {
	return "d5d4f60807861110da0ef4be7c1ed0d6"
}

func GetServiceNowNumber() string {
	return "PRB0000005"
}

func GetServiceNowShortDescription() string {
	return "Test description"
}

func GetServiceNowPartialRecord() *serializer.ServiceNowPartialRecord {
	return &serializer.ServiceNowPartialRecord{
		SysID:            GetServiceNowSysID(),
		Number:           GetServiceNowNumber(),
		ShortDescription: GetServiceNowShortDescription(),
	}
}

func GetServiceNowPartialRecords(count int) []*serializer.ServiceNowPartialRecord {
	if count == 0 {
		return nil
	}

	records := make([]*serializer.ServiceNowPartialRecord, count)
	for i := 0; i < count; i++ {
		records[i] = GetServiceNowPartialRecord()
	}

	return records
}

func GetSerializerUser() *serializer.User {
	return &serializer.User{
		MattermostUserID: GetID(),
		OAuth2Token:      "test-oauthtoken",
	}
}

func GetLimitAndOffset() (limit, offset string) {
	return fmt.Sprint(constants.DefaultPerPage), fmt.Sprint(constants.DefaultPerPage * constants.DefaultPage)
}

func GetServiceNowRecord() *serializer.ServiceNowRecord {
	return &serializer.ServiceNowRecord{
		SysID:            GetServiceNowSysID(),
		Number:           GetServiceNowNumber(),
		ShortDescription: GetServiceNowShortDescription(),
		State:            "New",
		Priority:         "High",
		AssignedTo:       "",
		AssignmentGroup:  "",
	}
}

func GetSubscription(subscriptionType string) *serializer.SubscriptionResponse {
	return &serializer.SubscriptionResponse{
		SysID:              GetServiceNowSysID(),
		UserID:             GetID(),
		ChannelID:          GetID(),
		RecordType:         constants.SubscriptionRecordTypeProblem,
		SubscriptionEvents: constants.SubscriptionEventPriority + "," + constants.SubscriptionEventState,
		IsActive:           "true",
		Type:               subscriptionType,
		Number:             GetServiceNowNumber(),
		ShortDescription:   GetServiceNowShortDescription(),
	}
}

func GetSubscriptions(count int) []*serializer.SubscriptionResponse {
	subscriptions := make([]*serializer.SubscriptionResponse, count)
	for i := 0; i < count; i++ {
		if i%2 == 0 {
			subscriptions[i] = GetSubscription(constants.SubscriptionTypeBulk)
		} else {
			subscriptions[i] = GetSubscription(constants.SubscriptionTypeRecord)
		}
	}

	return subscriptions
}

func GetSearchTerm(valid bool) string {
	l := constants.CharacterThresholdForSearchingRecords
	if !valid {
		l--
	}

	var sb strings.Builder
	for i := 0; i < l; i++ {
		sb.WriteString("s")
	}

	return sb.String()
}