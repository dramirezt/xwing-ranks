'use strict';
angular.module('main', [
  'ionic',
  'ngCordova',
  'ui.router',
  'ngResource',
  'ionic-datepicker',
  'chart.js',
  'lr.upload',
  // TODO: load other modules selected during generation
])
.config(function ($stateProvider, $urlRouterProvider) {

  // ROUTING with ui.router
  $urlRouterProvider.otherwise('/xwingranks/');
  $stateProvider
    // this state is placed in the <ion-nav-view> in the index.html
    .state('main', {
      url: '/xwingranks',
      abstract: true,
      templateUrl: 'main/templates/menu.html',
      controller: 'MenuCtrl as menu'
    })
    .state('main.index', {
      url: '/',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/index.html',
        }
      }
    })

    .state('main.register', {
      url: '/register',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/users/register.html',
          controller: 'RegisterCtrl'
        }
      }
    })

    .state('main.userProfile', {
      url: '/profile',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/users/user-profile.html',
          controller: 'UserProfileCtrl'
        }
      }
    })

    // Tournament states
    .state('main.tournamentsList', {
      url: '/completedTournaments',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/completedTournaments/tournament-list.html',
          controller: 'TournamentListCtrl'
        }
      }
    })
    .state('main.tournamentDetails', {
      url: '/completedTournaments',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/completedTournaments/tournament-details.html',
          controller: 'TournamentDetailsCtrl'
        }
      }
    })
    .state('main.tournamentPlayerProfile', {
      url: '/completedTournaments',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/completedTournaments/tournament-player-profile.html',
          controller: 'TournamentPlayerProfileCtrl'
        }
      }
    })
    .state('main.tournamentInfo', {
      url: '/completedTournaments',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/completedTournaments/tournament-info.html',
          controller: 'TournamentInfoCtrl'
        }
      }
    })
    .state('main.tournamentPairings', {
      url: '/completedTournaments',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/completedTournaments/pairing-list.html',
          controller: 'PairingListCtrl'
        }
      }
    })
    .state('main.pairingDetails', {
      url: '/completedTournaments',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/completedTournaments/pairing-details.html',
          controller: 'PairingDetailsCtrl'
        }
      }
    })

    // Hangar states
    .state('main.hangar', {
      url: '/hangar',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/hangar/hangar.html',
          controller: 'HangarCtrl'
        }
      }
    })
    .state('main.hangarShip', {
      url: '/hangar',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/hangar/hangar-ship.html',
          controller: 'ShipDetailsCtrl'
        }
      }
    })
    .state('main.hangarPilot', {
      url: '/hangar',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/hangar/hangar-pilot.html',
          controller: 'ShipPilotCtrl'
          // controller: 'PilotDetailsCtrl'
        }
      }
    })

    // Arsenal states
    .state('main.arsenal', {
      url: '/arsenal',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/arsenal/arsenal.html',
          controller: 'ArsenalCtrl'
        }
      }
    })
    .state('main.arsenalDetails', {
      url: '/arsenal',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/arsenal/arsenal-details.html',
          controller: 'ArsenalDetailsCtrl'
        }
      }
    })

    // List Creator states

    .state('main.listcreator', {
      url: '/list',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/listcreator/list-creator.html',
          controller: 'ListCreatorCtrl'
        }
      }
    })

    ;
})

// .run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
//   $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
//     if (!AuthService.isAuthenticated()) {
//       console.log('NO AUTENTIFICADO INTENTANDO IR A: ' + next.name);
//       // if (next.name !== 'main.index' && next.name !== 'outside.register') {
//         // event.preventDefault();
//         // $state.go('outside.login');
//       // }
//     }
//   });
// });
;
