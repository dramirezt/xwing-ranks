'use strict';
angular.module('main')

.controller('TournamentListCtrl', function ($scope, $timeout, $ionicModal, $log, $state, $filter, $q, tournamentService, UserService, ionicDatePicker, inscriptionService, listService) {

  $scope.newTournament = { rounds: 3, top: 0, maxPlayers: 8, finished: 0 };

  $scope.view = 'finished';
  $scope.topMessage = '';

    $scope.start = 0;

    $scope.loadMore = function(start) {
        $scope.showLoading();
        if($scope.view === 'finished') {
            tournamentService.getFinishedTournamentNumber().then(
                function (response) {
                    $scope.nTournaments = response;
                }
            );
            tournamentService.getTournaments(start).then(
                function (response) {
                    if(response.length > 0) {
                        if(start === 0) $scope.tournamentList = response;
                        else $scope.tournamentList = $scope.tournamentList.concat(response);
                        $scope.start += response.length;
                    } else {
                        $scope.topMessage = 'No hay eventos que mostrar.';
                        $scope.tournamentList = [];
                    }
                    $scope.hideLoading();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                },
                function (error) {
                    $scope.hideLoading();
                    $scope.error = "Error: " + error.status + " " + error.statusText;
                }
            );
        } else if ($scope.view === 'following') {
            tournamentService.getFollowingTournamentNumber().then(
                function (response) {
                    $scope.nTournaments = response;
                }
            );
            tournamentService.getFollowingTournaments($scope.start).then(
                function (response) {
                    if(response.length > 0) {
                        if(start === 0) $scope.tournamentList = response;
                        else $scope.tournamentList = $scope.tournamentList.concat(response);
                        $scope.start += response.length;
                    } else {
                        $scope.topMessage = 'No hay eventos que mostrar.';
                        $scope.tournamentList = [];
                    }
                    $scope.hideLoading();
                    $scope.$broadcast('scroll.infiniteScrollComplete');

                },
                function (error) {
                    $scope.hideLoading();
                    $scope.error = "Error: " + error.status + " " + error.statusText;
                }
            );
        }
    };

    $scope.loadMore(0);

    $scope.finishedBtnClass = 'balanced';
    $scope.followingBtnClass = 'positive';

    $scope.viewFinished = function () {
        $scope.finishedBtnClass = 'balanced';
        $scope.followingBtnClass = 'positive';
        $scope.view = 'finished';
        $scope.start = 0;
        $scope.tournamentList = [];
        $scope.loadMore(0);
    };

    $scope.viewFollowing = function () {
        $scope.finishedBtnClass = 'positive';
        $scope.followingBtnClass = 'balanced';
        $scope.view = 'following';
        $scope.start = 0;
        $scope.tournamentList = [];
        $scope.loadMore(0);
    }

    $scope.followingTournamentList = [];

    $scope.nTournaments = 10;

    $scope.MyFiles={};

    $scope.handler = function(e,files){
        $scope.closeImportModal();
        $scope.showLoading();
        var reader = new FileReader();
        reader.onload = function(e){
            var string=reader.result;
            var obj = { data: string };
            //var obj = JSON.parse(string);
            // var obj=$filter('csvToObj')(string);
            //do what you want with obj !
            tournamentService.importTournament(obj).then(
                function (response) {
                    var obj = JSON.parse(response[0]);
                    var newTournament = { rounds: 3, top: 0, maxPlayers: 8, finished: 0 };
                        newTournament.name = obj.name;
                        newTournament.tier = obj.type;
                        newTournament.startDate = obj.date;
                    var user = UserService.currentUser();
                    if (user) {
                        newTournament.organizer = user._id;
                        tournamentService.createTournament(newTournament)
                        .then(
                            function (response) {
                                var tournament = response;
                                var inscriptions = obj.inscriptions;
                                var promises = [];
                                for (var i = 0; i < inscriptions.length; i++){
                                    var newInscription = inscriptions[i];
                                    newInscription.tournament = tournament._id;
                                    promises.push(inscriptionService.createInscription(newInscription));
                                }
                                $q.all(promises).then(
                                    function (response){
                                      var promises2 = [];
                                      for (var j = 0; j < response.length; j++) {
                                          promises2.push(listService.useInTournament(inscriptions[j].ships, response[j], false));
                                      }
                                      $q.all(promises2).then(
                                          function (response) {
                                              tournament.maxPlayers = response.length;
                                              tournament.finished = true;
                                              tournamentService.updateTournament(tournament).then(
                                                  function (response) {
                                                      tournamentService.setCurrentTournament(response);
                                                      $scope.hideLoading();
                                                      $state.go('main.tournamentDetails');
                                                  },
                                                  function (error) {
                                                      $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
                                                  }
                                              );
                                          },
                                          function (error) {
                                              $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
                                          }
                                      )
                                    }
                                );
                            },
                            function (error) {
                                $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
                            }
                        );
                    }
                },
                function (error) {
                    $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
                }
            );
        //
        };
         reader.readAsText(files[0]);
        // $scope.hideLoading();
    }

  $ionicModal.fromTemplateUrl('main/templates/tournaments/modal-new-tournament.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
  });
  $scope.showModal = function () {
    $scope.modal.show();
  };
  $scope.closeModal = function () {
    $scope.modal.hide();
  };

    $ionicModal.fromTemplateUrl('main/templates/tournaments/modal-import-tournament.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modalImport = modal;
    });
    $scope.showImportModal = function () {
        $scope.modalImport.show();
    };
    $scope.closeImportModal = function () {
        $scope.modalImport.hide();
    };

  $scope.createTournament = function (newTournament) {
    $scope.closeModal();
    $scope.showLoading();
    var user = UserService.currentUser();
    if (user) {
      newTournament.organizer = user._id;
      newTournament.visibleStartDate = undefined;
      newTournament.visibleEndDate = undefined;
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

  // $scope.createTestTournament = function () {
  //   $scope.newTournament.name = 'Carrera de Kessel';
  //   $scope.newTournament.tier = 'Casual';
  //   $scope.newTournament.city = 'Sistema Kessel';
  //   $scope.newTournament.address = 'C/ Falsa 312';
  //   $scope.newTournament.top = 4;
  //   $scope.newTournament.rounds = 3;
  //   $scope.newTournament.maxPlayers = 8;
  //   $scope.newTournament.startDate = new Date('7/11/1977');
  //   // $scope.newTournament.name = 'Nacional España 2016 - Top 32'
  //   // $scope.newTournament.place = 'Madrid - Las Rozas';
  //   // $scope.newTournament.rounds = 0;
  //   // $scope.newTournament.top = 32;
  //   // $scope.newTournament.maxPlayers = 32;
  //   // $scope.newTournament.date = '2016-9-3';
  //   // $scope.newTournament.rounds = 4;
  //   // $scope.newTournament.maxPlayers = 16;
  //   $scope.createTournament($scope.newTournament);
  // };

  var ipObj1 = {
    callback: function (val) {  //Mandatory
      // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
      var aux = new Date(val);
      var date = aux.getDate() + '-' + (aux.getMonth() + 1) + '-' + aux.getFullYear();
      $scope.newTournament.startDate = aux;
      $scope.newTournament.visibleStartDate = date;
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

  var ipObj2 = {
    callback: function (val) {  //Mandatory
      // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
      var aux = new Date(val);
      var date = aux.getDate() + '-' + (aux.getMonth() + 1) + '-' + aux.getFullYear();
      $scope.newTournament.endDate = aux;
      $scope.newTournament.visibleEndDate = date;
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

  $scope.openDatePicker2 = function () {
    ionicDatePicker.openDatePicker(ipObj2);
  };

  $scope.orderBy = function (val) {
      switch (val) {
          case 'recent':
              $scope.tournamentList = $filter('orderBy')($scope.tournamentList, ['-startDate']);
              break;
          case 'old':
              $scope.tournamentList = $filter('orderBy')($scope.tournamentList, ['startDate']);
              break;
          default:
              break;
      }
      console.log(val);
  };

    $scope.setFactions = function () {
        var promises = [];
        listService.getLists().then(
            function (response) {
                console.log(response.length);
                var lists = response;
                var promises = [];
                for (var i = 0; i < lists.length; i++) {
                    if(lists[i].ships) {
                        var pilot = ($filter('filter')($scope.pilotList, { name: lists[i].ships[0].pilot }));
                        if(pilot.length != 1) {
                            pilot = ($filter('filter')($scope.pilotList, { name: lists[i].ships[1].pilot }));
                        }
                        var faction = pilot[0].faction;
                        if(faction === 'Resistance') faction = 'Rebel Alliance';
                        if(faction === 'First Order') faction = 'Galactic Empire';
                        lists[i].faction = faction;
                        promises.push(listService.updateList(lists[i]));
                    }
                }
                $q.all(promises).then(
                    function (response) {
                        var lists = response;
                        var promises2 = [];
                        for (var i = 0; i < lists.length; i++) {
                            console.log({ _id: lists[i].inscription, faction: lists[i].faction });
                            promises2.push(inscriptionService.updateInscriptionFaction({ _id: lists[i].inscription, faction: lists[i].faction }));
                        }
                        $q.all(promises2).then(
                            function (response) {
                                console.log('everything should be ok');
                            }
                        )
                    }
                )
            }
        )
    }

    // $timeout($scope.setFactions(), 30000);

})

.controller('TournamentInfoCtrl', function ($scope, $state, $ionicModal, ionicDatePicker, tournamentService) {

  $scope.tournament = tournamentService.currentTournament();

  if (!$scope.tournament) {
    $state.go('main.tournamentDetails');
  } else {
    var aux = new Date($scope.tournament.date);
    var date = aux.getDate() + '-' + (aux.getMonth() + 1) + '-' + aux.getFullYear();
    $scope.tournament.visibleDate = date;
  }

  $scope.editTournament = angular.copy($scope.tournament);

  $ionicModal.fromTemplateUrl('main/templates/tournaments/modal-edit-tournament.html', {
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

  var ipObj1 = {
    callback: function (val) {  //Mandatory
      // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
      var aux = new Date(val);
      var date = aux.getDate() + '-' + (aux.getMonth() + 1) + '-' + aux.getFullYear();
      $scope.editTournament.date = aux;
      $scope.editTournament.visibleDate = date;
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

.filter("emptyToEnd", function () {
        return function (array, key) {
            if(!angular.isArray(array)) return;
            var present = array.filter(function (item) {
                return item[key];
            });
            var empty = array.filter(function (item) {
                return !item[key]
            });
            return present.concat(empty);
        };
    })

.controller('TournamentDetailsCtrl', function ($scope, $state, $ionicModal, $ionicPopover, $ionicHistory, $ionicPopup, $q, inscriptionService, pairingService, tournamentService, UserService, $filter, ionicDatePicker) {

  $scope.showLoading();

  $scope.show = 'info';
  $scope.infoBtnClass = 'balanced';
  $scope.statsBtnClass = 'positive';
  $scope.rankingBtnClass = 'positive';

  $scope.showView = function (list) {
      $scope.showLoading();
      switch (list){
          case 'info':
              $scope.infoBtnClass = 'balanced';
              $scope.statsBtnClass = 'positive';
              $scope.rankingBtnClass = 'positive';
              break;
          case 'stats':
              $scope.infoBtnClass = 'positive';
              $scope.statsBtnClass = 'balanced';
              $scope.rankingBtnClass = 'positive';
              break;
          case 'ranking':
              $scope.infoBtnClass = 'positive';
              $scope.statsBtnClass = 'positive';
              $scope.rankingBtnClass = 'balanced';
              break;

      }
      $scope.show = list;
      $scope.hideLoading();
  };

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
      // $state.go('main.tournamentsList');
    }
  );

  $scope.factionLabels = ["Alianza Rebelde", "Imperio Galáctico", "Escoria y Villanos"];
  $scope.factionColors = ['#ffa2a2', '#adf1fe', '#b1ffb1'];
  $scope.factionOptions = { legend: { display: false } };
  $scope.factionData = [0, 0, 0];

    $scope.pilotsLabels = [];
    $scope.pilotsData = [];
    $scope.totalPilots = 0;

    tournamentService.getPilotUse($scope.tournament).then(
        function (response) {
            for (var i = 0; i < response.length; i++) {
                $scope.pilotsLabels.push(response[i].source);
                $scope.pilotsData.push(response[i].Percent);
            }
            $scope.totalPilots = response[0].Total;
        }
    );


    $scope.shipsLabels = [];
    $scope.shipsData = [];
    $scope.totalShips = 0;

    tournamentService.getShipUse($scope.tournament).then(
        function (response) {
            for (var i = 0; i < response.length; i++) {
                $scope.shipsLabels.push(response[i].source);
                $scope.shipsData.push(response[i].Percent);
            }
            $scope.totalShips = response[0].Total;
        }
    );

    $scope.shipOptions = {scales: {
        xAxes: [{
            display: true,
            ticks: {
                suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
                // OR //
                beginAtZero: true   // minimum value will be 0.
            }
        }]}};

  $scope.inscriptionList = [];
  inscriptionService.getInscriptions($scope.tournament)
  .then(
    function (response) {
        $scope.inscriptionList = response;
        $scope.factionData = [
            $filter('filter')($scope.inscriptionList, { faction: 'Rebel Alliance' }).length/$scope.inscriptionList.length,
            $filter('filter')($scope.inscriptionList, { faction: 'Galactic Empire' }).length/$scope.inscriptionList.length,
            $filter('filter')($scope.inscriptionList, { faction: 'Scum and Villainy' }).length/$scope.inscriptionList.length
        ]
        $scope.showInscriptionButton = function () {
            var i = 0;
            var show = false;
            if(!$scope.tournament.finished) {
                while (!show && i < $scope.inscriptionList.length) {
                    show = ($scope.inscriptionList[i].player === $scope.currentUser._id);
                    if(show) $scope.myCurrentInscription = $scope.inscriptionList[i];
                    i++;
                }
            }
            return show;
        };
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

  $ionicModal.fromTemplateUrl('main/templates/tournaments/modal-new-inscription.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function () {
      $scope.closePopover();
      var body = angular.element(document.getElementsByTagName('body'));
      body.removeClass('popover-open');
      $scope.modal.show();
  };
  $scope.closeModal = function () {
    $scope.modal.hide();
  };

  $ionicPopover.fromTemplateUrl('main/templates/tournaments/popover-tournament-details.html', {
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
                        $scope.nTournaments--;
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
    $scope.closeModal();
    $scope.showLoading();
    newInscription.tournament = $scope.tournament._id;
    inscriptionService.createInscription(newInscription)
    .then(
      function (response) {
        $scope.newInscription = {};
        $scope.inscriptionList = inscriptionService.inscriptionList();
        if (response.player === $scope.currentUser._id) {
          $scope.updateMyInscriptions(response);
          $scope.updateMyInscriptionList($scope.tournament);
        }
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
    $scope.createInscription({ name: 'Darth Vader' });
    $scope.createInscription({ name: 'Soontir Fel' });
    $scope.createInscription({ name: 'Wedge Antilles' });
    $scope.createInscription({ name: 'Han Solo' });
    $scope.createInscription({ name: 'Fenn Rau' });
    $scope.createInscription({ name: 'Luke Skywalker' });
    $scope.createInscription({ name: 'Boba Fett' });
    $scope.createInscription({ name: 'Dengar' });
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
  $scope.tmpCurrentList = {};

  listService.getListByInscription(inscriptionService.currentInscription()._id).then(
    function (response) {
      $scope.tmpCurrentList = response[0];
      for (var i = 0; i < response.length; i++) {
        for (var j = 0; j < response[i].ships.length; j++) {
          var aux = { };
          aux.pilot = $filter('filter')($scope.pilotList, { 'name': response[i].ships[j].pilot });
          if(aux.pilot.length > 1) {
              console.log(aux.pilot);
              aux.pilot = $filter('filter')(aux.pilot, { 'faction': $scope.inscription.faction });
              console.log(aux.pilot);
          }
          aux.pilot = aux.pilot[0];
          aux.ship = $filter('filter')($scope.shipList, { 'name': aux.pilot.ship })[0];
          aux.upgrades = [];
          for (var k = 0; k < response[i].ships[j].upgrades.length; k++) {
            // aux.upgrades.push($filter('filter')($scope.upgradeList, { _id: response[i].ships[j].upgrades[k].upgrade })[0]);
              aux.upgrades.push($filter('filter')($scope.upgradeList, { 'name': response[i].ships[j].upgrades[k].name })[0]);
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

.directive('fileChange',['$parse', function($parse){
    return{
        require:'ngModel',
        restrict:'A',
        link:function($scope,element,attrs,ngModel){
            var attrHandler=$parse(attrs['fileChange']);
            var handler=function(e){
                $scope.$apply(function(){
                    attrHandler($scope,{$event:e,files:e.target.files});
                });
            };
            element[0].addEventListener('change',handler,false);
        }
    }
}]);
