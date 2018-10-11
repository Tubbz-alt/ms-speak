; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{F58A5A61-D60E-4B83-AD6D-5D7E99B500B5}}
AppName=MultiSpeaker
AppVersion=18.09.06
;AppVerName=MultiSpeaker 18.09.06
AppPublisher=Pacific Northwest National Laboratory
AppPublisherURL=http://www.pnnl.gov
AppSupportURL=http://www.pnnl.gov
AppUpdatesURL=http://www.pnnl.gov

; "ArchitecturesInstallIn64BitMode=x64" requests that the install be
; done in "64-bit mode" on x64, meaning it should use the native
; 64-bit Program Files directory and the 64-bit view of the registry.
; On all other architectures it will install in "32-bit mode".
;ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
DefaultDirName={pf}\PNNL\MultiSpeaker
DefaultGroupName=PNNL\MultiSpeaker
OutputBaseFilename=MultiSpeaker-18.09.06-win7-setup
Compression=lzma
SolidCompression=yes
UsePreviousAppDir=no
UsePreviousGroup=no
VersionInfoVersion=18.09.06
VersionInfoCompany=Pacific Northwest National Laboratory

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; MinVersion: 6.1,6.1

[Dirs]

; NOTE: Don't use "Flags: ignoreversion" on any shared system files
[Files]
; x64
Source: "vc_redist.x64.exe"; DestDir: "{tmp}"; check: Is64BitInstallMode
Source: "..\x64\Release\MultiSpeaker.exe"; DestDir: "{app}"; check: Is64BitInstallMode; Flags: ignoreversion
Source: "..\x64\Release\MultiSpeakerServer.exe"; DestDir: "{app}"; check: Is64BitInstallMode; Flags: ignoreversion
Source: "..\x64\Release\Qt5Core.dll"; DestDir: "{app}"; check: Is64BitInstallMode; Flags: ignoreversion
Source: "..\x64\Release\Qt5Gui.dll"; DestDir: "{app}"; check: Is64BitInstallMode; Flags: ignoreversion
Source: "..\x64\Release\Qt5Network.dll"; DestDir: "{app}"; check: Is64BitInstallMode; Flags: ignoreversion
Source: "..\x64\Release\Qt5Xml.dll"; DestDir: "{app}"; check: Is64BitInstallMode; Flags: ignoreversion
Source: "..\x64\Release\Qt5Widgets.dll"; DestDir: "{app}"; check: Is64BitInstallMode; Flags: ignoreversion
Source: "..\x64\Release\ssleay32.dll"; DestDir: "{app}"; check: Is64BitInstallMode; Flags: ignoreversion
Source: "..\x64\Release\libeay32.dll"; DestDir: "{app}"; check: Is64BitInstallMode; Flags: ignoreversion
Source: "..\x64\Release\imageformats\*.*"; DestDir: "{app}\imageformats"; check: Is64BitInstallMode
Source: "..\x64\Release\platforms\*.*"; DestDir: "{app}\platforms"; check: Is64BitInstallMode;
Source: "..\x64\Release\MultiSpeaker.ico"; DestDir: "{app}"; check: Is64BitInstallMode; Flags: ignoreversion

[Icons]
Name: "{group}\MultiSpeaker"; Filename: "{app}\MultiSpeaker.exe"; IconFilename: "{app}\MultiSpeaker.ico"
Name: "{group}\MultiSpeakerServer"; Filename: "{app}\MultiSpeakerServer.exe"; IconFilename: "{app}\MultiSpeaker.ico"
Name: "{commondesktop}\MultiSpeaker"; Filename: "{app}\MultiSpeaker.exe"; IconFilename: "{app}\MultiSpeaker.ico"; Tasks: desktopicon
Name: "{commondesktop}\MultiSpeakerServer"; Filename: "{app}\MultiSpeakerServer.exe"; IconFilename: "{app}\MultiSpeaker.ico"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\MultiSpeaker"; Filename: "{app}\MultiSpeaker.exe"; IconFilename: "{app}\MultiSpeaker.ico"; Tasks: quicklaunchicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\MultiSpeakerServer"; Filename: "{app}\MultiSpeakerServer.exe"; IconFilename: "{app}\MultiSpeaker.ico"; Tasks: quicklaunchicon

[Registry]
Root: HKCU; Subkey: "Software\PNNL\MultiSpeaker"; Flags: createvalueifdoesntexist uninsdeletevalue
Root: HKCU; Subkey: "Software\PNNL\MultiSpeakerServer"; Flags: createvalueifdoesntexist uninsdeletevalue

[Run]
; x64
Filename: "{tmp}\vc_redist.x64.exe"; Parameters: /q; check: Is64BitInstallMode

Filename: "{app}\MultiSpeaker.exe"; Description: "{cm:LaunchProgram,MultiSpeaker}"; Flags: nowait postinstall skipifsilent

