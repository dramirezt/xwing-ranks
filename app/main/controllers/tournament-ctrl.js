'use strict';
angular.module('main')

.controller('TournamentListCtrl', function ($scope, $ionicModal, $log, $state, $filter, $q, tournamentService, UserService, ionicDatePicker) {

  $scope.newTournament = { rounds: 3, top: 0, maxPlayers: 8, finished: 0 };

  $ionicModal.fromTemplateUrl('main/templates/modal-new-tournament.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $scope.createTournament = function (newTournament) {
    $scope.closeModal();
    $scope.showLoading();
    var user = UserService.currentUser();
    if (user) {
      newTournament.organizer = user._id;
      newTournament.visibleDate = undefined;
      tournamentService.createTournament(newTournament)
      .then(
        function (response) {
          $scope.newTournament = { rounds: 3, top: 0, maxPlayers: 8, finished: 0 };
          tournamentService.setCurrentTournament(response);
          $state.go('main.tournamentDetails');
          $scope.hideLoading();
        },
        function (error) {
          $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
        }
      );
    }
  };

  $scope.viewTournament = function (tournament) {
    $scope.showLoading();
    tournamentService.setCurrentTournament(tournament);
    $state.go('main.tournamentDetails');
  };

  $scope.createTestTournament = function () {
    $scope.newTournament.name = 'Carrera de Kessel';
    $scope.newTournament.place = 'Sistema Kessel';
    $scope.newTournament.top = 4;
    $scope.newTournament.rounds = 3;
    $scope.newTournament.maxPlayers = 8;
    $scope.newTournament.date = new Date('7/11/1977');
    // $scope.newTournament.name = 'Nacional España 2016 - Top 32'
    // $scope.newTournament.place = 'Madrid - Las Rozas';
    // $scope.newTournament.rounds = 0;
    // $scope.newTournament.top = 32;
    // $scope.newTournament.maxPlayers = 32;
    // $scope.newTournament.date = '2016-9-3';
    // $scope.newTournament.rounds = 4;
    // $scope.newTournament.maxPlayers = 16;
    $scope.createTournament($scope.newTournament);
  };

  var ipObj1 = {
    callback: function (val) {  //Mandatory
      // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
      var aux = new Date(val);
      var date = aux.getDate() + '-' + (aux.getMonth() + 1) + '-' + aux.getFullYear();
      $scope.newTournament.date = aux;
      $scope.newTournament.visibleDate = date;
    },
    from: new Date(2012, 1, 1), //Optional
    to: new Date(2019, 12, 31), //Optional
    inputDate: new Date(),      //Optional
    weeksList: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthsList: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    mondayFirst: true,          //Optional
    closeOnSelect: true,       //Optional
    dateFormat: 'dd/MM/yyyy',
    templateType: 'popup'       //Optional
  };

  $scope.openDatePicker = function () {
    ionicDatePicker.openDatePicker(ipObj1);
  };

})

.controller('TournamentInfoCtrl', function ($scope, $state, $ionicModal, tournamentService) {

  $scope.tournament = tournamentService.currentTournament();

  if (!$scope.tournament) {
    $state.go('main.tournamentDetails');
  } else {
    var aux = new Date($scope.tournament.date);
    var date = aux.getDate() + '-' + (aux.getMonth() + 1) + '-' + aux.getFullYear();
    $scope.tournament.visibleDate = date;
  }

  $scope.editTournament = angular.copy($scope.tournament);

  $ionicModal.fromTemplateUrl('main/templates/modal-edit-tournament.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modalEditTournament = modal;
  });

  $scope.openModalEditTournament = function () {
    $scope.modalEditTournament.show();
  };

  $scope.closeModalEditTournament = function () {
    $scope.modalEditTournament.hide();
  };

  $scope.updateTournament = function (tournament) {
    $scope.closeModalEditTournament();
    $scope.showLoading();
    tournamentService.updateTournament(tournament).then(
      function (response) {
        response.organizername = $scope.tournament.organizername;
        $scope.tournament = response;
        $scope.hideLoading();
      },
      function (error) {
        $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
      }
    );
  };

})

