"use strict";

var friendsList = (function() {

	var _m_activeTabIndex = 0;
	var _m_tabs = [];
	var _m_isPerfectWorld = MyPersonaAPI.GetLauncherType() === "perfectworld" ? true : false;

	var _m_schfnUpdateAntiAddiction = null;

	var _Init = function()
	{
		                               

		_SetLocalPlayerAvatar();

		_m_tabs = [
			{
				elContent: $( '#JsFriendsList-friends' ),
				elList: $( '#JsFriendsList-friends' ).FindChild( 'JsFriendsList-List' ),
				elTabRadioBtn: $( '#JsFriendsTab-friends' ),
				getCount: _GetFriendsCount,
				getAlertsCount: _GetFriendsCount,
				getXuidByIndex: _GetXuidByIndex,
				tileXmlToUse: 'friendtile',
				nodatString: '#FriendsList_nodata_friends'
			},

			{
				elContent: $( '#JsFriendsList-requests' ),
				elList: $( '#JsFriendsList-requests' ).FindChild( 'JsFriendsList-List' ),
				elTabRadioBtn: $( '#JsFriendsTab-requests' ),
				getCount: _GetRequestsCount,
				getAlertsCount: _GetRequestsAlertCount,
				getXuidByIndex: _GetRequestsXuidByIndex,
				tileXmlToUse: 'friendtile',
				nodatString: '#FriendsList_nodata_requests'
			},

			{
				elContent: $( '#JsFriendsList-recents' ),
				elList: $( '#JsFriendsList-recents' ).FindChild( 'JsFriendsList-List' ),
				elTabRadioBtn: $( '#JsFriendsTab-recents' ),
				getCount: _GetRecentsCount,
				getAlertsCount: _GetRecentsCount,
				getXuidByIndex: _GetRecentXuidByIndex,
				tileXmlToUse: 'friendtile',
				nodatString: '#FriendsList_nodata_recents',
				type: 'recent'
			},

			{
				elContent: $( '#JsFriendsList-lobbies' ),
				elList: $( '#JsFriendsList-lobbies' ).FindChild( 'JsFriendsList-List' ),
				elTabRadioBtn: $( '#JsFriendsTab-lobbies' ),
				getCount: _GetLobbiesCount,
				getAlertsCount: _GetLobbiesCount,
				getXuidByIndex: _GetLobbyXuidByIndex,
				tileXmlToUse: 'friend_advertise_tile',
				nodatString: '#FriendsList_nodata_advertising'
			}
		];

		_UpdateAllTabsAlertCounts();
		_ShowSelectedTab( 0 );

		_UpdateIncomingInvitesContainer();

		var btnLobbiesTabListFilters = $( '#JsFriendsList-lobbies-toolbar-button-' + _m_sLobbiesTabListFiltersString );
		if ( btnLobbiesTabListFilters )
		{	                                                                         
			btnLobbiesTabListFilters.checked = true;

			                                                                
			var elParent = btnLobbiesTabListFilters.GetParent();
			elParent.Children().forEach( child => {
				if ( !child.BHasClass( 'friendslist-navbar-lobby-button' ) )
					return;
				
				var strPrefix = 'JsFriendsList-lobbies-toolbar-button-';
				if ( !child.id.startsWith( strPrefix ) )
					return;
				
				var gamemodename = child.id.slice( strPrefix.length );
				if ( !PartyListAPI.IsPlayerForHireAdvertisingEnabledForGameMode( gamemodename ) )
					child.visible = false;
			} );
		}
	};

	var _SetLocalPlayerAvatar = function ()
	{
		var xuid = MyPersonaAPI.GetXuid();

		var newPanel = $.GetContextPanel().FindChildInLayoutFile( 'JsLocalPlayercard' );

		_UpdateAntiAddiction();

		if( newPanel )
		{
			return;
		}

		var newPanel = $.CreatePanel('Panel', $.GetContextPanel(), 'JsLocalPlayercard' ); 
		newPanel.SetAttributeString( "xuid", xuid );
		newPanel.SetAttributeString( 'data-slot', 'profile-for-friends-list' );
		newPanel.BLoadLayout('file://{resources}/layout/playercard.xml', false, false);

		$.GetContextPanel().MoveChildBefore( newPanel,  $.GetContextPanel().FindChild( 'AntiAddiction' ) );

		newPanel.FindChildInLayoutFile( 'JsPlayerCardAvatar' );
		_AddOpenPlayerCardAction( newPanel.FindChildInLayoutFile( 'JsPlayerCardAvatar' ), xuid);
	}

	var _UpdateAntiAddiction = function()
	{
		var elAAGroup = $.GetContextPanel().FindChildInLayoutFile( 'AntiAddiction' );
		var numSec = _m_isPerfectWorld ? MyPersonaAPI.GetAntiAddictionTimeRemaining() : -1;
		if ( numSec < 0 )
		{
			elAAGroup.AddClass( 'hidden' );
			return false;
		}

		elAAGroup.RemoveClass( 'hidden' );
		var szSeverity = 'Green';
		if ( numSec <= 300 )                  
			szSeverity = 'Red';
		else if ( numSec <= 1800 )                   
			szSeverity = 'Yellow';

		var elAAIcon = elAAGroup.FindChildInLayoutFile( 'AntiAddictionIcon' );
		elAAIcon.SetHasClass( 'anti-addiction-Green', 'Green' === szSeverity );
		elAAIcon.SetHasClass( 'anti-addiction-Yellow', 'Yellow' === szSeverity );
		elAAIcon.SetHasClass( 'anti-addiction-Red', 'Red' === szSeverity );

		                                                                                                 
		var strTimeRemainingSentence = ( numSec >= 60 )
			? FormatText.SecondsToSignificantTimeString(numSec)
			: $.Localize('#AntiAddiction_Label_TimeRemainingNone');
		elAAGroup.SetDialogVariable( 'aatime', strTimeRemainingSentence );

		var szLocalizedTooltip = $.Localize( ( (numSec >= 60)
			? '#UI_AntiAddiction_Tooltip_GameTime'
			: '#UI_AntiAddiction_Tooltip_GameTimeNone' ), elAAGroup);
		elAAGroup.SetPanelEvent( "onmouseover", function()
		{
			UiToolkitAPI.ShowTextTooltip( 'AntiAddiction', szLocalizedTooltip );
		} );

		if ( _m_schfnUpdateAntiAddiction )
			$.CancelScheduled( _m_schfnUpdateAntiAddiction );
		 _m_schfnUpdateAntiAddiction = $.Schedule( 30, _UpdateAntiAddictionTimer );
	}

	var _UpdateAntiAddictionTimer = function()
	{
		_m_schfnUpdateAntiAddiction = null;
		_UpdateAntiAddiction();
	}

	var _AddOpenPlayerCardAction = function ( elAvatar, xuid ) {
		var openCard = function ( xuid )
		{
			                                                                                             
			$.DispatchEvent( 'SidebarContextMenuActive', true );
			
			if ( xuid !== 0 ) {
				var contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent(
					'',
					'',
					'file://{resources}/layout/context_menus/context_menu_playercard.xml', 
					'xuid='+xuid,
					function () {
						$.DispatchEvent('SidebarContextMenuActive', false )
					}
				);
				contextMenuPanel.AddClass( "ContextMenu_NoArrow" );
			}
		}

		elAvatar.SetPanelEvent( "onactivate", openCard.bind( undefined, xuid ));
	};

	var _UpdateAllTabsAlertCounts = function ()
	{
		for( var i = 0; i < _m_tabs.length; i++ )
			{
				_UpdateTabAlertCounts( i );
			}
	};

	var _UpdateTabAlertCounts = function( tabIndex )
	{
		var tabData = _m_tabs [ tabIndex ];
		var count = 0;
		var elAlert = tabData.elTabRadioBtn.FindChild( 'JsFriendsTabAlert' );
		
		if ( tabData.hasOwnProperty( 'getAlertsCount' ) )
			count = tabData.getAlertsCount();

		if( !count )
		{
			elAlert.AddClass( 'hidden' );
			return;
		}

		elAlert.RemoveClass( 'hidden' );

		var elLabel = elAlert.FindChild( 'JsFriendsTabAlertText' );
		elLabel.text = count;
	};

	                   
	var _ShowSelectedTab = function ( tabIndex )
	{
		                                                                             
		
		if( _m_activeTabIndex !== tabIndex )
			_m_tabs[ _m_activeTabIndex ].elContent.AddClass( 'hidden' );

		                     
		if ( tabIndex == 2 ) StoreAPI.RecordUIEvent( "FriendsListerTabRecent" );
		else if ( tabIndex == 3 ) StoreAPI.RecordUIEvent( "FriendsListerTabNearby" );

		_m_activeTabIndex = tabIndex;
		_m_tabs[ tabIndex ].elContent.RemoveClass( 'hidden' );

		if ( tabIndex === 3 )
		{
			_RefreshLobbyListings();
		}

		_UpdateTabList( tabIndex );
		_UpdateTabAlertCounts( tabIndex );
	};

	                            

	var _UpdateActiveTabList = function ()
	{
		_UpdateTabList( _m_activeTabIndex );
	};

	var _UpdateFriendsTabList = function()
	{
		if( _m_activeTabIndex === 1 )
			_UpdateRequestsTabList();
		
		_UpdateTabList( 0 );
	};

	var _UpdateRequestsTabList = function()
	{
		_UpdateTabList( 1 );
		_UpdateTabAlertCounts( 1 );
	};

	var _UpdateRecentsTabList = function()
	{
		_UpdateTabList( 2 );
		_UpdateTabAlertCounts( 2 );
	};

	var _UpdateLobbiesTabList = function()
	{	
		_UpdateTabList( 3 );
		_UpdateTabAlertCounts( 3 );
	};

	var _m_sLobbiesTabListFiltersString = GameInterfaceAPI.GetSettingString( 'ui_nearbylobbies_filter' );
	var _SetLobbiesTabListFilters = function( sFilterString )
	{
		_m_sLobbiesTabListFiltersString = sFilterString;
		GameInterfaceAPI.SetSettingString( 'ui_nearbylobbies_filter', _m_sLobbiesTabListFiltersString );
		_RefreshLobbyListings();
	};

	var _RefreshLobbyListings = function ()
	{
		_m_tabs[ 3 ].elList.ScrollToTop();
		PartyBrowserAPI.SetSearchFilter( _m_sLobbiesTabListFiltersString );
		PartyBrowserAPI.Refresh();
	};

	var _UpdateTabList = function( tabIndex )
	{	
		var tabData = _m_tabs[ tabIndex ];
		var count = tabData.getCount();

		                                                                 
		if( tabIndex === 3 )
		{
			_UpdateLobbiesLoadingBar();
		}

		                                              
		if( !count )
		{
			_ShowEmptyListerMessage( tabData )
			return;
		}

		                                                                
		                                                        
		if( tabIndex === 2 )
		{
			if( _ShowRecentsLoadingBar() )
				return;
		}

		                                      
		                                                 
		var elNodata =  tabData.elList.FindChild( 'JsFriendListNoData' );
		if ( elNodata )
			elNodata.AddClass( 'hidden' );

		_MakeOrUpdateTiles( tabData, count );
	};

	var _ShowRecentsLoadingBar = function()
	{
		var elBarOuter = $( '#JsFriendsListRecentsLoadingBar' ),
		elBarInner = $( '#JsFriendsListRecentsLoadingBarInner' );
		
		if( TeammatesAPI.GetSecondsAgoFinished() < 0 )
		{
			if( elBarOuter.BHasClass( 'hidden' ))
				elBarOuter.RemoveClass( 'hidden' );

			elBarInner.AddClass( 'loadingbar-indeterminate' );
			return true;
		}	
		else
		{
			elBarInner.RemoveClass( 'loadingbar-indeterminate' );
			elBarOuter.AddClass( 'hidden' );
			
			return false;
		}
	};

	var _UpdateLobbiesLoadingBar = function()
	{
		var progress = PartyBrowserAPI.GetProgress();

		var elBarOuter = $( '#JsFriendsListLobbyLoadingBar' ),
		elBarInner = $( '#JsFriendsListLobbyLoadingBarInner' );

		if( progress > 0 && progress < 100 )
		{
			if( elBarOuter.BHasClass( 'hidden' ))
				elBarOuter.RemoveClass( 'hidden' );

			elBarInner.style.width = progress +'%';
			return true;
		}
		else
		{
			elBarOuter.AddClass( 'hidden' );
			return false;
		}
	};

	var _ShowEmptyListerMessage = function( tabData )
	{
		var elList = tabData.elList;
		elList.RemoveAndDeleteChildren();

		var elTile = elList.FindChild( 'JsFriendListNoData' );
		
		if( !elTile )
		{
			elTile = $.CreatePanel( "Panel", elList, 'JsFriendListNoData' );
			elTile.BLoadLayoutSnippet( 'NoData' );

			var descString = tabData.nodatString;
			var elBtn = elTile.FindChildTraverse( 'JsFriendsNoDataBtn' );

			        
			                                                                                   
			                               

			                                              
			   		                                           
			       
			   	                                                       
			    
			   	                                                                      
				
			   	                       
			   	 
			   		                                           
			   	 
			   	                                                                                      
			   	 
			   		                                           
			   		 
			   			                           
			   					                                                              
			   					                                                        
						
			   			                                                   
			   		 
			   		    
			   		 
			   			                                  
			   			                           
			   				                                                                
			   				                                                          
						
			   			                                           
			   		 

			   		                            
			   		 
			   			                                    
			   		 

			   		                                                
			   		                     
			   	 
			    
			       
			      

				elBtn.visible = false;
			
			elTile.FindChildTraverse( 'JsFriendsNoDataTitle' ).text = $.Localize( descString + '_title' );
			elTile.FindChildTraverse( 'JsFriendsNoDataDesc' ).text = $.Localize( descString );
			elTile.RemoveClass( 'hidden' );
		}
	};

	var _MakeOrUpdateTiles = function ( tabData, count )
	{
		var xuidsFromUpdate = [];

		for( var i = 0; i < count; i++ )
		{
			var xuid = tabData.getXuidByIndex( i );
			
			xuidsFromUpdate.push( xuid );
		}

		var elList = tabData.elList;
		_DeleteTilesNotInUpdate( elList, xuidsFromUpdate );

		for ( var i = 0; i < xuidsFromUpdate.length; i++ )
		{
			var xuid = xuidsFromUpdate[i];
			var elTile = elList.FindChildTraverse( xuid );
			var children = elList.Children();
			
			if( !elTile )
				_AddTile( elList, children, xuid, i, tabData.tileXmlToUse, tabData.type );
			else
				_UpdateTilePosition( elList, children, elTile, xuid, i, tabData.tileXmlToUse  );
		}
	};

	var _DeleteTilesNotInUpdate = function( elList , xuidsFromUpdate )
	{
		var children = elList.Children();
		var sectionChildrenCount = children.length;
		
		                                                                    
		                                 
		for ( var i = 0; i < sectionChildrenCount; i++ )
		{
			if ( xuidsFromUpdate.indexOf( children[i].id ) < 0 )
				children[i].AddClass( 'hidden' );
		}
	};

	var _AddTile = function( elList, children, xuid, index, tileXmlToUse, type )
	{
		var elTile = $.CreatePanel( "Panel", elList, xuid );
		elTile.SetAttributeString( 'xuid', xuid );
		elTile.BLoadLayout( 'file://{resources}/layout/' + tileXmlToUse + '.xml', false, false );

		if ( type )
		{
			elTile.Data().type = type;
		}	

		if( children && children[index + 1] )
			elList.MoveChildBefore( elTile, children[index + 1] );
		
		_AddTransitionEndEventHandeler( elTile );

		_InitTile( elTile, tileXmlToUse );
		elTile.RemoveClass( 'hidden' );

		return elTile;
	};

	var _UpdateIncomingInvitesContainer = function()
	{
		var elInviteRoot = $.GetContextPanel().FindChild( 'JsIncomingInvites' );
		elInviteRoot.AddClass( 'hidden' );

		var elInviteContainer = elInviteRoot.FindChildInLayoutFile( 'JsIncomingInviteContainer' );
		elInviteContainer.RemoveAndDeleteChildren();
		
		var numInvites = PartyBrowserAPI.GetInvitesCount();
		if ( numInvites > 0 )
		{	                                             
			var xuid = PartyBrowserAPI.GetInviteXuidByIndex( 0 );
			_AddTile( elInviteContainer, null, xuid, 0, 'friendlobby', null );
			elInviteRoot.RemoveClass( 'hidden' );
		}
	}

	var _UpdateTilePosition = function( elList, children, elTile, xuid, index, tileXmlToUse )
	{
		var name = FriendsListAPI.GetFriendName( xuid );
		
		if( children[index] )
			elList.MoveChildBefore( elTile, children[index] );
		
		_InitTile( elTile, tileXmlToUse );
	};

	var _InitTile = function ( elTile, tileXmlToUse )
	{
		                                                                        
		                                           
		                                    
		                          
		if ( tileXmlToUse === "friendtile" )
		{
			friendTile.Init( elTile );
		}
		else if ( tileXmlToUse === "friendlobby" )
		{
			friendLobby.Init( elTile );
		}
		else
		{
			FriendAdvertiseTile.Init( elTile );
		}
	};

	var _AddTransitionEndEventHandeler =  function ( elTile )
	{
		                                                                          
		elTile.OnPropertyTransitionEndEvent = function( panelName, propertyName )
		{
			if( elTile.id === panelName && propertyName === 'opacity' )
			{
				                                         
				if( elTile.visible === true && elTile.BIsTransparent() )
				{
					elTile.DeleteAsync( .0 );
					                                                                       
					return true;
				}
			}
			return false;
		};
		
		$.RegisterEventHandler( 'PropertyTransitionEnd', elTile, elTile.OnPropertyTransitionEndEvent );
	};

	             
	var _GetFriendsCount = function()
	{
		return FriendsListAPI.GetCount();
	};

	var _GetRequestsCount = function()
	{
		return FriendsListAPI.GetFriendRequestsCount();
	};

	var _GetRecentsCount = function()
	{
		TeammatesAPI.Refresh();
		var count = TeammatesAPI.GetCount();

		if( count )
			return count;
	};

	var _GetLobbiesCount = function()
	{
		var count = PartyBrowserAPI.GetResultsCount();

		if( count )
			return count;
	};

	var _GetRequestsAlertCount = function()
	{
		return FriendsListAPI.GetFriendRequestsNotificationNumber();
	};

	var _GetXuidByIndex = function( index )
	{
		return FriendsListAPI.GetXuidByIndex( index );
	};

	var _GetRequestsXuidByIndex = function( index )
	{
		return FriendsListAPI.GetFriendRequestsXuidByIdx( index );
	};

	var _GetRecentXuidByIndex = function( index )
	{
		return TeammatesAPI.GetXuidByIndex( index );
	}

	var _GetLobbyXuidByIndex = function( index )
	{
		return PartyBrowserAPI.GetXuidByIndex( index );
	};

	var _GetActiveTabIndex = function ()
	{
		return _m_activeTabIndex;
	};

	                                                     
	var _SidebarContextMenuActive = function ( isSidebarContextMenuActive )
	{
		                                                     
		if( isSidebarContextMenuActive )
			_OnSideBarHover ( !isSidebarContextMenuActive );
		else
			_OnSideBarHover ( isSidebarContextMenuActive );
	};

	var _OnSideBarHover = function ( isCollapsed )
	{
		                                                                                          
		                                                                                                   
		  
			                                                     

			                                     
				                                         
			                           
				                                      
		  

		if ( !isCollapsed )
		{
			for( var i = 0; i < _m_tabs.length; i++ )
			{
				_m_tabs[i].elTabRadioBtn.RemoveClass( 'hidden' );
			}
		}
		else 
		{
			for( var i = 0; i < _m_tabs.length; i++ )
			{
				if( i !== _m_activeTabIndex )
					_m_tabs[i].elTabRadioBtn.AddClass( 'hidden' );
				else
					_m_tabs[i].elTabRadioBtn.RemoveClass( 'hidden' );
			}
		}
	};

	var _OnAddFriend = function ()
	{
		UiToolkitAPI.ShowCustomLayoutPopup('', 'file://{resources}/layout/popups/popup_add_friend.xml');
	};

	var _OpenLobbyFaq = function ()
	{
		var link = _m_isPerfectWorld ?
				"http://blog.counter-strike.net/index.php/nearby-lobby-faq/" :
				"http://blog.counter-strike.net/index.php/steam-group-lobbies/";

		SteamOverlayAPI.OpenURL( link ); 
	};

	var _FriendsListNameChanged = function ()
	{
		_UpdateActiveTabList();
		
		                                      
		_SetLocalPlayerAvatar();
	};

	var _HideLocalPlayer = function ( bshouldHide )
	{
		var elLocalPlayer = $.GetContextPanel().FindChildInLayoutFile('JsLocalPlayercard');
		elLocalPlayer.SetHasClass( 'hidden', bshouldHide );
	};

	var _SetInvitedTile = function ( xuid )
	{
		                                                     
		if ( _m_activeTabIndex === 3 || _m_activeTabIndex === 0 )
		{		
			var tile = _m_tabs[ _m_activeTabIndex ].elList.FindChild( xuid );
			if ( tile )
			{
				friendTile.SetInvitedFromContextMenu( tile );
			}
		}
	};

	var _SetToTabLobbies = function()
	{
		                                 
		_m_tabs[ 3 ].elTabRadioBtn.FindChildInLayoutFile( 'JsFriendsTab' ).checked = true;
		_ShowSelectedTab( 3 );
	};

	                      
	return {
		Init						: _Init,
		ShowSelectedTab				: _ShowSelectedTab,                             
		UpdateAllTabsAlertCounts	: _UpdateAllTabsAlertCounts,
		UpdateFriendsTabList		: _UpdateFriendsTabList,
		UpdateRequestsTabList		: _UpdateRequestsTabList,
		UpdateLobbiesTabList		: _UpdateLobbiesTabList,
		SetLobbiesTabListFilters	: _SetLobbiesTabListFilters,
		UpdateRecentsTabList		: _UpdateRecentsTabList,
		UpdateActiveTabList			: _UpdateActiveTabList,
		UpdateIncomingInvitesContainer : _UpdateIncomingInvitesContainer,
		FriendsListNameChanged		: _FriendsListNameChanged,
		RefreshLobbyListings		: _RefreshLobbyListings,
		OpenLobbyFaq				: _OpenLobbyFaq,
		GetActiveTab				: _GetActiveTabIndex,
		OnSideBarHover				: _OnSideBarHover,
		OnAddFriend					: _OnAddFriend,
		SidebarContextMenuActive	: _SidebarContextMenuActive,
		SetLocalPlayerAvatar		: _SetLocalPlayerAvatar,                
		HideLocalPlayer				: _HideLocalPlayer,
		SetInvitedTile				: _SetInvitedTile,
		SetToTabLobbies				: _SetToTabLobbies
	};
})();

                                                                                                    
                                           
                                                                                                    
(function()
{
	friendsList.Init();
	$.RegisterForUnhandledEvent( 'PanoramaComponent_GC_Hello', friendsList.UpdateAllTabsAlertCounts);
	$.RegisterForUnhandledEvent( "PanoramaComponent_FriendsList_RebuildFriendsList", friendsList.UpdateFriendsTabList );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_Teammates_Refresh', friendsList.UpdateRecentsTabList );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_PartyBrowser_Refresh', friendsList.UpdateLobbiesTabList );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_FriendsList_NameChanged', friendsList.FriendsListNameChanged );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_GcLogonNotificationReceived', friendsList.SetLocalPlayerAvatar );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', friendsList.SetLocalPlayerAvatar );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_MedalsChanged', friendsList.SetLocalPlayerAvatar );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_PartyBrowser_InviteConsumed', friendsList.UpdateIncomingInvitesContainer );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_PartyBrowser_InviteReceived', friendsList.UpdateIncomingInvitesContainer );
	$.RegisterForUnhandledEvent( 'SidebarIsCollapsed', friendsList.OnSideBarHover );
	$.RegisterForUnhandledEvent( 'SidebarContextMenuActive', friendsList.SidebarContextMenuActive );
	$.RegisterForUnhandledEvent( 'FriendInvitedFromContextMenu', friendsList.SetInvitedTile );
	$.RegisterForUnhandledEvent( 'OpenSidebarPanel', friendsList.SetToTabLobbies );


	                                                                                                
})();


  
                                                                  
                                                                                 
	 
                      
 
	                                         
	                                           
	 
		                                             

		                         
		                                 
		                                           
	 
   
