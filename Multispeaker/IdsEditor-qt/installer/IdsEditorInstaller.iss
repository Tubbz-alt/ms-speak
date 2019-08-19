; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{5959F35E-1AC0-4AE2-A9B2-ED0F2DBC5FBE}}
AppName=IdsEditor
AppVersion=19.08.19
AppVerName=IdsEditor - 19.08.19
AppPublisher=LMI Developments, LLC
ArchitecturesInstallIn64BitMode=x64
DefaultDirName={pf}\LMIDevelopments\IdsEditor
DefaultGroupName=LMIDevelopments\IdsEditor
OutputBaseFilename=IdsEditor-19.08.19-win10-setup
Compression=lzma
SolidCompression=yes
UsePreviousAppDir=no
UsePreviousGroup=no
VersionInfoVersion=19.08.19
VersionInfoCompany=LMIDevelopments, LLC
SetupIconFile="..\x64\Release\icon.ico"

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; MinVersion: 6.1,6.1

[Dirs]

[Files]
Source: "vcredist_x64.exe"; DestDir: "{tmp}";
Source: "..\x64\Release\IdsEditor.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\x64\Release\Qt5Core.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\x64\Release\Qt5Gui.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\x64\Release\Qt5Widgets.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\x64\Release\imageformats\*.dll"; DestDir: "{app}\imageformats";
Source: "..\x64\Release\platforms\*.dll"; DestDir: "{app}\platforms";
Source: "..\x64\Release\icon.ico"; DestDir: "{app}";

[Icons]
Name: "{group}\IdsEditor"; Filename: "{app}\IdsEditor.exe"; IconFilename: "{app}\icon.ico"
Name: "{commondesktop}\IdsEditor"; Filename: "{app}\IdsEditor.exe"; IconFilename: "{app}\icon.ico"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\IdsEditor"; Filename: "{app}\IdsEditor.exe"; IconFilename: "{app}\icon.ico"; Tasks: quicklaunchicon

[Run]
Filename: "{tmp}\vcredist_x64.exe"; Parameters: /q; check: Is64BitInstallMode
Filename: "{app}\IdsEditor.exe"; Description: "{cm:LaunchProgram,IdsEditor}"; Flags: nowait postinstall skipifsilent