.controller('TournamentDetailsCtrl', function ($scope, $state, $ionicModal, $ionicPopover, $ionicHistory, $ionicPopup, $q, inscriptionService, pairingService, tournamentService, UserService, $filter, ionicDatePicker) {

  $scope.showLoading();

  $scope.currentUser = UserService.currentUser();
  $scope.tournament = tournamentService.currentTournament();

  var aux = new Date($scope.tournament.date);
  var date = aux.getDate() + '-' + (aux.getMonth() + 1) + '-' + aux.getFullYear();
  $scope.tournament.visibleDate = date;

  UserService.getUsername($scope.tournament.organizer)
  .then(
    function (response) {
      $scope.tournament.organizername = response;
    },
    function (error) {
      $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
      $state.go('main.tournamentsList');
    }
  );

  $scope.inscriptionList = [];
  inscriptionService.getInscriptions($scope.tournament)
  .then(
    function (response) {
      $scope.inscriptionList = response;
    },
    function (error) {
      $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
    }
  );

  $scope.pairingList = [];
  $scope.topPairingList = [];
  pairingService.getPairings($scope.tournament)
  .then(
    function (response) {
      $scope.pairingList = response;
      $scope.topPairingList = pairingService.pairingTopList();
      $scope.hideLoading();
    },
    function (error) {
      $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
    }
  );

  $ionicModal.fromTemplateUrl('main/templates/modal-new-inscription.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function () {
    $scope.modal.show();
  };
  $scope.closeModal = function () {
    $scope.modal.hide();
  };

  $ionicPopover.fromTemplateUrl('main/templates/popover-tournament-details.html', {
    scope: $scope
  }).then(function (popover) {
    $scope.popover = popover;
  });
  $scope.openPopover = function ($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function () {
    $scope.popover.hide();
  };

  var ipObj1 = {
    callback: function (val) {  //Mandatory
      // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
      var aux = new Date(val);
      var date = aux.getDate() + '-' + (aux.getMonth() + 1) + '-' + aux.getFullYear();
      $scope.tournament.date = aux;
      $scope.tournament.visibleDate = date;
    },
    from: new Date(2012, 1, 1), //Optional
    to: new Date(2019, 12, 31), //Optional
    inputDate: new Date(),      //Optional
    weeksList: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthsList: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    mondayFirst: true,          //Optional
    closeOnSelect: true,       //Optional
    dateFormat: 'dd/MM/yyyy',
    templateType: 'popup'       //Optional
  };

  $scope.openDatePicker = function () {
    ionicDatePicker.openDatePicker(ipObj1);
  };

  $scope.getUsername = function (userId) {
    UserService.getUsername(userId)
    .then(
      function (response) {
        $scope.tournament.organizer = response.data;
      },
      function (error) {
        $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
      }
    );
  };

  $scope.tournamentInfo = function () {
    $state.go('main.tournamentInfo');
  };

  $scope.showDeleteInscriptions = false;
  $scope.showDeleteButtons = function () {
    $scope.showDeleteInscriptions = !$scope.showDeleteInscriptions;
    $scope.popover.hide();
  };

  $scope.showDropPlayers = false;
  $scope.showDropButtons = function () {
    $scope.showDropPlayers = !$scope.showDropPlayers;
    $scope.popover.hide();
  };

  $scope.showConfirmDeleteTournament = function () {
    $scope.closePopover();
    var confirmPopup = $ionicPopup.confirm({
      title: 'Eliminar torneo',
      template: 'Esta acción no se puede deshacer. Se perderán todos los datos de este torneo. ¿Continuar?',
      cancelText: 'Cancelar',
      cancelType: 'button-assertive',
      okText: 'Confirmar',
      okType: 'button-balanced'
    });
    confirmPopup.then(function () {
      $scope.showLoading();
      pairingService.deletePairings($scope.tournament)
      .then(
        function () {
          $scope.pairingList = [];
          inscriptionService.deleteInscriptions($scope.tournament)
          .then(
            function () {
              $scope.inscriptionList = [];
              tournamentService.deleteTournament($scope.tournament).then(
                function (response) {
                  $scope.hideLoading();
                  if (response.status === 200) {
                    $ionicHistory.clearCache().then(function () {
                      $state.go('main.tournamentsList');
                    });
                  }
                },
                function (error) {
                  $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
                }
              );
            },
            function (error) {
              $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
            }
          );
        },
        function (error) {
          $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
        }
      );
    });
  };

  $scope.newInscription = {};
  $scope.createInscription = function (newInscription) {
    $scope.showLoading();
    newInscription.tournament = $scope.tournament._id;
    inscriptionService.createInscription(newInscription)
    .then(
      function () {
        $scope.newInscription = {};
        $scope.inscriptionList = inscriptionService.inscriptionList();
        $scope.modal.hide();
        $scope.hideLoading();
      },
      function (error) {
        $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
      }
    );
  };

  $scope.viewInscription = function (inscription) {
    inscriptionService.setCurrentInscription(inscription);
    $state.go('main.tournamentPlayerProfile');
  };

  $scope.joinTournament = function () {
    $scope.showLoading();
    if ($scope.currentUser._id === $scope.tournament.organizer) {
      $scope.closePopover();
    }
    var found = false;
    var i = 0;
    while (i < $scope.inscriptionList.length && !found) {
      found = ($scope.inscriptionList[i].player === $scope.currentUser._id);
      i++;
    }
    found = false;
    if (!found) {
      var inscription = { name: $scope.currentUser.username, player: $scope.currentUser._id };
      $scope.createInscription(inscription);
    } else {
      $scope.hideLoading();
      $ionicPopup.alert({
        title: 'Ha habido un problema',
        template: '¡Ya estás inscrito! Revisa la lista.',
        okText: 'Cerrar',
        okType: 'button-balanced'
      });
    }
  };

  $scope.drop = function (inscription) {
    inscription.drop = true;
    $scope.showLoading();
    tournamentService.updateInscription(inscription)
    .then(
      function () {
        $scope.hideLoading();
      },
      function (error) {
        $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
      }
    );
  };

  $scope.deleteInscription = function (inscription) {
    if ($scope.pairingList.length) {
      $scope.drop(inscription);
    } else {
      $scope.showLoading();
      inscriptionService.deteteInscription(inscription)
      .then(
        function (response) {
          $scope.message = response.message;
          $scope.hideLoading();
        },
        function (error) {
          $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
        }
      );
    }
  };

  $scope.viewPairings = function () {
    $state.go('main.tournamentPairings');
  };

  $scope.beginTestTournament = function () {
    // $scope.createInscription({ name: 'Pablo Pintor', victoryPoints: 6, strengthOfSchedule: 1152, swissPosition: 1, bracketPosition: 1 });
    // $scope.createInscription({ name: 'Antonio Veiga', victoryPoints: 6, strengthOfSchedule: 1026, swissPosition: 2, bracketPosition: 2 });
    // $scope.createInscription({ name: 'Iván Verdera', victoryPoints: 6, strengthOfSchedule: 982, swissPosition: 3, bracketPosition: 3 });
    // $scope.createInscription({ name: 'Ángel Hermana', victoryPoints: 5, strengthOfSchedule: 934, swissPosition: 4, bracketPosition: 4 });
    // $scope.createInscription({ name: 'Ekaitz Fraile', victoryPoints: 5, strengthOfSchedule: 924, swissPosition: 5, bracketPosition: 5 });
    // $scope.createInscription({ name: 'Alberto Nogales', victoryPoints: 5, strengthOfSchedule: 924, swissPosition: 6, bracketPosition: 6 });
    // $scope.createInscription({ name: 'Jorge Moya', victoryPoints: 5, strengthOfSchedule: 914, swissPosition: 7, bracketPosition: 7 });
    // $scope.createInscription({ name: 'Adrián Diego Benavente', victoryPoints: 5, strengthOfSchedule: 869, swissPosition: 8, bracketPosition: 8 });
    // $scope.createInscription({ name: 'Francisco López', victoryPoints: 5, strengthOfSchedule: 862, swissPosition: 9, bracketPosition: 9 });
    // $scope.createInscription({ name: 'Pablo Subias', victoryPoints: 5, strengthOfSchedule: 853, swissPosition: 10, bracketPosition: 10 });
    // $scope.createInscription({ name: 'Miguel Angel Díaz', victoryPoints: 5, strengthOfSchedule: 833, swissPosition: 11, bracketPosition: 11 });
    // $scope.createInscription({ name: 'Joaquín Ramos', victoryPoints: 5, strengthOfSchedule: 823, swissPosition: 12, bracketPosition: 12 });
    // $scope.createInscription({ name: 'Carlos Guerra', victoryPoints: 5, strengthOfSchedule: 822, swissPosition: 13, bracketPosition: 13 });
    // $scope.createInscription({ name: 'Andoni Abril', victoryPoints: 5, strengthOfSchedule: 812, swissPosition: 14, bracketPosition: 14 });
    // $scope.createInscription({ name: 'Antonio José González', victoryPoints: 5, strengthOfSchedule: 800, swissPosition: 15, bracketPosition: 15 });
    // $scope.createInscription({ name: 'Francisco José Morales', victoryPoints: 5, strengthOfSchedule: 774, swissPosition: 16, bracketPosition: 16 });
    // $scope.createInscription({ name: 'Borja Ortuño', victoryPoints: 5, strengthOfSchedule: 769, swissPosition: 17, bracketPosition: 17 });
    // $scope.createInscription({ name: 'Pablo Rodríguez', victoryPoints: 5, strengthOfSchedule: 756, swissPosition: 18, bracketPosition: 18 });
    // $scope.createInscription({ name: 'Rafael de Linares', victoryPoints: 5, strengthOfSchedule: 751, swissPosition: 19, bracketPosition: 19 });
    // $scope.createInscription({ name: 'Lisardo Montagud', victoryPoints: 5, strengthOfSchedule: 727, swissPosition: 20, bracketPosition: 20 });
    // $scope.createInscription({ name: 'Juan José Fernández', victoryPoints: 5, strengthOfSchedule: 724, swissPosition: 21, bracketPosition: 21 });
    // $scope.createInscription({ name: 'Alejandro Burillo', victoryPoints: 5, strengthOfSchedule: 681, swissPosition: 22, bracketPosition: 22 });
    // $scope.createInscription({ name: 'Ismael Roig', victoryPoints: 5, strengthOfSchedule: 665, swissPosition: 23, bracketPosition: 23 });
    // $scope.createInscription({ name: 'Imanol Acillona', victoryPoints: 4, strengthOfSchedule: 881, swissPosition: 24, bracketPosition: 24 });
    // $scope.createInscription({ name: 'Francisco Segura', victoryPoints: 4, strengthOfSchedule: 875, swissPosition: 25, bracketPosition: 25 });
    // $scope.createInscription({ name: 'Alberto Lozano', victoryPoints: 4, strengthOfSchedule: 854, swissPosition: 26, bracketPosition: 26 });
    // $scope.createInscription({ name: 'David Jesús de Jorge', victoryPoints: 4, strengthOfSchedule: 832, swissPosition: 27, bracketPosition: 27 });
    // $scope.createInscription({ name: 'Mario Núñez', victoryPoints: 4, strengthOfSchedule: 818, swissPosition: 28, bracketPosition: 28 });
    // $scope.createInscription({ name: 'Vicente Marco', victoryPoints: 4, strengthOfSchedule: 812, swissPosition: 29, bracketPosition: 29 });
    // $scope.createInscription({ name: 'Alvaro Alejandro Martínez', victoryPoints: 4, strengthOfSchedule: 800, swissPosition: 30, bracketPosition: 30 });
    // $scope.createInscription({ name: 'Jose Antonio Mellado', victoryPoints: 4, strengthOfSchedule: 795, swissPosition: 31, bracketPosition: 31 });
    // $scope.createInscription({ name: 'Óscar Baroja Peral', victoryPoints: 4, strengthOfSchedule: 795, swissPosition: 32, bracketPosition: 32 });
    $scope.createInscription({ name: 'Darth Vader' });
    $scope.createInscription({ name: 'Soontir Fel' });
    $scope.createInscription({ name: 'Wedge Antilles' });
    $scope.createInscription({ name: 'Han Solo' });
    $scope.createInscription({ name: 'Fenn Rau' });
    $scope.createInscription({ name: 'Luke Skywalker' });
    $scope.createInscription({ name: 'Boba Fett' });
    $scope.createInscription({ name: 'Dengar' });
    // $scope.createInscription({ name: 'Carnor Jax' });
    // $scope.createInscription({ name: 'Juno Eclipse' });
    // $scope.createInscription({ name: 'Zukkus' });
    // $scope.createInscription({ name: 'Bossk' });
    // $scope.createInscription({ name: 'Gran Inquisidor' });
    // $scope.createInscription({ name: 'Corran Horn' });
    // $scope.createInscription({ name: 'Hera Syndulla' });
    // $scope.createInscription({ name: 'Miranda Doni' });
    //$scope.beginTournament();
  };

})

.controller('TournamentPlayerProfileCtrl', function ($scope, $filter, $ionicModal, arsenalService, hangarService, inscriptionService, pairingService, tournamentService, listService) {

  $scope.showLoading();

  $scope.tournament = tournamentService.currentTournament();
  $scope.inscription = inscriptionService.currentInscription();
  $scope.inscriptionList = inscriptionService.inscriptionList();
  $scope.pairingList = $filter('filter')(pairingService.pairingList(), { $: $scope.inscription._id });
  $scope.hide = false;
  $scope.currentList = [];

  listService.getListByInscription($scope.inscription._id).then(
    function (response) {
      for (var i = 0; i < response.length; i++) {
        for (var j = 0; j < response[i].ships.length; j++) {
          var aux = { };
          aux.pilot = $filter('filter')($scope.pilotList, { _id: response[i].ships[j].pilot })[0];
          aux.ship = $filter('filter')($scope.shipList, { _id: aux.pilot.ship })[0];
          aux.upgrades = [];
          for (var k = 0; k < response[i].ships[j].upgrades.length; k++) {
            aux.upgrades.push($filter('filter')($scope.upgradeList, { _id: response[i].ships[j].upgrades[k].upgrade })[0]);
          }
          $scope.currentList.push(aux);
        }
      }
      $scope.hideLoading();
    },
    function (error) {
      $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
    }
  );

  $scope.switchHide = function () {
    $scope.hide = !$scope.hide;
  }

  $scope.getInscriptionName = function (playerId) {
    return $filter('filter')($scope.inscriptionList, { _id: playerId })[0].name;
  };
})
;
