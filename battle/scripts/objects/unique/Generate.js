Generate = {
	forSituation : {
		BattleFactory : {
			candidates : [],
			lineup : function (trainer) {
				// Generates 6 Pokémon to use in the Battle Factory
				var random = new srandom(trainer.identification);
				if (Generate.forSituation.BattleFactory.candidates.notEmpty()) {
					var lineup = [];
					for (var i = 0; i < 6; ++ i) {
						var species = random.chooseFromArray(Generate.forSituation.BattleFactory.candidates);
						var moveset = Pokedex._(species).moveset;
						var potentialMoves = [];
						forevery(moveset, function (moves) {
							potentialMoves = potentialMoves.concat(moves);
						});
						lineup.push(new pokemon({
							species : species,
							moves : random.chooseDistinctSelectionFromArray(potentialMoves, 4),
							level : 100
						}));
					}
					return lineup;
				} else {
					return null;
				}
			}
		}
	}
};