'use strict';
angular.module('main', [
  'ionic',
  'ngCordova',
  'ui.router',
  'ngResource',
  'ionic-datepicker',
  'chart.js',
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
          templateUrl: 'main/templates/register.html',
          controller: 'RegisterCtrl'
        }
      }
    })

    // Tournament states
    .state('main.tournamentsList', {
      url: '/tournaments',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/tournament-list.html',
          controller: 'TournamentListCtrl'
        }
      }
    })
    .state('main.tournamentDetails', {
      url: '/tournaments',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/tournament-details.html',
          controller: 'TournamentDetailsCtrl'
        }
      }
    })
    .state('main.tournamentPlayerProfile', {
      url: '/tournaments',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/tournament-player-profile.html',
          controller: 'TournamentPlayerProfileCtrl'
        }
      }
    })
    .state('main.tournamentInfo', {
      url: '/tournaments',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/tournament-info.html',
          controller: 'TournamentInfoCtrl'
        }
      }
    })
    .state('main.tournamentPairings', {
      url: '/tournaments',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/pairing-list.html',
          controller: 'PairingListCtrl'
        }
      }
    })
    .state('main.pairingDetails', {
      url: '/tournaments',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/pairing-details.html',
          controller: 'PairingDetailsCtrl'
        }
      }
    })

    // Hangar states
    .state('main.hangar', {
      url: '/hangar',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/hangar.html',
          controller: 'HangarCtrl'
        }
      }
    })
    .state('main.hangarShip', {
      url: '/hangar',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/hangar-ship.html',
          controller: 'ShipDetailsCtrl'
        }
      }
    })
    .state('main.hangarPilot', {
      url: '/hangar',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/hangar-pilot.html',
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
          templateUrl: 'main/templates/arsenal.html',
          controller: 'ArsenalCtrl'
        }
      }
    })
    .state('main.arsenalDetails', {
      url: '/arsenal',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/arsenal-details.html',
          controller: 'ArsenalDetailsCtrl'
        }
      }
    })

    // List Creator states

    .state('main.listcreator', {
      url: '/list',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/list-creator.html',
          controller: 'ListCreatorCtrl'
        }
      }
    })


    .state('main.debug', {
      url: '/debug',
      views: {
        'pageContent': {
          templateUrl: 'main/templates/debug.html',
          controller: 'DebugCtrl'
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
