// Code generated by mockery v2.11.0. DO NOT EDIT.

// Regenerate this file using `make store-mocks`.

package mocks

import (
	mock "github.com/stretchr/testify/mock"

	serializer "github.com/mattermost/mattermost-plugin-servicenow/server/serializer"

	testing "testing"
)

// Store is an autogenerated mock type for the Store type
type Store struct {
	mock.Mock
}

// DeleteUser provides a mock function with given fields: mattermostUserID
func (_m *Store) DeleteUser(mattermostUserID string) error {
	ret := _m.Called(mattermostUserID)

	var r0 error
	if rf, ok := ret.Get(0).(func(string) error); ok {
		r0 = rf(mattermostUserID)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// DeleteUserTokenOnEncryptionSecretChange provides a mock function with given fields:
func (_m *Store) DeleteUserTokenOnEncryptionSecretChange() {
	_m.Called()
}

// GetAllUsers provides a mock function with given fields:
func (_m *Store) GetAllUsers() ([]*serializer.IncidentCaller, error) {
	ret := _m.Called()

	var r0 []*serializer.IncidentCaller
	if rf, ok := ret.Get(0).(func() []*serializer.IncidentCaller); ok {
		r0 = rf()
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*serializer.IncidentCaller)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func() error); ok {
		r1 = rf()
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// LoadUser provides a mock function with given fields: mattermostUserID
func (_m *Store) LoadUser(mattermostUserID string) (*serializer.User, error) {
	ret := _m.Called(mattermostUserID)

	var r0 *serializer.User
	if rf, ok := ret.Get(0).(func(string) *serializer.User); ok {
		r0 = rf(mattermostUserID)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*serializer.User)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(string) error); ok {
		r1 = rf(mattermostUserID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// StoreOAuth2State provides a mock function with given fields: state
func (_m *Store) StoreOAuth2State(state string) error {
	ret := _m.Called(state)

	var r0 error
	if rf, ok := ret.Get(0).(func(string) error); ok {
		r0 = rf(state)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// StoreUser provides a mock function with given fields: user
func (_m *Store) StoreUser(user *serializer.User) error {
	ret := _m.Called(user)

	var r0 error
	if rf, ok := ret.Get(0).(func(*serializer.User) error); ok {
		r0 = rf(user)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// VerifyOAuth2State provides a mock function with given fields: state
func (_m *Store) VerifyOAuth2State(state string) error {
	ret := _m.Called(state)

	var r0 error
	if rf, ok := ret.Get(0).(func(string) error); ok {
		r0 = rf(state)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// NewStore creates a new instance of Store. It also registers a cleanup function to assert the mocks expectations.
func NewStore(t testing.TB) *Store {
	mock := &Store{}

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
