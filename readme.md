
# Scaleform HUD for CS:GO demos

This is an addon that replicates CS:GO's old Scaleform HUD. **It only works for watching/recording demos or playing offline with -insecure.**

To use this you will need to install [HLAE](https://www.advancedfx.org/) and [MIGI](https://zoolsmith.github.io/MIGI3/). If you are not familiar with these programs, they have guides available on their website.

## Usage

1. Place **panorama.my.zip** in **C:/Users/yourname/AppData/roaming/HLAE**. Do not extract the file.

2. Place the **p_scaleform** folder in your MIGI addons folder and click the "UPDATE BUILD" button in MIGI.

3. Open the HLAE Custom Loader and launch CSGO with the commands `-game migi/csgo -afxdetourpanorama`, like this:
![custom launcher](https://media.discordapp.net/attachments/893330030770405437/1044823556221050921/hlaelaucnh.png "custom launcher settings")

If you get an error when launching, make sure MIGI and HLAE are updated to the latest version.

## Changeable settings

- Parts of the HUD (such as the opacity of the backgrounds for health, ammo, money, and location) can be changed in **p_scaleform\panorama\styles\csgostyles.css**. You can also change the speed of the animations for certain HUD elements, hide panels, and other small things. Make sure to rebuild MIGI after making any changes.

- There is also an option to use the 2013 MVP panel. To do this, go into **p_scaleform\panorama\layout\hud\hudwinpanel.xml** and in line 4 change "hudwinpanel.css" to "hudwinpanel**old**.css", then rebuild MIGI.

- By default, weapon names in the bottom right corner are colored based on their rarity (similar to using cl_loadout_colorweaponnames 1 back when it worked). To disable this, open **panorama/styles/hud/hudweaponselection.css** and comment out everything from line 847 to 878 (it's at the very bottom) and rebuild MIGI.

## Screenshots

![POV demo, default settings](https://media.discordapp.net/attachments/974395055064379402/1044818925571022848/video.00_00_02_01.Still003.png?width=1201&height=676 "POV demo, default settings")

![GOTV demo, default settings]( https://media.discordapp.net/attachments/974395055064379402/1044812324755746916/video.00_00_01_06.Still002.png?width=1201&height=676  "GOTV demo, default settings")

![defuse panel](https://media.discordapp.net/attachments/974395055064379402/1044809047376920607/video.00_00_00_28.Still003.png?width=1201&height=676 "defuse panel")

![2013 MVP panel](https://media.discordapp.net/attachments/974395055064379402/1044809046995251230/video.00_00_02_04.Still004.png?width=1201&height=676 "2013 MVP panel")

## Credits

- [offline](https://www.youtube.com/offlined)
- [skam](https://www.youtube.com/@skam)
- [jo (me)](https://www.youtube.com/shittyboyz)

And thanks to ccqts and sloxy for also helping me with CSS/XML when I first started working on this project.
