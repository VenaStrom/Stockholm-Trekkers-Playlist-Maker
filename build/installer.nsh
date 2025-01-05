!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "LogicLib.nsh"

!define un.StrStr "!insertmacro un.StrStr"
 
!macro un.StrStr ResultVar String SubString
  Push `${String}`
  Push `${SubString}`
  Call un.StrStr
  Pop `${ResultVar}`
!macroend
 
Function un.StrStr
/*After this point:
  ------------------------------------------
  $R0 = SubString (input)
  $R1 = String (input)
  $R2 = SubStringLen (temp)
  $R3 = StrLen (temp)
  $R4 = StartCharPos (temp)
  $R5 = TempStr (temp)*/
 
  ;Get input from user
  Exch $R0
  Exch
  Exch $R1
  Push $R2
  Push $R3
  Push $R4
  Push $R5
 
  ;Get "String" and "SubString" length
  StrLen $R2 $R0
  StrLen $R3 $R1
  ;Start "StartCharPos" counter
  StrCpy $R4 0
 
  ;Loop until "SubString" is found or "String" reaches its end
  loop:
    ;Remove everything before and after the searched part ("TempStr")
    StrCpy $R5 $R1 $R2 $R4
 
    ;Compare "TempStr" with "SubString"
    StrCmp $R5 $R0 done
    ;If not "SubString", this could be "String"'s end
    IntCmp $R4 $R3 done 0 done
    ;If not, continue the loop
    IntOp $R4 $R4 + 1
    Goto loop
  done:
 
/*After this point:
  ------------------------------------------
  $R0 = ResultVar (output)*/
 
  ;Remove part before "SubString" on "String" (if there has one)
  StrCpy $R0 $R1 `` $R4
 
  ;Return output to user
  Pop $R5
  Pop $R4
  Pop $R3
  Pop $R2
  Pop $R1
  Exch $R0
FunctionEnd


!macro UninstallUserData
    MessageBox MB_YESNO|MB_ICONQUESTION "Do you want to keep your playlist save files?" IDYES Done
    RMDir /r "$PROFILE\stockholm-trekkers-playlist-maker\user-data"
    Done:
!macroend

!macro UninstallAssets
    RMDir /r "$PROFILE\stockholm-trekkers-playlist-maker\assets"
!macroend

Section "Uninstall"
    ${GetParameters} $R6

    ${un.StrStr} $R7 $R6 "--updated"

    StrCmp $R7 "" IsUninstall IsUpdate
    
    IsUninstall:
    !insertmacro UninstallUserData
    !insertmacro UninstallAssets

    IsUpdate:
SectionEnd

Section "Install"
    WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd