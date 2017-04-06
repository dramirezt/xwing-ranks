'use strict';
angular.module('main')

.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})

.constant('API_ENDPOINT', {
  url: 'http://ec2-54-171-152-168.eu-west-1.compute.amazonaws.com:3000/api'
  //  For a simulator use: url: 'http://127.0.0.1:8080/api'
})

.constant('baseURL', 'http://ec2-54-171-152-168.eu-west-1.compute.amazonaws.com:3000/api')

;