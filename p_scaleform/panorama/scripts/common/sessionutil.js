                                                                                      

"use strict";

var SessionUtil = ( function ()
{
	var _DoesGameModeHavePrimeQueue = function( gameModeSettingName )
	{
		  
		                                                                                                     
		                                                                       
		   		                                                   
		   		                                
		  
		var bPrimeQueueSupported = ( gameModeSettingName === 'competitive' || gameModeSettingName === 'scrimcomp2v2' || gameModeSettingName === 'survival' );
		return bPrimeQueueSupported;
	};

	var _GetMaxLobbySlotsForGameMode = function( gameMode )
	{
		  
		                                                                            
		var numLobbySlots = 5;                                        
		if ( gameMode == "scrimcomp2v2" ||
			gameMode == "cooperative" ||
			gameMode == "coopmission" )
			numLobbySlots = 2;
		else if ( gameMode === "survival" )
			numLobbySlots = 2;
		return numLobbySlots;
	};

	var _AreLobbyPlayersPrime = function()
	{
		var playersCount = PartyListAPI.GetCount();

		for ( var i = 0; i < playersCount; i++ )
		{
			var xuid = PartyListAPI.GetXuidByIndex( i );
			var isFriendPrime = PartyListAPI.GetFriendPrimeEligible( xuid );

			if ( isFriendPrime === false )
			{
				return false;
			}
		}

		return true;
	};

	var _GetNumWinsNeededForRank = function( skillgroupType )
	{
		if ( skillgroupType.toLowerCase() === 'survival' ) return 0;                                                              
		if ( skillgroupType.toLowerCase() === 'dangerzone' ) return 0;                                                              
		return 10;                                                       
	};

	return{
		DoesGameModeHavePrimeQueue : _DoesGameModeHavePrimeQueue,
		GetMaxLobbySlotsForGameMode: _GetMaxLobbySlotsForGameMode,
		AreLobbyPlayersPrime: _AreLobbyPlayersPrime,
		GetNumWinsNeededForRank : _GetNumWinsNeededForRank
	};
})();