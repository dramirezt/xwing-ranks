'use strict';
angular.module('main')

.controller('PairingListCtrl', function ($scope, $ionicModal,  $ionicPopover, $ionicPopup, $ionicHistory, $state, $q, $filter, inscriptionService, pairingService, tournamentService) {

  $scope.showLoading();

  $scope.navRound = 1;
  $scope.tournament = tournamentService.currentTournament();
  $scope.inscriptionList = inscriptionService.inscriptionList();
  $scope.pairingList = [];
  $scope.topPairingList = [];

  if ($scope.tournament && $scope.inscriptionList) {
    $scope.pairingList = pairingService.pairingList();
    $scope.topPairingList = pairingService.pairingTopList();
    if (!$scope.pairingList.length) {
      $scope.cRound = 0;
      beginTournament();
    } else {
      $scope.cRound = $scope.pairingList[$scope.pairingList.length - 1].round;
      $scope.navRound = $scope.cRound;
    }
    $scope.navRoundTag = getNavRoundTag();
    $scope.hideLoading();
  } else {
    $ionicHistory.clearCache().then(
      function () {
        $state.go('main.tournamentsList');
      }
    );
  }

  $ionicModal.fromTemplateUrl('main/templates/modal-edit-pairing.html', {
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

  $ionicPopover.fromTemplateUrl('main/templates/popover-pairing-list.html', {
    scope: $scope
  }).then(function (popover) {
    $scope.popover = popover;
    $scope.hideLoading();
  });
  $scope.openPopover = function ($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function () {
    $scope.popover.hide();
  };

  function beginTournament () {
    if ($scope.tournament.rounds) {
      var tmp = $scope.inscriptionList;
      tmp = shuffleInscriptions(tmp);
      $scope.inscriptionList = tmp;
      createRound();
    } else {
      beginTop();
    }
  }

  function switchInscriptions (array, index1, index2) {
    var t = array[index1];
    array[index1] = array[index2];
    array[index2] = t;
    return array;
  }

  function shuffleInscriptions (array) {
    var n;
    if (array) {
      n = array.length;
    } else {
      n = $scope.inscriptionList.length;
      array = $scope.inscriptionList;
    }
    var i;
    while (n) {
      i = Math.floor(Math.random() * n--);
      var t = array[n];
      array[n] = array[i];
      array[i] = t;
    }
    return array;
  }

  function repeatedPairing (pairing) {
    var i = 0, n = $scope.pairingList.length, found = false, p1, p2;
    while (i < n && !found) {
      p1 = $scope.pairingList[i].player1;
      p2 = $scope.pairingList[i].player2;
      if ((p1 === pairing.player1 && p2 === pairing.player2) || (p1 === pairing.player2 && p2 === pairing.player1) || (p1 === p2)) {
        found = true;
      }
      i++;
    }
    return found;
  }

  $scope.switchPlayers = function (player1, player2) {
    $scope.closeModal();
    $scope.showLoading();
    var i = 0;
    var promises = [];
    if ($scope.navRound <= $scope.tournament.rounds) {
      while (i < $scope.pairingList.length) {
        if ($scope.pairingList[i].round === $scope.navRound) {
          if ($scope.pairingList[i].player1 === player1) {
            $scope.pairingList[i].player1 = player2;
            promises.push(pairingService.updatePairing($scope.pairingList[i]));
          } else if ($scope.pairingList[i].player1 === player2) {
            $scope.pairingList[i].player1 = player1;
            promises.push(pairingService.updatePairing($scope.pairingList[i]));
          }
          if ($scope.pairingList[i].player2 === player1) {
            $scope.pairingList[i].player2 = player2;
            promises.push(pairingService.updatePairing($scope.pairingList[i]));
          } else if ($scope.pairingList[i].player2 === player2) {
            $scope.pairingList[i].player2 = player1;
            promises.push(pairingService.updatePairing($scope.pairingList[i]));
          }
        }
        i++;
      }
    } else {
      while (i < $scope.topPairingList.length) {
        if ($scope.topPairingList[i].round === $scope.navRound) {
          if ($scope.topPairingList[i].player1 === player1) {
            $scope.topPairingList[i].player1 = player2;
            promises.push(pairingService.updatePairing($scope.topPairingList[i]));
          } else if ($scope.topPairingList[i].player1 === player2) {
            $scope.topPairingList[i].player1 = player1;
            promises.push(pairingService.updatePairing($scope.topPairingList[i]));
          } else if ($scope.topPairingList[i].player2 === player1) {
            $scope.topPairingList[i].player2 = player2;
            promises.push(pairingService.updatePairing($scope.topPairingList[i]));
          } else if ($scope.topPairingList[i].player2 === player2) {
            $scope.topPairingList[i].player2 = player1;
            promises.push(pairingService.updatePairing($scope.topPairingList[i]));
          }
        }
        i++;
      }
    }
    $q.all(promises).then(
      function () {
        $scope.hideLoading();
      },
      function (error) {
        $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
      }
    );
  };

  $scope.pairingDetails = function (pairing) {
    if(!pairing.isBye) {
      $scope.showLoading();
      var index;
      if ($scope.navRound <= $scope.tournament.rounds) {
        index = $scope.pairingList.indexOf(pairing);
        pairingService.setCurrentPairing($scope.pairingList[index]);
        $state.go('main.pairingDetails', { roundNumber: pairing.round, pairingId: index });
      } else {
        index = $scope.topPairingList.indexOf(pairing);
        pairingService.setCurrentPairing($scope.pairingTopList[index]);
        $state.go('main.pairingDetails', { roundNumber: pairing.round, pairingId: index });
      }
    }
  };

  $scope.deletePairing = function (pairing, index) {
    $scope.showLoading();
    pairingService.deletePairing(pairing)
    .then(
      function () {
        $scope.pairingList.splice(index, 1);
        $scope.hideLoading();
      },
      function (error) {
        $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
      }
    );
  };

  function getNavRoundTag () {
    if ($scope.tournament && !$scope.tournament.rounds && $scope.navRound > $scope.tournament.rounds) {
      if (!$scope.tournament.rounds) {
        var n = $scope.tournament.top;
        var c = $scope.navRound - $scope.tournament.rounds;
        while (c) {
          n = n / 2;
          c--;
        }
        return 'TOP ' + n * 2;
      } else {
        return 'TOP ' + Math.floor($scope.tournament.top / ($scope.navRound - $scope.tournament.rounds));
      }
    } else {
      return 'RONDA ' + $scope.navRound;
    }
  }

  $scope.previousNavRound = function () {
    $scope.showLoading();
    $scope.navRound--;
    $scope.navRoundTag = getNavRoundTag();
    $scope.hideLoading();
  };

  $scope.nextNavRound = function () {
    $scope.showLoading();
    $scope.navRound++;
    $scope.navRoundTag = getNavRoundTag();
    $scope.hideLoading();
  };

  function beginTop () {
    $scope.showLoading();
    $scope.inscriptionList = $filter('orderBy')($scope.inscriptionList, ['drop', 'bracketPosition', '-topPosition', 'swissPosition']);
    var n = $scope.tournament.top;
    var c = $scope.navRound - $scope.tournament.rounds;
    while (c) {
      n = n / 2;
      c--;
    }
    var r = $scope.cRound + 1;
    var promises = [];

    // var inscriptions = $filter('orderBy')($scope.inscriptionList, ['drop', 'swissPosition']);

    // TODO: PROBAR CON ESTE ORDEN DE INSCRIPCIÓN, HAY QUE TENER EN CUENTA LOS GANADORES EN CADA RONDA
    // var inscriptions = $scope.inscriptionList;

    for (var i = 0; i < n / 2; i++) {
      var pairing = { player1: '', player2: '', tournament: $scope.tournament._id, round: r };
      pairing.table = i + 1;
      pairing.player1 = $scope.inscriptionList[i]._id;

      // Comprueba si, siendo la ultima plaza del top, hay jugadores empatados. Si los hay, los recorre y se tira una moneda para decidir quien se queda. Se puede mejorar haciendo un aleatorio entre todos en lugar de tirar una moneda.
      var currentP2 = $scope.inscriptionList[n - i - 1]._id;
      // console.log('CREANDO PAIRING DE ' + i + ' + ' + (n - i -1));
      // console.log($scope.getInscriptionName($scope.inscriptionList[i]._id) + ' vs ' + $scope.getInscriptionName($scope.inscriptionList[n - i -1]._id));
      // var done = false;
      // while (i + 1 === n / 2 && !done) {
      //   var possibleP2 = inscriptions[n - i];
      //   if (currentP2.victoryPoints === possibleP2.victoryPoints && currentP2.strengthOfSchedule === possibleP2.strengthOfSchedule) {
      //     if (Math.random() >= 0.5) {
      //       currentP2 = possibleP2;
      //     }
      //   } else {
      //     done = true;
      //   }
      //   i++;
      // }
      pairing.player2 = currentP2;
      promises.push(pairingService.createPairing(pairing));
    }
    $q.all(promises).then(
      function (response) {
        for (var i = 0; i < promises.length; i++) {
          $scope.topPairingList.push(response[i]);
        }
        $scope.navRound++;
        $scope.cRound++;
        $scope.hideLoading();
      },
      function (error) {
        $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
      }
    );
  }

  $scope.showFinishRound = function () {
    return $scope.navRound === $scope.cRound;
  };

  $scope.showNextRound = function () {
    return $scope.navRound < $scope.cRound;
  };

  $scope.checkPairingsAndUpdateInscriptions = function () {
    $scope.showLoading();
    var notCompleted = false;
    var i = 0;
    if ($scope.cRound <= $scope.tournament.rounds) {
      var j = Math.ceil($scope.cRound * ($scope.inscriptionList.length / 2));
      while (i < $scope.inscriptionList.length && !notCompleted) {
        var aux = j + i;
        if (aux < $scope.pairingList.length) {
          notCompleted = !$scope.pairingList[aux].winner;
        }
        i++;
      }
    } else {
      while (i < $scope.topPairingList.length && !notCompleted) {
        notCompleted = !($scope.topPairingList[i].winner);
        i++;
      }
    }
    // Si hay algún emparejamiento sin ganador, se muestra la alerta.
    if (notCompleted) {
      $ionicPopup.alert({
        title: 'Ronda no terminada',
        template: 'Aún faltan enfrentamientos por jugar, o bien no se han introducido los resultados. ¡Revisa los empates!',
        okText: 'Volver',
        okType: 'button-balanced'
      });
    } else {
      if ($scope.cRound < $scope.tournament.rounds) {
        // Seguimos en suizo
        nextRound();
        createRound();
      } else {
        if ($scope.tournament.top > 0 && $scope.cRound < ($scope.tournament.rounds + Math.log2($scope.tournament.top))) {
          // Comienza el top
          if (!$scope.topPairingList.length) {
            var promises = [];
            $scope.inscriptionList = $filter('orderBy')($scope.inscriptionList, ['drop', '-victoryPoints', '-strengthOfSchedule']);
            for (i = 0; i < $scope.inscriptionList.length; i++) {
              $scope.inscriptionList[i].swissPosition = i + 1;
              $scope.inscriptionList[i].bracketPosition = i + 1;
              promises.push(inscriptionService.updateInscription($scope.inscriptionList[i]));
            }
            $q.all(promises).then(
              beginTop()
            );
          } else {
            beginTop();
          }
        } else {
          // Todas las rondas terminadas (no hay top)
          $scope.tournament.finished = true;
          tournamentService.updateTournament($scope.tournament).then(
            function (response) {
              $scope.tournament = response;
              $scope.hideLoading();
              $scope.showTournamentFinishedPopup();
            },
            function (error) {
              $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
            }
          );
        }
      }
    }
  };

  $scope.showTournamentFinishedPopup = function () {
    var alertPopup = $ionicPopup.alert({
      title: 'Torneo terminado',
      template: 'Vuelve a la página del torneo para ver los resultados',
      okText: 'Ok',
      okType: 'button-balanced'
    });
    alertPopup.then(function () {
      $state.go('main.tournamentDetails');
    });
  };

  function nextRound () {
    var i = $scope.tournament.rounds;
    var tmp = [];
    while (i >= 0) {
      var aux = [];
      for (var j = 0; j < $scope.inscriptionList.length; j++) {
        if ($scope.inscriptionList[j].victoryPoints === i) {
          aux.push($scope.inscriptionList[j]);
        }
      }
      if (aux.length) {
        aux = shuffleInscriptions(aux);
        for (var k = 0; k < aux.length; k++) {
          tmp.push(aux[k]);
        }
      }
      i--;
    }
    $scope.inscriptionList = tmp;
  }

  function createRound () {
    var r = $scope.cRound + 1;
    var i = 0;
    var inscriptions = $scope.inscriptionList;
    var aux = [];
    var promises = [];
    var original, replacement;
    // Se recorre la lista de inscritos para crear los emparejamientos de la siguiente ronda.
    while (i < inscriptions.length) {
      var updateWithByeScore = inscriptions[i];
      if (!inscriptions[i].drop) {
        var pairing = { player1: '', tournament: $scope.tournament._id, round: r };
        pairing.player1 = inscriptions[i]._id;
        // Si no hay bye en primera ronda, se busca un pairing válido.
        if (r === 1 && !inscriptions[i].firstRoundBye) {
          original = i + 1;
          replacement = original;
          if (replacement < inscriptions.length) {
            do {
              var hasBye = inscriptions[replacement].firstRoundBye;
              if (hasBye) {
                replacement++;
              } else {
                pairing.player2 = inscriptions[replacement]._id;
              }
            } while (replacement < inscriptions.length && hasBye);
            if (original !== replacement) {
              inscriptions = switchInscriptions(inscriptions, original, replacement);
            }
          }
          i++;
        } else if (r > 1) {
          original = i + 1;
          replacement = original;
          if (replacement < inscriptions.length) {
            // Se comprueba si está o no repetido el emparejamiento
            do {
              if (!inscriptions[replacement].drop) {
                pairing.player2 = inscriptions[replacement]._id;
                var repeated = repeatedPairing(pairing);
                if (repeated) {
                  // console.log('Pairing Repetido');
                  // replacement++;
                  // Si llegamos al último pairing, y la combinación actual está repetida, recorremos los pairings generados en orden inverso para cambiar alguno y conseguir dos válidos.
                  if (replacement + 1 === inscriptions.length) {
                    var k = aux.length - 1;
                    var tmp = pairing.player2;
                    while (k >= 0 && repeated) {
                      var p1 = aux[k].player1;
                      var p2 = aux[k].player2;
                      pairing.player2 = p2;
                      aux[k].player2 = tmp;
                      if (!repeatedPairing(pairing) && !repeatedPairing(aux[k])) {
                        repeated = false;
                      } else {
                        pairing.player2 = p1;
                        aux[k].player1 = tmp;
                        aux[k].player2 = p2;
                        if (!repeatedPairing(pairing) && !repeatedPairing(aux[k])) {
                          repeated = false;
                        } else {
                          repeated = false;
                          pairing.player2 = null;
                          aux[k].player1 = p1;
                          aux[k].player2 = p2;
                        }
                      }
                      k--;
                    }
                  }
                } else if (original !== replacement) {
                  inscriptions = switchInscriptions(inscriptions, original, replacement);
                }
              }
              replacement++;
            } while (replacement < inscriptions.length && repeated);
          }
          i++;
        }
        if (!pairing.player2) {
          pairing.winner = pairing.player1;
          pairing.p1Score = 50;
          pairing.p2Score = 0;
          pairing.isBye = true;
          aux.push(pairing);
          updateWithByeScore.victoryPoints++;
          updateWithByeScore.strengthOfSchedule += 150;
          inscriptionService.updateInscription(updateWithByeScore);
        } else {
          pairing.p1Score = 100;
          pairing.winner = pairing.player1;
          aux.push(pairing);
        }
      }
      i++;
    }

    for (var j = 0; j < aux.length; j++) {
      promises.push(pairingService.createPairing(aux[j]));
    }

    $q.all(promises)
      .then(
        function (response) {
          for (i = 0; i < response.length; i++) {
            $scope.pairingList.push(response[i]);
          }
          if ($scope.cRound > 0) {
            $scope.navRound++;
          }
          $scope.cRound++;
        },
        function (error) {
          $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
        }
      );
  }

  $scope.restartRound = function () {
    $scope.showLoading();
    var promises = [];
    var promises2 = [];
    if ($scope.cRound === $scope.navRound) {
      for (var i = 0; i < $scope.pairingList.length; i++) {
        if ($scope.pairingList[i].round === $scope.cRound && $scope.pairingList[i].winner) {
          promises.push($scope.updateInscription($scope.pairingList[i], 1));
          promises2.push($scope.deletePairing($scope.pairingList[i], i));
        }
      }
      $q.all(promises).then(
        $q.all(promises2).then(
          $scope.cRound--,
          createRound(),
          $scope.hideLoading()
        )
      );
    } else {
      $ionicPopup.alert({
        title: 'Imposible',
        template: 'No se reiniciar una ronda que no sea la actual.',
        okText: 'Cerrar',
        okType: 'button-balanced'
      });
    }
  };

  $scope.deleteRound = function () {
    $scope.closePopover();
    $scope.showLoading();
    var aux = [];
    var promises = [];
    var i, j;
    if ($scope.tournament.rounds && $scope.navRound < $scope.tournament.rounds) {
      for (i = 0; i < $scope.pairingList.length; i++) {
        if ($scope.pairingList[i].round === $scope.navRound) {
          aux.push(i);
        }
      }
      for (j = 0; j < aux.length; j++) {
        if ($scope.pairingList[aux[j]].winner) {
          $scope.updateInscription($scope.pairingList[aux[j]], 1);
        }
        promises.push(pairingService.deletePairing($scope.pairingList[aux[j]]));
      }
      $q.all(promises).then(
        function () {
          if ($scope.navRound === 1) {
            $state.go('main.tournamentDetails');
          } else {
            $scope.navRound--;
            $scope.cRound--;
            $scope.hideLoading();
          }
        },
        function (error) {
          $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
        }
      );
    } else if ($scope.tournament.top && $scope.navRound > $scope.tournament.rounds) {
      for (i = 0; i < $scope.topPairingList.length; i++) {
        if ($scope.topPairingList[i].round === $scope.navRound) {
          aux.push(i);
        }
      }
      for (j = 0; j < aux.length; j++) {
        promises.push(tournamentService.deletePairing($scope.topPairingList[aux[j]]));
      }
      $q.all(promises).then(
        function () {
          if ($scope.navRound === 1) {
            $state.go('main.tournamentDetails');
          } else {
            $scope.navRound--;
            $scope.cRound--;
            $scope.hideLoading();
          }
        },
        function (error) {
          $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
        }
      );
    }
  };

  $scope.getInscriptionName = function (playerId) {
    return $filter('filter')($scope.inscriptionList, { _id: playerId })[0].name;
  };

  $scope.playersNameList = [];
  for (var i = 0; i < $scope.inscriptionList.length; i++) {
    $scope.playersNameList.push(
      {
        'name': $scope.getInscriptionName($scope.inscriptionList[i]._id),
        'id': $scope.inscriptionList[i]._id
      }
    );
  }

  // $scope.updateInscription = function (pairing, reset) {
  //   $scope.showLoading();
  //   var promises = [];
  //   var inscriptions = $scope.inscriptionList;
  //   var inscription1, inscription2;
  //   var i = 0;
  //   while (i < inscriptions.length && (!inscription1 || !inscription2)) {
  //     if (inscriptions[i]._id === pairing.player1) {
  //       inscription1 = inscriptions[i];
  //     } else if (inscriptions[i]._id === pairing.player2) {
  //       inscription2 = inscriptions[i];
  //     }
  //     i++;
  //   }
  //   var diff = Math.abs(pairing.p1Score - pairing.p2Score);
  //   var top = $scope.tournament.top / ($scope.cRound - $scope.tournament.rounds);
  //   if (pairing.winner === inscription1._id) {
  //     if (reset) {
  //       inscription1.victoryPoints--;
  //       inscription1.strengthOfSchedule -= 100 + diff;
  //       if (inscription2) {
  //         inscription2.strengthOfSchedule -= 100 - diff;
  //       }
  //     } else {
  //       inscription1.victoryPoints++;
  //       inscription1.strengthOfSchedule += 100 + diff;
  //       if (inscription2) {
  //         inscription2.strengthOfSchedule += 100 - diff;
  //         if ($scope.cRound > $scope.tournament.rounds) {
  //           inscription2.topPosition = top;
  //         }
  //       }
  //     }
  //   } else if (pairing.winner === inscription2._id) {
  //     if (reset) {
  //       inscription1.strengthOfSchedule -= 100 - diff;
  //       inscription2.victoryPoints--;
  //       inscription2.strengthOfSchedule -= 100 + diff;
  //     } else {
  //       inscription1.strengthOfSchedule += 100 - diff;
  //       if ($scope.cRound > $scope.tournament.rounds) {
  //         inscription1.topPosition = top;
  //         if (inscription2.bracketPosition > inscription1.bracketPosition) {
  //           var aux = inscription2.bracketPosition;
  //           inscription2.bracketPosition = inscription1.bracketPosition;
  //           inscription1.bracketPosition = aux;
  //         }
  //       }
  //       inscription2.victoryPoints++;
  //       inscription2.strengthOfSchedule += 100 + diff;
  //     }
  //   }
  //
  //   if (pairing.round === $scope.tournament.rounds +  $scope.tournament.top) {
  //     if (pairing.winner === inscription1._id) {
  //       inscription1.topPosition = 1;
  //     } else {
  //       inscription2.topPosition = 1;
  //     }
  //   }
  //
  //   if (!reset) {
  //     promises.push(pairingService.updatePairing(pairing));
  //   }
  //   promises.push(inscriptionService.updateInscription(inscription1));
  //   if (inscription2) {
  //     promises.push(inscriptionService.updateInscription(inscription2));
  //   }
  //   $q.all(promises).then(
  //     function () {
  //       $scope.inscriptionList = inscriptionService.inscriptionList();
  //       $scope.hideLoading();
  //     },
  //     function (error) {
  //       $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
  //     }
  //   );
  // };

})

.controller('PairingDetailsCtrl', function ($scope, $state, $ionicPopup, $q, $filter, inscriptionService, pairingService, tournamentService) {

  $scope.showLoading();

  $scope.tournament = tournamentService.currentTournament();
  $scope.inscriptionList = inscriptionService.inscriptionList();
  $scope.currentPairing = pairingService.currentPairing();

  $scope.hideLoading();

  $scope.updateInscription = function (pairing, reset) {
    $scope.showLoading();
    var promises = [];
    var inscriptions = $scope.inscriptionList;
    var inscription1, inscription2;
    var i = 0;
    while (i < inscriptions.length && (!inscription1 || !inscription2)) {
      if (inscriptions[i]._id === pairing.player1) {
        inscription1 = inscriptions[i];
      } else if (inscriptions[i]._id === pairing.player2) {
        inscription2 = inscriptions[i];
      }
      i++;
    }
    var diff = Math.abs(pairing.p1Score - pairing.p2Score);
    var top = $scope.tournament.top / ($scope.cRound - $scope.tournament.rounds);
    if (pairing.winner === inscription1._id) {
      if (reset) {
        inscription1.victoryPoints--;
        inscription1.strengthOfSchedule -= 100 + diff;
        if (inscription2) {
          inscription2.strengthOfSchedule -= 100 - diff;
        }
      } else {
        inscription1.victoryPoints++;
        inscription1.strengthOfSchedule += 100 + diff;
        if (inscription2) {
          inscription2.strengthOfSchedule += 100 - diff;
          if ($scope.cRound > $scope.tournament.rounds) {
            inscription2.topPosition = top;
          }
        }
      }
    } else if (pairing.winner === inscription2._id) {
      if (reset) {
        inscription1.strengthOfSchedule -= 100 - diff;
        inscription2.victoryPoints--;
        inscription2.strengthOfSchedule -= 100 + diff;
      } else {
        inscription1.strengthOfSchedule += 100 - diff;
        if ($scope.cRound > $scope.tournament.rounds) {
          inscription1.topPosition = top;
          if (inscription2.bracketPosition > inscription1.bracketPosition) {
            var aux = inscription2.bracketPosition;
            inscription2.bracketPosition = inscription1.bracketPosition;
            inscription1.bracketPosition = aux;
          }
        }
        inscription2.victoryPoints++;
        inscription2.strengthOfSchedule += 100 + diff;
      }
    }

    if (pairing.round === $scope.tournament.rounds +  $scope.tournament.top) {
      if (pairing.winner === inscription1._id) {
        inscription1.topPosition = 1;
      } else {
        inscription2.topPosition = 1;
      }
    }

    if (!reset) {
      promises.push(pairingService.updatePairing(pairing));
    }
    promises.push(inscriptionService.updateInscription(inscription1));
    if (inscription2) {
      promises.push(inscriptionService.updateInscription(inscription2));
    }
    $q.all(promises).then(
      function () {
        $scope.inscriptionList = inscriptionService.inscriptionList();
        $scope.hideLoading();
        if (!reset) {
          $state.go('main.tournamentPairings', { roundNumber: pairing.round });
        }
      },
      function (error) {
        $scope.error = 'Error: ' + error.status + ' ' + error.statusText;
      }
    );
  };
  $scope.updatePairing = function (pairing) {
    $scope.showLoading();
    if (pairing.p1Score >= 0 && pairing.p1Score <= 100 && pairing.p2Score >= 0 && pairing.p2Score <= 100) {
      if (pairing.p1Score === pairing.p2Score) {
        var alertPopup = $ionicPopup.show({
          title: 'EMPATE',
          template: 'Vuelve a la página del torneo para ver los resultados',
          buttons: [
            {
              text: $scope.getInscriptionName(pairing.player1),
              onTap: function () {
                pairing.winner = pairing.player1;
              }
            },
            {
              text: $scope.getInscriptionName(pairing.player2),
              onTap: function () {
                pairing.winner = pairing.player2;
              }
            }
          ]
        });
        alertPopup.then(function () {
          $scope.updateInscription(pairing, 0);
        });
      } else {
        if (pairing.p1Score > pairing.p2Score) {
          pairing.winner = pairing.player1;
        } else {
          pairing.winner = pairing.player2;
        }
        $scope.updateInscription(pairing, 0);
      }
    } else {
      $scope.hideLoading();
    }
  };

  $scope.getInscriptionName = function (playerId) {
    return $filter('filter')($scope.inscriptionList, { _id: playerId })[0].name;
  };

})
;
