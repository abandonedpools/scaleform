'use strict';

var AdvertisingToggle = ( function()
{
    var elBtn = $.GetContextPanel().FindChildInLayoutFile( 'HireAdvertisingToggle' );

    var _Init = function()
    {
        _UpdateToggle();
    };

    var _UpdateToggle = function()
    {
        var strAdvertising = PartyListAPI.GetLocalPlayerForHireAdvertising();
                                                                  

        if ( PartyListAPI.GetCount() > 1 )
        {
            elBtn.SetHasClass( 'advertising-active', false );
            elBtn.enabled = false;
            UpdateTooltip( elBtn.enabled );
            return;
        }
        
        elBtn.enabled = true;
        UpdateTooltip( elBtn.enabled );
        if ( strAdvertising && strAdvertising !== '' )
        {
            elBtn.SetHasClass( 'advertising-active', true );
        }
        else
        {
            elBtn.SetHasClass( 'advertising-active', false );
        }
    };
    
    var _OnActivate = function()
    {
        var callbackFunction = function( gameMode )
        {
            PartyListAPI.SetLocalPlayerForHireAdvertising( gameMode );

            $.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE' );
        };

        var strAdvertising = PartyListAPI.GetLocalPlayerForHireAdvertising();
        
                                                                                             
        var advertisingMode = strAdvertising.split( '-' )[ 0 ];
        var gameModes = [
            { mode: 'competitive' },
            { mode:'scrimcomp2v2' },
			{ mode:'survival' },
			{ mode:'cooperative' },
        ];

        var items = [];
        gameModes.forEach( entry =>
        {	                                                          
			if ( !PartyListAPI.IsPlayerForHireAdvertisingEnabledForGameMode( entry.mode ) )
				return;

			var sReplaces = ["<img src='file://{images}/icons/ui/cooperative.svg'",                                                                                            
				"<img src='file://{images}/icons/ui/broken_fang.svg'",
				"<img src='file://{images}/icons/ui/shattered_web.svg'"];
			var sLocalizedMode = $.Localize( '#advertising_for_hire_' + entry.mode );
			for ( var k = 0; k < sReplaces.length; ++ k )
			{
				if ( sLocalizedMode.startsWith( sReplaces[k] ) )
				{
					sLocalizedMode = sReplaces[0] + sLocalizedMode.substr( sReplaces[k].length );
					break;
				}
			}
			
			var labelLoc = entry.mode === advertisingMode ?
                "<b><font color='#2aa32e'>" + sLocalizedMode + '</b></font>' :
                sLocalizedMode;
            
            items.push( { label: labelLoc, style: 'Icon', jsCallback: callbackFunction.bind( undefined, entry.mode ) } );
        } );
        
        items.push(
            {
                label: $.Localize( '#advertising_for_hire_open_friends_list' ),
                style: 'TopSeparator',
                    jsCallback: function()
                    {
                        $.DispatchEvent( 'OpenSidebarPanel', true );
                    }
            }
        );

        if ( strAdvertising )
        {
            items.push(
                { label: $.Localize( '#advertising_for_hire_stop_looking' ), style:'TopSeparator',jsCallback: callbackFunction.bind( undefined, '' ) }
            );
        }
				
        UiToolkitAPI.ShowSimpleContextMenu( '', 'ControlLibSimpleContextMenu', items );
    };

    var UpdateTooltip = function( isDisabled )
    {
        var OnMouseOver = function()
        {
            var tooltipText = isDisabled === false ? '#advertising_for_hire_tooltip_disabled' : '#advertising_for_hire_tooltip';
            UiToolkitAPI.ShowTitleTextTooltip( 'HireAdvertisingToggleContainer', '#advertising_for_hire_tooltip_title', tooltipText );
        };
        
        elBtn.SetPanelEvent( 'onmouseover', OnMouseOver );
        elBtn.SetPanelEvent( 'onmouseout', function() { UiToolkitAPI.HideTitleTextTooltip(); } );
    };
    


	return {
        Init: _Init,
        OnActivate: _OnActivate,
        UpdateToggle: _UpdateToggle
	};

} )();

                                                                                                    
                                           
                                                                                                    
( function()
{
	AdvertisingToggle.Init();
    $.RegisterForUnhandledEvent( 'PanoramaComponent_PartyBrowser_LocalPlayerForHireAdvertisingChanged', AdvertisingToggle.UpdateToggle );
    $.RegisterForUnhandledEvent( "PanoramaComponent_PartyList_RebuildPartyList", AdvertisingToggle.UpdateToggle );
} )();
