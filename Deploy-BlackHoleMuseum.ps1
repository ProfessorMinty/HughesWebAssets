# Deployment wrapper revision: BHM-DEPLOY-2026.08.06-R7
[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
    [Parameter()]
    [string]$RepoPath = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'Continue'

# This deployment intentionally requires modern PowerShell Core. The scientific-media
# acquisition itself is performed by Python and is separately bound to Windows' native
# certificate trust store through the truststore package. SSL verification is never disabled.
if ($PSVersionTable.PSEdition -ne 'Core' -or $PSVersionTable.PSVersion.Major -lt 7) {
    throw ('PowerShell 7 or newer (pwsh) is required. Current runtime: {0} {1}. Open PowerShell 7 and rerun this script.' -f $PSVersionTable.PSEdition,$PSVersionTable.PSVersion)
}

$ScriptRevision = 'BHM-DEPLOY-2026.08.06-R7'
$SourceImplementationDirectory = 'C:\Users\broke\Documents\black-hole-museum-repository-overlay\black-hole-museum-implementation'
$ExpectedRemoteSlug = 'ProfessorMinty/HughesWebAssets'
$ExpectedRemoteUrl = 'https://github.com/ProfessorMinty/HughesWebAssets.git'
$DefaultClonePath = 'C:\Users\broke\Documents\HughesWebAssets'
$BranchName = 'feature/arctic-black-hole-museum'
$ReleaseTag = 'v0.1.0-black-hole-lab.1'
$ReleaseId = '0.1.0-black-hole-lab.1'
$ReleaseRelative = 'dist\v0.1.0-black-hole-lab.1'
$EvidenceRelative = 'docs\evidence\black-hole-museum\v0.1.0-black-hole-lab.1'
$EdublogsBlockRelative = 'docs\deployment\black-hole-museum-edublogs-block.html'
$DeploymentLog = 'C:\Users\broke\Documents\Black-Hole-Museum-Deployment.log'
$FinalHtmlCopy = 'C:\Users\broke\Documents\Black-Hole-Museum-Edublogs-Block.html'
$FinalTextCopy = 'C:\Users\broke\Documents\Black-Hole-Museum-Edublogs-Block.txt'
$RecoveryBase = 'C:\Users\broke\Documents\Black-Hole-Museum-Recovery'
$VenvRoot = Join-Path $env:LOCALAPPDATA 'NorthernLightsLabs\BlackHoleMuseumDeploy\venv'
$TotalSteps = 20
$BuildTimestamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
$script:DryRun = [bool]$WhatIfPreference
$script:CurrentStep = 0
$script:RepoRoot = $null
$script:GitPath = $null
$script:SystemPython = $null
$script:VenvPython = $null
$script:SourceCommit = $null
$script:FinalCommit = $null
$script:InitialBranch = $null
$script:InitialHead = $null
$script:RecoveryDirectory = $null
$script:RecoveryRecords = [System.Collections.Generic.List[object]]::new()
$script:AssetTotal = 0
$script:AssetComplete = 0
$script:AssetFailed = 0
$script:RepoPassed = 0
$script:RepoFailed = 0
$script:BrowserPassed = 0
$script:BrowserFailed = 0
$script:SkippedChecks = 0
$script:BlockedChecks = 0
$script:RemoteBranchVerified = $false
$script:RemoteTagVerified = $false
$script:JsDelivrVerified = $false
$script:ResumePublishedRelease = $false
$script:PublishedTagCommit = $null

# PowerShell 7 deployment wrapper. R7 retains the native Windows certificate-store trust from R6,
# fixes explicit UTF-8 decoding in the Windows browser-test harness, and narrows bounded test repairs.

# Minimal, inspection-proven repairs for the existing implementation scripts.
# 1. build_black_hole.py currently hard-codes GITHUB_WRITE_BLOCKED_2026-08-06 instead of a real source commit.
# 2. test_black_hole.py currently expects deploymentReady=False, which becomes wrong after successful acquisition.
# 3. test_black_hole_browser.py hard-codes /usr/bin/chromium and reads UTF-8 release files with the Windows locale default.
$CorrectedBuildScriptBase64 = 'IyEvdXNyL2Jpbi9lbnYgcHl0aG9uMwpmcm9tIF9fZnV0dXJlX18gaW1wb3J0IGFubm90YXRpb25zCmltcG9ydCBhcmdwYXJzZSwgaGFzaGxpYiwganNvbiwgb3MsIHJlLCBzaHV0aWwsIHN1YnByb2Nlc3MsIHN5cwpmcm9tIGRhdGV0aW1lIGltcG9ydCBkYXRldGltZSwgdGltZXpvbmUKZnJvbSBwYXRobGliIGltcG9ydCBQYXRoCmltcG9ydCB5YW1sCmZyb20ganNvbnNjaGVtYSBpbXBvcnQgRHJhZnQyMDIwMTJWYWxpZGF0b3IKClJPT1Q9UGF0aChfX2ZpbGVfXykucmVzb2x2ZSgpLnBhcmVudHNbMV0KUkVMRUFTRT0ndjAuMS4wLWJsYWNrLWhvbGUtbGFiLjEnCkRJU1Q9Uk9PVC8nZGlzdCcvUkVMRUFTRQpDRE49ZidodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvZ2gvUHJvZmVzc29yTWludHkvSHVnaGVzV2ViQXNzZXRzQHtSRUxFQVNFfS9kaXN0L3tSRUxFQVNFfScKCmRlZiByZXNvbHZlX3NvdXJjZV9jb21taXQoKS0+c3RyOgogICAgY2FuZGlkYXRlPW9zLmVudmlyb24uZ2V0KCdIUlZfUkVMRUFTRV9TT1VSQ0VfQ09NTUlUJywnJykuc3RyaXAoKS5sb3dlcigpCiAgICBpZiBub3QgY2FuZGlkYXRlOgogICAgICAgIHRyeToKICAgICAgICAgICAgY2FuZGlkYXRlPXN1YnByb2Nlc3MuY2hlY2tfb3V0cHV0KFsnZ2l0JywncmV2LXBhcnNlJywnSEVBRCddLGN3ZD1ST09ULHRleHQ9VHJ1ZSkuc3RyaXAoKS5sb3dlcigpCiAgICAgICAgZXhjZXB0IEV4Y2VwdGlvbiBhcyBleGM6CiAgICAgICAgICAgIHJhaXNlIFN5c3RlbUV4aXQoZidVbmFibGUgdG8gZGV0ZXJtaW5lIHJlbGVhc2Ugc291cmNlIGNvbW1pdDoge2V4Y30nKQogICAgaWYgbm90IHJlLmZ1bGxtYXRjaChyJ1swLTlhLWZdezQwfScsY2FuZGlkYXRlKToKICAgICAgICByYWlzZSBTeXN0ZW1FeGl0KCdSZWxlYXNlIHNvdXJjZSBjb21taXQgbXVzdCBiZSBhIGZ1bGwgNDAtY2hhcmFjdGVyIEdpdCBTSEEnKQogICAgcmV0dXJuIGNhbmRpZGF0ZQoKZGVmIGRpZ2VzdChwYXRoOlBhdGgpLT5zdHI6CiAgICBoPWhhc2hsaWIuc2hhMjU2KHBhdGgucmVhZF9ieXRlcygpKS5oZXhkaWdlc3QoKQogICAgcmV0dXJuIGgKCmRlZiB2YWxpZGF0ZShkYXRhLHNjaGVtYV9wYXRoLGxhYmVsKToKICAgIHNjaGVtYT1qc29uLmxvYWRzKHNjaGVtYV9wYXRoLnJlYWRfdGV4dChlbmNvZGluZz0ndXRmLTgnKSkKICAgIGVycm9ycz1zb3J0ZWQoRHJhZnQyMDIwMTJWYWxpZGF0b3Ioc2NoZW1hKS5pdGVyX2Vycm9ycyhkYXRhKSxrZXk9bGFtYmRhIGU6bGlzdChlLnBhdGgpKQogICAgaWYgZXJyb3JzOgogICAgICAgIGZvciBlIGluIGVycm9yczogcHJpbnQoZidbc2NoZW1hOntsYWJlbH1dIHtsaXN0KGUucGF0aCl9OiB7ZS5tZXNzYWdlfScsZmlsZT1zeXMuc3RkZXJyKQogICAgICAgIHJhaXNlIFN5c3RlbUV4aXQoMikKCmRlZiBjb3B5KHNyYzpQYXRoLGRlc3Q6UGF0aCk6CiAgICBkZXN0LnBhcmVudC5ta2RpcihwYXJlbnRzPVRydWUsZXhpc3Rfb2s9VHJ1ZSkKICAgIHNodXRpbC5jb3B5MihzcmMsZGVzdCkKCmRlZiBtYWluKCk6CiAgICBhcD1hcmdwYXJzZS5Bcmd1bWVudFBhcnNlcigpCiAgICBhcC5hZGRfYXJndW1lbnQoJy0tdmVyaWZ5LW9ubHknLGFjdGlvbj0nc3RvcmVfdHJ1ZScpCiAgICBhcmdzPWFwLnBhcnNlX2FyZ3MoKQoKICAgIGNvbnRlbnQ9eWFtbC5zYWZlX2xvYWQoKFJPT1QvJ2FwcHMvYmxhY2staG9sZS1tdXNldW0vY29udGVudC9ibGFjay1ob2xlLW11c2V1bS5zb3VyY2UueWFtbCcpLnJlYWRfdGV4dChlbmNvZGluZz0ndXRmLTgnKSkKICAgIGV4cGVyaWVuY2U9eWFtbC5zYWZlX2xvYWQoKFJPT1QvJ2FwcHMvYmxhY2staG9sZS1tdXNldW0vY29udGVudC9ibGFjay1ob2xlLWV4cGVyaWVuY2Uuc291cmNlLnlhbWwnKS5yZWFkX3RleHQoZW5jb2Rpbmc9J3V0Zi04JykpCiAgICBhc3NldHM9eWFtbC5zYWZlX2xvYWQoKFJPT1QvJ2FwcHMvYmxhY2staG9sZS1tdXNldW0vY29udGVudC9ibGFjay1ob2xlLWFzc2V0cy5zb3VyY2UueWFtbCcpLnJlYWRfdGV4dChlbmNvZGluZz0ndXRmLTgnKSkKICAgIHJvdXRlcz1qc29uLmxvYWRzKChST09ULydyZWdpc3RyeS9yb3V0ZXMuanNvbicpLnJlYWRfdGV4dChlbmNvZGluZz0ndXRmLTgnKSkKCiAgICB2YWxpZGF0ZShyb3V0ZXMsUk9PVC8nc2NoZW1hcy9yb3V0ZS1yZWdpc3RyeS5zY2hlbWEuanNvbicsJ3JvdXRlcycpCiAgICB2YWxpZGF0ZShjb250ZW50LFJPT1QvJ3NjaGVtYXMvYmxhY2staG9sZS1tdXNldW0uc2NoZW1hLmpzb24nLCdjb250ZW50JykKICAgIHZhbGlkYXRlKGV4cGVyaWVuY2UsUk9PVC8nc2NoZW1hcy9leHBlcmllbmNlLXByb2ZpbGUuc2NoZW1hLmpzb24nLCdleHBlcmllbmNlJykKICAgIHZhbGlkYXRlKGFzc2V0cyxST09ULydzY2hlbWFzL2JsYWNrLWhvbGUtYXNzZXRzLnNjaGVtYS5qc29uJywnYXNzZXRzJykKCiAgICBpZHM9W3NbJ2lkJ10gZm9yIHMgaW4gY29udGVudFsnc3RhdGlvbnMnXV0KICAgIGlmIGxlbihpZHMpIT1sZW4oc2V0KGlkcykpOiByYWlzZSBTeXN0ZW1FeGl0KCdEdXBsaWNhdGUgc3RhdGlvbiBpZHMnKQogICAgaWYgbGVuKGNvbnRlbnRbJ3N0YXRpb25zJ10pIT0xMDogcmFpc2UgU3lzdGVtRXhpdCgnRXhhY3RseSB0ZW4gc3RhdGlvbnMgYXJlIHJlcXVpcmVkJykKICAgIGlmIFtzWydudW1iZXInXSBmb3IgcyBpbiBjb250ZW50WydzdGF0aW9ucyddXSE9W2Yne2k6MDJkfScgZm9yIGkgaW4gcmFuZ2UoMSwxMSldOiByYWlzZSBTeXN0ZW1FeGl0KCdTdGF0aW9uIG51bWJlcmluZyBpcyBub3QgZGV0ZXJtaW5pc3RpYycpCgogICAgaWYgYXJncy52ZXJpZnlfb25seToKICAgICAgICBwcmludCgnW3ZlcmlmeV0gZnJpZW5kbHkgc291cmNlcyBhbmQgcm91dGUgcmVnaXN0cnkgYXJlIHZhbGlkJykKICAgICAgICByZXR1cm4gMAoKICAgIGlmIERJU1QuZXhpc3RzKCk6IHNodXRpbC5ybXRyZWUoRElTVCkKICAgIChESVNULydjb250ZW50JykubWtkaXIocGFyZW50cz1UcnVlKQogICAgKERJU1QvJ2Fzc2V0cycpLm1rZGlyKHBhcmVudHM9VHJ1ZSkKCiAgICBjb3B5KFJPT1QvJ3BhY2thZ2VzL3J1bnRpbWUtYm9vdHN0cmFwL3NyYy9pbmRleC5qcycsRElTVC8ncnVudGltZS1ib290c3RyYXAuanMnKQogICAgY29weShST09ULydhcHBzL2JsYWNrLWhvbGUtbXVzZXVtL3NyYy9pbmRleC5qcycsRElTVC8nYmxhY2staG9sZS1tdXNldW0uanMnKQogICAgY29weShST09ULydhcHBzL2JsYWNrLWhvbGUtbXVzZXVtL3NyYy9wYWdlLmNzcycsRElTVC8nYmxhY2staG9sZS1tdXNldW0uY3NzJykKCiAgICAjIEFkbWl0IHJlYWwgb3B0aW1pemVkIGRlcml2YXRpdmVzIG9ubHkgYWZ0ZXIgYWNxdWlzaXRpb24gbWFya3MgdGhlIGFzc2V0IGNvbXBsZXRlLgogICAgIyBJbiBhbiBvZmZsaW5lIGV2aWRlbmNlIGJ1aWxkLCBjb3B5IG9ubHkgdGhhdCBhc3NldCdzIGhvbmVzdCBzdHViLiBJbiBhIGRlcGxveW1lbnQtcmVhZHkKICAgICMgcmVsZWFzZSwgY29weSBldmVyeSBnZW5lcmF0ZWQgZGVyaXZhdGl2ZSBzbyB0aGUgaW1tdXRhYmxlIHRhZyBvd25zIHRoZSByZXNwb25zaXZlIG1lZGlhIHNldC4KICAgIHJ1bnRpbWVfYXNzZXRzPVtdCiAgICBmb3IgaXRlbSBpbiBhc3NldHNbJ2Fzc2V0cyddOgogICAgICAgIG91dD1kaWN0KGl0ZW0pCiAgICAgICAgb3V0WydzdHViJ109VHJ1ZQogICAgICAgIG91dFsnc3R1YlVybCddPWYne0NETn0vYXNzZXRzL3tpdGVtWyJpZCJdfS5zdmcnCiAgICAgICAgb3V0Wydsb2NhbFVybCddPW91dFsnc3R1YlVybCddCiAgICAgICAgaWYgaXRlbS5nZXQoJ2FjcXVpc2l0aW9uU3RhdHVzJyk9PSdjb21wbGV0ZScgYW5kIGl0ZW0uZ2V0KCdkZXJpdmF0aXZlcycpOgogICAgICAgICAgICBjaG9pY2VzPWl0ZW1bJ2Rlcml2YXRpdmVzJ10KICAgICAgICAgICAgcHVibGljX2Rlcml2YXRpdmVzPVtdCiAgICAgICAgICAgIGZvciBkZXJpdmF0aXZlIGluIGNob2ljZXM6CiAgICAgICAgICAgICAgICBzcmM9Uk9PVC9kZXJpdmF0aXZlWydwYXRoJ10KICAgICAgICAgICAgICAgIGRlc3Q9RElTVC8nYXNzZXRzJy9QYXRoKGRlcml2YXRpdmVbJ3BhdGgnXSkubmFtZQogICAgICAgICAgICAgICAgY29weShzcmMsZGVzdCkKICAgICAgICAgICAgICAgIHB1YmxpYz1kaWN0KGRlcml2YXRpdmUpCiAgICAgICAgICAgICAgICBwdWJsaWNbJ3VybCddPWYne0NETn0vYXNzZXRzL3tkZXN0Lm5hbWV9JwogICAgICAgICAgICAgICAgcHVibGljX2Rlcml2YXRpdmVzLmFwcGVuZChwdWJsaWMpCiAgICAgICAgICAgIG91dFsnZGVyaXZhdGl2ZXMnXT1wdWJsaWNfZGVyaXZhdGl2ZXMKICAgICAgICAgICAgcHJlZmVycmVkPW5leHQoKGQgZm9yIGQgaW4gcHVibGljX2Rlcml2YXRpdmVzIGlmIGQuZ2V0KCd3aWR0aCcpPT0xMjgwIGFuZCBkLmdldCgnZm9ybWF0Jyk9PSd3ZWJwJyksTm9uZSkKICAgICAgICAgICAgaWYgaXRlbVsna2luZCddPT0ndmlkZW8nOgogICAgICAgICAgICAgICAgcHJlZmVycmVkPW5leHQoKGQgZm9yIGQgaW4gcHVibGljX2Rlcml2YXRpdmVzIGlmIGQuZ2V0KCdmb3JtYXQnKT09J3dlYm0nKSxOb25lKSBvciBuZXh0KChkIGZvciBkIGluIHB1YmxpY19kZXJpdmF0aXZlcyBpZiBkLmdldCgnZm9ybWF0Jyk9PSdtcDQnKSxOb25lKQogICAgICAgICAgICAgICAgcG9zdGVyPW5leHQoKGQgZm9yIGQgaW4gcHVibGljX2Rlcml2YXRpdmVzIGlmIGQuZ2V0KCdmb3JtYXQnKT09J3dlYnAnKSxOb25lKQogICAgICAgICAgICAgICAgaWYgcG9zdGVyOiBvdXRbJ3Bvc3RlclVybCddPXBvc3RlclsndXJsJ10KICAgICAgICAgICAgaWYgcHJlZmVycmVkOgogICAgICAgICAgICAgICAgb3V0Wydsb2NhbFVybCddPXByZWZlcnJlZFsndXJsJ10KICAgICAgICAgICAgICAgIG91dFsnc3R1YiddPUZhbHNlCiAgICAgICAgZWxzZToKICAgICAgICAgICAgc3R1Yj1ST09ULydhcHBzL2JsYWNrLWhvbGUtbXVzZXVtL2Fzc2V0cy9zdHVicycvZid7aXRlbVsiaWQiXX0uc3ZnJwogICAgICAgICAgICBjb3B5KHN0dWIsRElTVC8nYXNzZXRzJy9zdHViLm5hbWUpCiAgICAgICAgcnVudGltZV9hc3NldHMuYXBwZW5kKG91dCkKCiAgICBidWlsdF9hdD1vcy5lbnZpcm9uLmdldCgnSFJWX0JVSUxEX1RJTUVTVEFNUCcpIG9yIGRhdGV0aW1lLm5vdyh0aW1lem9uZS51dGMpLnJlcGxhY2UobWljcm9zZWNvbmQ9MCkuaXNvZm9ybWF0KCkucmVwbGFjZSgnKzAwOjAwJywnWicpCiAgICBjb250ZW50WydnZW5lcmF0ZWRBdCddPWJ1aWx0X2F0CiAgICBleHBlcmllbmNlWydnZW5lcmF0ZWRBdCddPWJ1aWx0X2F0CiAgICBydW50aW1lX2Fzc2V0X21hbmlmZXN0PXsKICAgICAgJ3NjaGVtYVZlcnNpb24nOicxLjAnLAogICAgICAnZ2VuZXJhdGVkQXQnOmJ1aWx0X2F0LAogICAgICAncmV0cmlldmFsU3RhdHVzJzphc3NldHNbJ3JldHJpZXZhbFN0YXR1cyddLAogICAgICAncmV0cmlldmFsTm90ZSc6YXNzZXRzLmdldCgncmV0cmlldmFsTm90ZScsJycpLAogICAgICAnYXNzZXRzJzpydW50aW1lX2Fzc2V0cwogICAgfQoKICAgIChESVNULydjb250ZW50L2JsYWNrLWhvbGUtbXVzZXVtLmpzb24nKS53cml0ZV90ZXh0KGpzb24uZHVtcHMoY29udGVudCxpbmRlbnQ9MixlbnN1cmVfYXNjaWk9RmFsc2UpKydcbicsZW5jb2Rpbmc9J3V0Zi04JykKICAgIChESVNULydjb250ZW50L2JsYWNrLWhvbGUtZXhwZXJpZW5jZS5qc29uJykud3JpdGVfdGV4dChqc29uLmR1bXBzKGV4cGVyaWVuY2UsaW5kZW50PTIsZW5zdXJlX2FzY2lpPUZhbHNlKSsnXG4nLGVuY29kaW5nPSd1dGYtOCcpCiAgICAoRElTVC8nY29udGVudC9ibGFjay1ob2xlLWFzc2V0cy5qc29uJykud3JpdGVfdGV4dChqc29uLmR1bXBzKHJ1bnRpbWVfYXNzZXRfbWFuaWZlc3QsaW5kZW50PTIsZW5zdXJlX2FzY2lpPUZhbHNlKSsnXG4nLGVuY29kaW5nPSd1dGYtOCcpCgogICAgcmVsZWFzZT17CiAgICAgICdzY2hlbWFWZXJzaW9uJzonMS4wJywKICAgICAgJ3JlbGVhc2UnOicwLjEuMC1ibGFjay1ob2xlLWxhYi4xJywKICAgICAgJ2ltbXV0YWJsZVJlZic6UkVMRUFTRSwKICAgICAgJ2NvbW1pdCc6cmVzb2x2ZV9zb3VyY2VfY29tbWl0KCksCiAgICAgICdidWlsdEF0JzpidWlsdF9hdCwKICAgICAgJ21pbmltdW1Cb290c3RyYXBWZXJzaW9uJzonMC4xLjAnLAogICAgICAnZGVwbG95bWVudFJlYWR5Jzphc3NldHNbJ3JldHJpZXZhbFN0YXR1cyddPT0nY29tcGxldGUnLAogICAgICAncGFnZVN5c3RlbXMnOnsKICAgICAgICAnYmxhY2staG9sZS1tdXNldW0nOnsKICAgICAgICAgICdzY3JpcHQnOnsndXJsJzpmJ3tDRE59L2JsYWNrLWhvbGUtbXVzZXVtLmpzJywndHlwZSc6J21vZHVsZScsJ3NoYTI1Nic6ZGlnZXN0KERJU1QvJ2JsYWNrLWhvbGUtbXVzZXVtLmpzJyl9LAogICAgICAgICAgJ3N0eWxlJzp7J3VybCc6Zid7Q0ROfS9ibGFjay1ob2xlLW11c2V1bS5jc3MnLCdzaGEyNTYnOmRpZ2VzdChESVNULydibGFjay1ob2xlLW11c2V1bS5jc3MnKX0sCiAgICAgICAgICAnY29udGVudCc6eyd1cmwnOmYne0NETn0vY29udGVudC9ibGFjay1ob2xlLW11c2V1bS5qc29uJywnc2NoZW1hVmVyc2lvbic6JzEuMCcsJ3NoYTI1Nic6ZGlnZXN0KERJU1QvJ2NvbnRlbnQvYmxhY2staG9sZS1tdXNldW0uanNvbicpfSwKICAgICAgICAgICdhc3NldHMnOnsndXJsJzpmJ3tDRE59L2NvbnRlbnQvYmxhY2staG9sZS1hc3NldHMuanNvbicsJ3NjaGVtYVZlcnNpb24nOicxLjAnLCdzaGEyNTYnOmRpZ2VzdChESVNULydjb250ZW50L2JsYWNrLWhvbGUtYXNzZXRzLmpzb24nKX0sCiAgICAgICAgICAnZXhwZXJpZW5jZSc6eyd1cmwnOmYne0NETn0vY29udGVudC9ibGFjay1ob2xlLWV4cGVyaWVuY2UuanNvbicsJ3NjaGVtYVZlcnNpb24nOicxLjAnLCdzaGEyNTYnOmRpZ2VzdChESVNULydjb250ZW50L2JsYWNrLWhvbGUtZXhwZXJpZW5jZS5qc29uJyl9CiAgICAgICAgfQogICAgICB9LAogICAgICAnYm9vdHN0cmFwJzp7J3VybCc6Zid7Q0ROfS9ydW50aW1lLWJvb3RzdHJhcC5qcycsJ3NoYTI1Nic6ZGlnZXN0KERJU1QvJ3J1bnRpbWUtYm9vdHN0cmFwLmpzJyl9LAogICAgICAncm9sbGJhY2tSZWxlYXNlJzonbmF0aXZlLWZhbGxiYWNrJwogICAgfQogICAgdmFsaWRhdGUocmVsZWFzZSxST09ULydzY2hlbWFzL3JlbGVhc2UtbWFuaWZlc3Quc2NoZW1hLmpzb24nLCdyZWxlYXNlJykKICAgIChESVNULydyZWxlYXNlLmpzb24nKS53cml0ZV90ZXh0KGpzb24uZHVtcHMocmVsZWFzZSxpbmRlbnQ9MikrJ1xuJyxlbmNvZGluZz0ndXRmLTgnKQoKICAgIGNoYW5uZWw9ewogICAgICAnc2NoZW1hVmVyc2lvbic6JzEuMCcsCiAgICAgICdjaGFubmVsJzonYmxhY2staG9sZS1sYWInLAogICAgICAnY3VycmVudFJlbGVhc2UnOnsnaWQnOnJlbGVhc2VbJ3JlbGVhc2UnXSwnbWFuaWZlc3RVcmwnOmYne0NETn0vcmVsZWFzZS5qc29uJywnaW1tdXRhYmxlUmVmJzpSRUxFQVNFfSwKICAgICAgJ3ByZXZpb3VzUmVsZWFzZSc6eydpZCc6J25hdGl2ZS1mYWxsYmFjaycsJ21hbmlmZXN0VXJsJzpOb25lfQogICAgfQogICAgKFJPT1QvJ2NoYW5uZWxzL2JsYWNrLWhvbGUtbGFiLmpzb24nKS53cml0ZV90ZXh0KGpzb24uZHVtcHMoY2hhbm5lbCxpbmRlbnQ9MikrJ1xuJyxlbmNvZGluZz0ndXRmLTgnKQogICAgKERJU1QvJ2NoYW5uZWwuanNvbicpLndyaXRlX3RleHQoanNvbi5kdW1wcyhjaGFubmVsLGluZGVudD0yKSsnXG4nLGVuY29kaW5nPSd1dGYtOCcpCgogICAgcHJpbnQoZidbYnVpbGRdIHtSRUxFQVNFfScpCiAgICBwcmludChmJ1tidWlsZF0gZGVwbG95bWVudFJlYWR5PXtyZWxlYXNlWyJkZXBsb3ltZW50UmVhZHkiXX0nKQogICAgcHJpbnQoZidbYnVpbGRdIGZpbGVzPXtzdW0oMSBmb3IgcCBpbiBESVNULnJnbG9iKCIqIikgaWYgcC5pc19maWxlKCkpfScpCiAgICByZXR1cm4gMAoKaWYgX19uYW1lX189PSdfX21haW5fXyc6IHJhaXNlIFN5c3RlbUV4aXQobWFpbigpKQo='
$CorrectedRepositoryTestBase64 = 'IyEvdXNyL2Jpbi9lbnYgcHl0aG9uMwpmcm9tIF9fZnV0dXJlX18gaW1wb3J0IGFubm90YXRpb25zCmltcG9ydCBqc29uLCByZSwgc3VicHJvY2Vzcywgc3lzCmZyb20ganNvbnNjaGVtYSBpbXBvcnQgRHJhZnQyMDIwMTJWYWxpZGF0b3IKZnJvbSBwYXRobGliIGltcG9ydCBQYXRoClJPT1Q9UGF0aChfX2ZpbGVfXykucmVzb2x2ZSgpLnBhcmVudHNbMV0KUkVMRUFTRT0ndjAuMS4wLWJsYWNrLWhvbGUtbGFiLjEnCkRJU1Q9Uk9PVC8nZGlzdCcvUkVMRUFTRQpmYWlsdXJlcz1bXQpwYXNzZXM9MAoKZGVmIGNoZWNrKGNvbmQsbXNnKToKICAgIGdsb2JhbCBwYXNzZXMKICAgIGlmIGNvbmQ6CiAgICAgICAgcGFzc2VzKz0xO3ByaW50KCdbUEFTU10nLG1zZykKICAgIGVsc2U6IGZhaWx1cmVzLmFwcGVuZChtc2cpO3ByaW50KCdbRkFJTF0nLG1zZykKCmRlZiBsb2FkKHBhdGgpOiByZXR1cm4ganNvbi5sb2FkcyhwYXRoLnJlYWRfdGV4dChlbmNvZGluZz0ndXRmLTgnKSkKCmNvbnRlbnQ9bG9hZChESVNULydjb250ZW50L2JsYWNrLWhvbGUtbXVzZXVtLmpzb24nKQphc3NldHM9bG9hZChESVNULydjb250ZW50L2JsYWNrLWhvbGUtYXNzZXRzLmpzb24nKQpyZWxlYXNlPWxvYWQoRElTVC8ncmVsZWFzZS5qc29uJykKcm91dGVzPWxvYWQoUk9PVC8ncmVnaXN0cnkvcm91dGVzLmpzb24nKQpodG1sPShST09ULydkb2NzL2RlcGxveW1lbnQvYmxhY2staG9sZS1tdXNldW0tZWR1YmxvZ3MtYmxvY2suaHRtbCcpLnJlYWRfdGV4dChlbmNvZGluZz0ndXRmLTgnKQpjc3M9KERJU1QvJ2JsYWNrLWhvbGUtbXVzZXVtLmNzcycpLnJlYWRfdGV4dChlbmNvZGluZz0ndXRmLTgnKQpib290c3RyYXA9KERJU1QvJ3J1bnRpbWUtYm9vdHN0cmFwLmpzJykucmVhZF90ZXh0KGVuY29kaW5nPSd1dGYtOCcpCmFwcD0oRElTVC8nYmxhY2staG9sZS1tdXNldW0uanMnKS5yZWFkX3RleHQoZW5jb2Rpbmc9J3V0Zi04JykKCmNoZWNrKGxlbihjb250ZW50WydzdGF0aW9ucyddKT09MTAsJ3RlbiBleGhpYml0IHN0YXRpb25zIGdlbmVyYXRlZCcpCmNoZWNrKGxlbih7c1snaWQnXSBmb3IgcyBpbiBjb250ZW50WydzdGF0aW9ucyddfSk9PTEwLCdzdGF0aW9uIGlkcyBhcmUgdW5pcXVlJykKY2hlY2socm91dGVzWydyb3V0ZXMnXVswXVsncGF0aCddPT0nL3JlcG9zaXRvcnktcGFnZS1sYWIvJywncm91dGUgaXMgZXhhY3QgYW5kIGhvc3RuYW1lLW5ldXRyYWwnKQpjaGVjayhyb3V0ZXNbJ3JvdXRlcyddWzBdWydtb3VudElkJ109PSdocnYtYmxhY2staG9sZS1tdXNldW0tcm9vdCcsJ21vdW50IGlkIG1hdGNoZXMgYXBwcm92ZWQgY29udHJhY3QnKQpjaGVjaygnQG1haW4vJyBub3QgaW4ganNvbi5kdW1wcyhyZWxlYXNlKSwncmVsZWFzZSBjb250YWlucyBubyBtdXRhYmxlIEBtYWluIHJlZmVyZW5jZScpCmNoZWNrKCdAbGF0ZXN0Lycgbm90IGluIGpzb24uZHVtcHMocmVsZWFzZSksJ3JlbGVhc2UgY29udGFpbnMgbm8gbXV0YWJsZSBsYXRlc3QgcmVmZXJlbmNlJykKY2hlY2soJ0B2MC4xLjAtYmxhY2staG9sZS1sYWIuMS8nIGluIGpzb24uZHVtcHMocmVsZWFzZSksJ3JlbGVhc2UgVVJMcyB1c2UgdGhlIGltbXV0YWJsZSBzZW1hbnRpYyByZWYnKQpjaGVjaygnaHJ2LWJsYWNrLWhvbGUtbXVzZXVtLXJvb3QnIGluIGh0bWwsJ2hhbmRvZmYgY29udGFpbnMgdGhlIGV4YWN0IG1vdW50IHJvb3QnKQpjaGVjaygnZGF0YS1ocnYtZmFsbGJhY2snIGluIGh0bWwgYW5kICc8bm9zY3JpcHQ+JyBpbiBodG1sLCdoYW5kb2ZmIGNvbnRhaW5zIHJlYWRhYmxlIGZhbGxiYWNrIGFuZCBub3NjcmlwdCBzdGF0ZScpCmNoZWNrKCdTSU1VTEFURUQgQ0xBU1NST09NIFJFQ0FQJyBpbiBodG1sLCdoYW5kb2ZmIHZpc2libHkgbGFiZWxzIGR1bW15IHJlY2FwJykKY2hlY2soJ3J1bnRpbWUtYm9vdHN0cmFwLmpzJyBpbiBodG1sIGFuZCAncmVsZWFzZS5qc29uJyBpbiBodG1sLCdoYW5kb2ZmIGxvYWRzIG1pbmltYWwgYm9vdHN0cmFwIGFuZCBleGFjdCByZWxlYXNlJykKY2hlY2soJ1RPRE8nIG5vdCBpbiBodG1sIGFuZCAnUExBQ0VIT0xERVJfVVJMJyBub3QgaW4gaHRtbCwnaGFuZG9mZiBoYXMgbm8gVE9ETyBvciBVUkwgcGxhY2Vob2xkZXInKQpjaGVjayhjc3MubHN0cmlwKCkuc3RhcnRzd2l0aCgnI2hydi1ibGFjay1ob2xlLW11c2V1bS1yb290JyksJ0NTUyBiZWdpbnMgdW5kZXIgdGhlIHVuaXF1ZSBtb3VudCByb290JykKY2hlY2soJ2h0bWwuaHJ2LXJvdXRlLWJsYWNrLWhvbGUtbGFiLXJlYWR5JyBpbiBjc3MsJ29ubHkgcm91dGUtcmVhZHkgY29tcGF0aWJpbGl0eSBjbGFzcyB0b3VjaGVzIGh0bWwnKQpjaGVjaygncHJlZmVycy1yZWR1Y2VkLW1vdGlvbicgaW4gY3NzLCdTdGlsbCBNdXNldW0gcmVkdWNlZC1tb3Rpb24gcnVsZXMgZXhpc3QnKQpjaGVjaygnbWF4LXdpZHRoOjQzMHB4JyBpbiBjc3MgYW5kICdtYXgtd2lkdGg6NzY3cHgnIGluIGNzcywncGhvbmUgcmVzcG9uc2l2ZSBydWxlcyBleGlzdCcpCmNoZWNrKCdmb2N1cy12aXNpYmxlJyBpbiBjc3MsJ3Zpc2libGUga2V5Ym9hcmQgZm9jdXMgc3R5bGVzIGV4aXN0JykKY2hlY2soJ3JlcGxhY2VDaGlsZHJlbihmcmFnbWVudCknIGluIGFwcCwncmVuZGVyZXIgY29tbWl0cyBhIGRldGFjaGVkIGZyYWdtZW50IGluIG9uZSBjb250cm9sbGVkIG9wZXJhdGlvbicpCmNoZWNrKCdTdGF0aW9uIGZhaWxlZCcgaW4gYXBwLCdzdGF0aW9uLWxldmVsIGZhaWx1cmUgaXNvbGF0aW9uIGV4aXN0cycpCmNoZWNrKCd3aW5kb3dbS0VZXScgaW4gYm9vdHN0cmFwLCdib290c3RyYXAgc2luZ2xldG9uIGd1YXJkIGV4aXN0cycpCmNoZWNrKCdwYXRoICE9PSBleHBlY3RlZFBhdGgnIGluIGJvb3RzdHJhcCwnYm9vdHN0cmFwIGV4YWN0IHJvdXRlIGdhdGUgZXhpc3RzJykKY2hlY2soJ2ZhbGxiYWNrLW1pc3NpbmcnIGluIGJvb3RzdHJhcCwnYm9vdHN0cmFwIHJlZnVzZXMgdG8gZW5oYW5jZSBhbiBlbXB0eSBzaGVsbCcpCmNoZWNrKGxlbihhc3NldHNbJ2Fzc2V0cyddKT09MTIsJ2FsbCB0d2VsdmUgYXBwcm92ZWQgY29yZSBtZWRpYSByZWNvcmRzIGFyZSBwcmVzZW50JykKY2hlY2soYWxsKGEuZ2V0KCdjcmVkaXQnKSBhbmQgYS5nZXQoJ2NsYXNzaWZpY2F0aW9uJykgYW5kIGEuZ2V0KCdzb3VyY2VQYWdlJykgZm9yIGEgaW4gYXNzZXRzWydhc3NldHMnXSksJ2V2ZXJ5IG1lZGlhIHJlY29yZCBoYXMgY3JlZGl0LCBjbGFzc2lmaWNhdGlvbiwgYW5kIHNvdXJjZScpCmNoZWNrKGFsbChhLmdldCgnYWx0JykgYW5kIGEuZ2V0KCdjYXB0aW9uJykgZm9yIGEgaW4gYXNzZXRzWydhc3NldHMnXSksJ2V2ZXJ5IG1lZGlhIHJlY29yZCBoYXMgYWx0IHRleHQgYW5kIGNhcHRpb24nKQpmb3IganMgaW4gW0RJU1QvJ3J1bnRpbWUtYm9vdHN0cmFwLmpzJyxESVNULydibGFjay1ob2xlLW11c2V1bS5qcyddOgogICAgcmVzdWx0PXN1YnByb2Nlc3MucnVuKFsnbm9kZScsJy0tY2hlY2snLHN0cihqcyldLGNhcHR1cmVfb3V0cHV0PVRydWUsdGV4dD1UcnVlKQogICAgY2hlY2socmVzdWx0LnJldHVybmNvZGU9PTAsZidKYXZhU2NyaXB0IHN5bnRheCB2YWxpZDoge2pzLm5hbWV9JykKY2hlY2socmVsZWFzZVsnZGVwbG95bWVudFJlYWR5J10gaXMgVHJ1ZSwncmVsZWFzZSBpcyBkZXBsb3ltZW50LXJlYWR5IGFmdGVyIGF1dGhvcml0YXRpdmUgYXNzZXRzIHdlcmUgYWNxdWlyZWQgYW5kIHZhbGlkYXRlZCcpCmNoZWNrKGFzc2V0cy5nZXQoJ3JldHJpZXZhbFN0YXR1cycpPT0nY29tcGxldGUnLCdydW50aW1lIGFzc2V0IGxlZGdlciByZXBvcnRzIGNvbXBsZXRlIGF1dGhvcml0YXRpdmUgYWNxdWlzaXRpb24nKQpjaGVjayhhbGwobm90IGEuZ2V0KCdzdHViJykgZm9yIGEgaW4gYXNzZXRzWydhc3NldHMnXSksJ3J1bnRpbWUgYXNzZXQgbGVkZ2VyIGNvbnRhaW5zIG5vIG9mZmxpbmUgYWNxdWlzaXRpb24gc3R1YnMnKQpjaGVjayhhbGwoJ0B2MC4xLjAtYmxhY2staG9sZS1sYWIuMS8nIGluIGEuZ2V0KCdsb2NhbFVybCcsJycpIGZvciBhIGluIGFzc2V0c1snYXNzZXRzJ10pLCdldmVyeSBydW50aW1lIG1lZGlhIFVSTCB1c2VzIHRoZSBpbW11dGFibGUgcmVsZWFzZSByZWYnKQoKY29udGVudF9zY2hlbWE9bG9hZChST09ULydzY2hlbWFzL2JsYWNrLWhvbGUtbXVzZXVtLnNjaGVtYS5qc29uJykKdmFsaWRfZml4dHVyZT1sb2FkKFJPT1QvJ2ZpeHR1cmVzL2JsYWNrLWhvbGUtbXVzZXVtL3ZhbGlkLmpzb24nKQpiYWRfZml4dHVyZT1sb2FkKFJPT1QvJ2ZpeHR1cmVzL2JsYWNrLWhvbGUtbXVzZXVtL21hbGZvcm1lZC1taXNzaW5nLXN0YXRpb25zLmpzb24nKQp1bnN1cHBvcnRlZF9maXh0dXJlPWxvYWQoUk9PVC8nZml4dHVyZXMvYmxhY2staG9sZS1tdXNldW0vdW5zdXBwb3J0ZWQtc2NoZW1hLmpzb24nKQpjaGVjayhub3QgbGlzdChEcmFmdDIwMjAxMlZhbGlkYXRvcihjb250ZW50X3NjaGVtYSkuaXRlcl9lcnJvcnModmFsaWRfZml4dHVyZSkpLCd2YWxpZCBjb250ZW50IGZpeHR1cmUgcGFzc2VzIHNjaGVtYScpCmNoZWNrKGJvb2wobGlzdChEcmFmdDIwMjAxMlZhbGlkYXRvcihjb250ZW50X3NjaGVtYSkuaXRlcl9lcnJvcnMoYmFkX2ZpeHR1cmUpKSksJ21hbGZvcm1lZCBjb250ZW50IGZpeHR1cmUgaXMgcmVqZWN0ZWQnKQpjaGVjayhib29sKGxpc3QoRHJhZnQyMDIwMTJWYWxpZGF0b3IoY29udGVudF9zY2hlbWEpLml0ZXJfZXJyb3JzKHVuc3VwcG9ydGVkX2ZpeHR1cmUpKSksJ3Vuc3VwcG9ydGVkIHNjaGVtYSBmaXh0dXJlIGlzIHJlamVjdGVkJykKCmlmIGZhaWx1cmVzOgogICAgcHJpbnQoJ1xuRmFpbHVyZXM6JykKICAgIGZvciBmIGluIGZhaWx1cmVzOiBwcmludCgnLScsZikKICAgIHJhaXNlIFN5c3RlbUV4aXQoMSkKcHJpbnQoZidcblJlcG9zaXRvcnkgY2hlY2tzIHBhc3NlZDoge3Bhc3Nlc307IGZhaWxlZDoge2xlbihmYWlsdXJlcyl9LicpCg=='
$CorrectedBrowserTestBase64 = 'IyEvdXNyL2Jpbi9lbnYgcHl0aG9uMwpmcm9tIF9fZnV0dXJlX18gaW1wb3J0IGFubm90YXRpb25zCmltcG9ydCBqc29uCmZyb20gcGF0aGxpYiBpbXBvcnQgUGF0aApmcm9tIHBsYXl3cmlnaHQuc3luY19hcGkgaW1wb3J0IHN5bmNfcGxheXdyaWdodAoKUk9PVD1QYXRoKF9fZmlsZV9fKS5yZXNvbHZlKCkucGFyZW50c1sxXQpESVNUPVJPT1QvJ2Rpc3QvdjAuMS4wLWJsYWNrLWhvbGUtbGFiLjEnCkVWSURFTkNFPVJPT1QvJ2RvY3MvZXZpZGVuY2UvYmxhY2staG9sZS1tdXNldW0vdjAuMS4wLWJsYWNrLWhvbGUtbGFiLjEnCkVWSURFTkNFLm1rZGlyKHBhcmVudHM9VHJ1ZSxleGlzdF9vaz1UcnVlKQpjb250ZW50PWpzb24ubG9hZHMoKERJU1QvJ2NvbnRlbnQvYmxhY2staG9sZS1tdXNldW0uanNvbicpLnJlYWRfdGV4dChlbmNvZGluZz0ndXRmLTgnKSkKYXNzZXRzPWpzb24ubG9hZHMoKERJU1QvJ2NvbnRlbnQvYmxhY2staG9sZS1hc3NldHMuanNvbicpLnJlYWRfdGV4dChlbmNvZGluZz0ndXRmLTgnKSkKZXhwZXJpZW5jZT1qc29uLmxvYWRzKChESVNULydjb250ZW50L2JsYWNrLWhvbGUtZXhwZXJpZW5jZS5qc29uJykucmVhZF90ZXh0KGVuY29kaW5nPSd1dGYtOCcpKQpyZWxlYXNlPWpzb24ubG9hZHMoKERJU1QvJ3JlbGVhc2UuanNvbicpLnJlYWRfdGV4dChlbmNvZGluZz0ndXRmLTgnKSkKY3NzPShESVNULydibGFjay1ob2xlLW11c2V1bS5jc3MnKS5yZWFkX3RleHQoZW5jb2Rpbmc9J3V0Zi04JykKYXBwPShESVNULydibGFjay1ob2xlLW11c2V1bS5qcycpLnJlYWRfdGV4dChlbmNvZGluZz0ndXRmLTgnKS5yZXBsYWNlKCdleHBvcnQgYXN5bmMgZnVuY3Rpb24gbW91bnRCbGFja0hvbGVNdXNldW0nLCdhc3luYyBmdW5jdGlvbiBtb3VudEJsYWNrSG9sZU11c2V1bScpCnJlc3VsdHM9W10KCmRlZiByZWNvcmQobmFtZSxvayxkZXRhaWw9JycpOgogICAgcmVzdWx0cy5hcHBlbmQoeyd0ZXN0JzpuYW1lLCdwYXNzZWQnOmJvb2wob2spLCdkZXRhaWwnOmRldGFpbH0pCiAgICBwcmludCgnW1BBU1NdJyBpZiBvayBlbHNlICdbRkFJTF0nLG5hbWUsZGV0YWlsKQoKZGVmIGxvYWQocGFnZSk6CiAgICBodG1sID0gIjwhZG9jdHlwZSBodG1sPjxodG1sPjxoZWFkPjxtZXRhIGNoYXJzZXQ9J3V0Zi04Jz48bWV0YSBuYW1lPSd2aWV3cG9ydCcgY29udGVudD0nd2lkdGg9ZGV2aWNlLXdpZHRoLGluaXRpYWwtc2NhbGU9MSc+PC9oZWFkPjxib2R5IHN0eWxlPSdtYXJnaW46MDtiYWNrZ3JvdW5kOiMwMjAzMGEnPjxzZWN0aW9uIGlkPSdocnYtYmxhY2staG9sZS1tdXNldW0tcm9vdCcgY2xhc3M9J2hydi1uYXRpdmUtZmFsbGJhY2snIGRhdGEtaHJ2LXBhZ2U9J3JlcG9zaXRvcnktcGFnZS1sYWItYmxhY2staG9sZXMnIGRhdGEtaHJ2LXBhZ2Utc3lzdGVtPSdibGFjay1ob2xlLW11c2V1bScgZGF0YS1ocnYtcmVsZWFzZS1jaGFubmVsPSdibGFjay1ob2xlLWxhYicgZGF0YS1ocnYtc2NoZW1hPScxLjAnPjxoMT5GYWxsYmFjazwvaDE+PGRpdiBkYXRhLWhydi1mYWxsYmFjaz5GYWxsYmFjayByZW1haW5zLjwvZGl2Pjwvc2VjdGlvbj48L2JvZHk+PC9odG1sPiIKICAgIHBhZ2Uuc2V0X2NvbnRlbnQoaHRtbCkKICAgIHBhZ2UuYWRkX3N0eWxlX3RhZyhjb250ZW50PWNzcykKICAgIHBhZ2UuYWRkX3NjcmlwdF90YWcoY29udGVudD1hcHApCiAgICBwYWdlLmV2YWx1YXRlKCIiImFzeW5jICh7cmVsZWFzZSxjb250ZW50LGFzc2V0cyxleHBlcmllbmNlfSkgPT4gewogICAgICBhd2FpdCBtb3VudEJsYWNrSG9sZU11c2V1bSh7bW91bnQ6ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hydi1ibGFjay1ob2xlLW11c2V1bS1yb290JykscmVsZWFzZSxjb250ZW50LGFzc2V0cyxleHBlcmllbmNlfSk7CiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdocnYtcm91dGUtYmxhY2staG9sZS1sYWItcmVhZHknKTsKICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmRhdGFzZXQuaGFybmVzc1JlYWR5PSd0cnVlJzsKICAgIH0iIiIseydyZWxlYXNlJzpyZWxlYXNlLCdjb250ZW50Jzpjb250ZW50LCdhc3NldHMnOmFzc2V0cywnZXhwZXJpZW5jZSc6ZXhwZXJpZW5jZX0pCgp3aXRoIHN5bmNfcGxheXdyaWdodCgpIGFzIHA6CiAgICBicm93c2VyPXAuY2hyb21pdW0ubGF1bmNoKGhlYWRsZXNzPVRydWUpCiAgICBjYXNlcz1bKCdkZXNrdG9wJywxNDQwLDEwMDAsRmFsc2UpLCgndGFibGV0Jyw4MjAsMTEwMCxGYWxzZSksKCdwaG9uZS0zMjAnLDMyMCw3NDAsRmFsc2UpLCgncmVkdWNlZC1tb3Rpb24nLDEyODAsOTAwLFRydWUpXQogICAgZm9yIG5hbWUsdyxoLHJlZHVjZWQgaW4gY2FzZXM6CiAgICAgIGNvbnRleHQ9YnJvd3Nlci5uZXdfY29udGV4dCh2aWV3cG9ydD17J3dpZHRoJzp3LCdoZWlnaHQnOmh9LHJlZHVjZWRfbW90aW9uPSdyZWR1Y2UnIGlmIHJlZHVjZWQgZWxzZSAnbm8tcHJlZmVyZW5jZScpCiAgICAgIHBhZ2U9Y29udGV4dC5uZXdfcGFnZSgpCiAgICAgIGxvYWQocGFnZSkKICAgICAgY291bnQ9cGFnZS5sb2NhdG9yKCcuYmhtLWNoYW1iZXInKS5jb3VudCgpCiAgICAgIHJlY29yZChuYW1lKycgdGVuIHN0YXRpb25zJyxjb3VudD09MTAsc3RyKGNvdW50KSkKICAgICAgb3ZlcmZsb3c9cGFnZS5ldmFsdWF0ZSgiZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFdpZHRoIDw9IHdpbmRvdy5pbm5lcldpZHRoICsgMiIpCiAgICAgIHJlY29yZChuYW1lKycgbm8gaG9yaXpvbnRhbCBvdmVyZmxvdycsb3ZlcmZsb3csZiJ7cGFnZS5ldmFsdWF0ZSgnZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFdpZHRoJyl9IC8ge3d9IikKICAgICAgZm9jdXNhYmxlPXBhZ2UubG9jYXRvcignYnV0dG9uLHNlbGVjdCxhW2hyZWZdLHN1bW1hcnksaW5wdXQnKS5jb3VudCgpCiAgICAgIHJlY29yZChuYW1lKycgaW50ZXJhY3RpdmUgY29udHJvbHMnLGZvY3VzYWJsZT49MjAsc3RyKGZvY3VzYWJsZSkpCiAgICAgIGlmIHJlZHVjZWQ6CiAgICAgICAgbW9kZT1wYWdlLmxvY2F0b3IoJy5iaG0tbXVzZXVtJykuZ2V0X2F0dHJpYnV0ZSgnZGF0YS1tb3Rpb24nKQogICAgICAgIHJlY29yZChuYW1lKycgc3RpbGwgbXVzZXVtIG1vZGUnLG1vZGU9PSdzdGlsbCcsc3RyKG1vZGUpKQogICAgICBwYWdlLnNjcmVlbnNob3QocGF0aD1zdHIoRVZJREVOQ0UvZid7bmFtZX0ucG5nJyksZnVsbF9wYWdlPVRydWUpCiAgICAgIGNvbnRleHQuY2xvc2UoKQogICAgY29udGV4dD1icm93c2VyLm5ld19jb250ZXh0KHZpZXdwb3J0PXsnd2lkdGgnOjEyODAsJ2hlaWdodCc6OTAwfSkKICAgIHBhZ2U9Y29udGV4dC5uZXdfcGFnZSgpO2xvYWQocGFnZSkKICAgIHBhZ2UuZXZhbHVhdGUoImRvY3VtZW50LmJvZHkuc3R5bGUuem9vbT0nMiciKQogICAgem9vbV9vdmVyZmxvdz1wYWdlLmV2YWx1YXRlKCJkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsV2lkdGggPD0gd2luZG93LmlubmVyV2lkdGggKyAyIikKICAgIHJlY29yZCgnMjAwIHBlcmNlbnQgem9vbSBubyBob3Jpem9udGFsIG92ZXJmbG93Jyx6b29tX292ZXJmbG93LGYie3BhZ2UuZXZhbHVhdGUoJ2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxXaWR0aCcpfSAvIDEyODAiKQogICAgem9vbV9jb250cm9scz1wYWdlLmxvY2F0b3IoJy5iaG0tY29udHJvbC1kb2NrIGJ1dHRvbiwuYmhtLWNvbnRyb2wtZG9jayBzZWxlY3QnKS5jb3VudCgpCiAgICByZWNvcmQoJzIwMCBwZXJjZW50IHpvb20gY29udHJvbHMgcmVtYWluIHByZXNlbnQnLHpvb21fY29udHJvbHM+PTQsc3RyKHpvb21fY29udHJvbHMpKQogICAgcGFnZS5zY3JlZW5zaG90KHBhdGg9c3RyKEVWSURFTkNFLyd6b29tLTIwMC5wbmcnKSxmdWxsX3BhZ2U9VHJ1ZSkKICAgIGNvbnRleHQuY2xvc2UoKQoKICAgIGNvbnRleHQ9YnJvd3Nlci5uZXdfY29udGV4dCh2aWV3cG9ydD17J3dpZHRoJzoxMjgwLCdoZWlnaHQnOjkwMH0pCiAgICBwYWdlPWNvbnRleHQubmV3X3BhZ2UoKTtsb2FkKHBhZ2UpCiAgICBwYWdlLmtleWJvYXJkLnByZXNzKCdUYWInKQogICAgdGFnPXBhZ2UuZXZhbHVhdGUoImRvY3VtZW50LmFjdGl2ZUVsZW1lbnQudGFnTmFtZSIpCiAgICByZWNvcmQoJ2tleWJvYXJkIGZpcnN0IGZvY3VzYWJsZSBleGlzdHMnLHRhZyBpbiAoJ0EnLCdCVVRUT04nLCdTRUxFQ1QnLCdJTlBVVCcsJ1NVTU1BUlknKSx0YWcpCiAgICBwYWdlLmxvY2F0b3IoJyNpbnZpc2libGUtc2t5LWF0cml1bSBidXR0b24nKS5udGgoMSkuZm9jdXMoKQogICAgb3V0bGluZT1wYWdlLmV2YWx1YXRlKCJnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpLm91dGxpbmVTdHlsZSIpCiAgICByZWNvcmQoJ2ZvY3VzZWQgY29udHJvbCBoYXMgdmlzaWJsZSBvdXRsaW5lJyxvdXRsaW5lIG5vdCBpbiAoJ25vbmUnLCcnKSxzdHIob3V0bGluZSkpCiAgICBwYWdlLmtleWJvYXJkLnByZXNzKCdFbnRlcicpCiAgICBwcmVzc2VkPXBhZ2UubG9jYXRvcignI2ludmlzaWJsZS1za3ktYXRyaXVtIGJ1dHRvbicpLm50aCgxKS5nZXRfYXR0cmlidXRlKCdhcmlhLXByZXNzZWQnKQogICAgcmVjb3JkKCdrZXlib2FyZCBhY3RpdmF0ZXMgbGVuc2luZyBzdGF0ZScscHJlc3NlZD09J3RydWUnLHN0cihwcmVzc2VkKSkKICAgIGRhdGFfYnV0dG9uPXBhZ2UuZ2V0X2J5X3JvbGUoJ2J1dHRvbicsbmFtZT0nVXNlIGVzc2VudGlhbC1jb250ZW50IG1vZGUnKQogICAgZGF0YV9idXR0b24uY2xpY2soKQogICAgZGF0YV9tb2RlPXBhZ2UubG9jYXRvcignLmJobS1tdXNldW0nKS5nZXRfYXR0cmlidXRlKCdkYXRhLWRhdGEtbW9kZScpCiAgICByZWNvcmQoJ3JlZHVjZWQtZGF0YSBlc3NlbnRpYWwtY29udGVudCBtb2RlJyxkYXRhX21vZGU9PSdlc3NlbnRpYWwnLHN0cihkYXRhX21vZGUpKQogICAgZmFsbGJhY2tfY29udGV4dD1icm93c2VyLm5ld19jb250ZXh0KHZpZXdwb3J0PXsnd2lkdGgnOjkwMCwnaGVpZ2h0Jzo3MDB9KQogICAgZmFsbGJhY2tfcGFnZT1mYWxsYmFja19jb250ZXh0Lm5ld19wYWdlKCkKICAgIGZhbGxiYWNrX3BhZ2Uuc2V0X2NvbnRlbnQoIjxzZWN0aW9uIGlkPSdocnYtYmxhY2staG9sZS1tdXNldW0tcm9vdCc+PGgxPkZhbGxiYWNrPC9oMT48ZGl2IGRhdGEtaHJ2LWZhbGxiYWNrPkZhbGxiYWNrIHJlbWFpbnMgcmVhZGFibGUuPC9kaXY+PG5vc2NyaXB0PkZhbGxiYWNrIG5vc2NyaXB0Ljwvbm9zY3JpcHQ+PC9zZWN0aW9uPiIpCiAgICB2aXNpYmxlPWZhbGxiYWNrX3BhZ2UubG9jYXRvcignW2RhdGEtaHJ2LWZhbGxiYWNrXScpLmlzX3Zpc2libGUoKQogICAgcmVjb3JkKCduYXRpdmUgZmFsbGJhY2sgaXMgcmVhZGFibGUgYmVmb3JlIGVuaGFuY2VtZW50Jyx2aXNpYmxlLHN0cih2aXNpYmxlKSkKICAgIGZhbGxiYWNrX2NvbnRleHQuY2xvc2UoKQogICAgYnJvd3Nlci5jbG9zZSgpCihFVklERU5DRS8nYnJvd3Nlci1yZXN1bHRzLmpzb24nKS53cml0ZV90ZXh0KGpzb24uZHVtcHMocmVzdWx0cyxpbmRlbnQ9MikrJ1xuJyxlbmNvZGluZz0ndXRmLTgnKQppZiBub3QgYWxsKHJbJ3Bhc3NlZCddIGZvciByIGluIHJlc3VsdHMpOiByYWlzZSBTeXN0ZW1FeGl0KDEpCg=='

function Initialize-Log {
    $parent = Split-Path -Parent $DeploymentLog
    if (-not (Test-Path -LiteralPath $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    @(
        '',
        ('=' * 100),
        ('Black Hole Museum deployment run started: {0}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')),
        ('PowerShell runtime: {0} {1}' -f $PSVersionTable.PSEdition,$PSVersionTable.PSVersion),
        ('WhatIf preview: {0}' -f $script:DryRun),
        ('=' * 100)
    ) | Add-Content -LiteralPath $DeploymentLog -Encoding UTF8
}

function Write-Log {
    param(
        [Parameter(Mandatory = $true)][string]$Message,
        [ValidateSet('INFO','PASS','WARN','ERROR','DETAIL','WHATIF')][string]$Level = 'INFO'
    )
    $line = '[{0}][{1}] {2}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Level, $Message
    Add-Content -LiteralPath $DeploymentLog -Value $line -Encoding UTF8
    switch ($Level) {
        'PASS'   { Write-Host $Message -ForegroundColor Green }
        'WARN'   { Write-Host $Message -ForegroundColor Yellow }
        'ERROR'  { Write-Host $Message -ForegroundColor Red }
        'DETAIL' { Write-Host $Message -ForegroundColor DarkGray }
        'WHATIF' { Write-Host $Message -ForegroundColor Cyan }
        default  { Write-Host $Message }
    }
}

function Write-Banner {
    param([string]$Title, [ValidateSet('Info','Success','Failure','WhatIf')][string]$Kind = 'Info')
    $color = 'Cyan'
    if ($Kind -eq 'Success') { $color = 'Green' }
    if ($Kind -eq 'Failure') { $color = 'Red' }
    if ($Kind -eq 'WhatIf') { $color = 'Yellow' }
    Write-Host ''
    Write-Host ('#' * 100) -ForegroundColor $color
    Write-Host ('#  {0}' -f $Title) -ForegroundColor $color
    Write-Host ('#' * 100) -ForegroundColor $color
}

function Start-Step {
    param([Parameter(Mandatory = $true)][string]$Title)
    $script:CurrentStep++
    $prefix = '[{0:D2}/{1:D2}]' -f $script:CurrentStep, $TotalSteps
    Write-Host ''
    Write-Host ('{0} {1}' -f $prefix, $Title) -ForegroundColor Cyan
    Write-Log ('{0} {1}' -f $prefix, $Title) 'INFO'
}

function Find-CommandPath {
    param([string[]]$Names)
    foreach ($name in $Names) {
        $command = Get-Command $name -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($command) {
            if ($command.Path) { return $command.Path }
            if ($command.Source) { return $command.Source }
        }
    }
    return $null
}

function Refresh-ProcessPath {
    $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $user = [Environment]::GetEnvironmentVariable('Path', 'User')
    $pieces = @()
    if ($machine) { $pieces += $machine }
    if ($user) { $pieces += $user }
    if ($env:Path) { $pieces += $env:Path }
    $env:Path = ($pieces -join ';')
}

function Invoke-External {
    param(
        [Parameter(Mandatory = $true)][string]$FilePath,
        [string[]]$Arguments = @(),
        [Parameter(Mandatory = $true)][string]$WorkingDirectory,
        [Parameter(Mandatory = $true)][string]$Description,
        [int[]]$AllowedExitCodes = @(0),
        [switch]$Mutating,
        [int]$HeartbeatSeconds = 30
    )

    $display = $FilePath
    if ($Arguments.Count -gt 0) { $display += ' ' + ($Arguments -join ' ') }
    if ($Mutating -and $script:DryRun) {
        Write-Log ('[WhatIf] Would run: {0}' -f $display) 'WHATIF'
        return [pscustomobject]@{ ExitCode = 0; Output = ''; Skipped = $true; Command = $display }
    }

    if (-not (Test-Path -LiteralPath $WorkingDirectory)) {
        throw ('Working directory does not exist for {0}: {1}' -f $Description, $WorkingDirectory)
    }

    Write-Log ('Running: {0}' -f $Description) 'INFO'
    Write-Log ('Command: {0}' -f $display) 'DETAIL'

    $marker = '__BHM_EXIT_{0}__=' -f ([guid]::NewGuid().ToString('N'))
    $argumentsJson = ConvertTo-Json -InputObject ([object[]]$Arguments) -Compress
    $job = Start-Job -ScriptBlock {
        param($Executable, $ArgumentsJson, $WorkDir, $ExitMarker)
        Set-Location -LiteralPath $WorkDir
        $decoded = ConvertFrom-Json -InputObject $ArgumentsJson
        $ArgList = @()
        if ($decoded -is [System.Array]) {
            $ArgList = @($decoded | ForEach-Object { [string]$_ })
        } elseif ($null -ne $decoded) {
            $ArgList = @([string]$decoded)
        }
        $exitCode = 999
        try {
            & $Executable @ArgList 2>&1 | ForEach-Object { [string]$_ }
            if ($null -eq $LASTEXITCODE) { $exitCode = 0 } else { $exitCode = [int]$LASTEXITCODE }
        } catch {
            Write-Output ([string]$_)
            $exitCode = 999
        }
        Write-Output ($ExitMarker + $exitCode)
    } -ArgumentList $FilePath, $argumentsJson, $WorkingDirectory, $marker

    $lines = [System.Collections.Generic.List[string]]::new()
    $exitCode = $null
    $started = Get-Date
    $lastVisibleOutput = $started
    $nextHeartbeat = $started.AddSeconds($HeartbeatSeconds)

    try {
        while ($job.State -eq 'Running') {
            $items = @(Receive-Job -Job $job)
            foreach ($item in $items) {
                $text = [string]$item
                if ($text.StartsWith($marker)) {
                    $exitCode = [int]$text.Substring($marker.Length)
                } elseif ($text.Length -gt 0) {
                    $lines.Add($text)
                    Write-Log ('  {0}' -f $text) 'DETAIL'
                    $lastVisibleOutput = Get-Date
                }
            }

            $now = Get-Date
            if ($now -ge $nextHeartbeat) {
                $elapsed = [int](($now - $started).TotalSeconds)
                $silent = [int](($now - $lastVisibleOutput).TotalSeconds)
                $activity = 'appears active because the PowerShell job is still Running'
                if ($silent -ge 90) { $activity = 'may be stalled because it has produced no visible output for more than 90 seconds' }
                Write-Log ('{0} is still running after {1}s; it {2}. No visible output for {3}s. Detailed output is also being recorded in {4}.' -f $Description, $elapsed, $activity, $silent, $DeploymentLog) 'WARN'
                $nextHeartbeat = $now.AddSeconds($HeartbeatSeconds)
            }
            Start-Sleep -Seconds 2
            $job = Get-Job -Id $job.Id
        }

        $items = @(Receive-Job -Job $job)
        foreach ($item in $items) {
            $text = [string]$item
            if ($text.StartsWith($marker)) {
                $exitCode = [int]$text.Substring($marker.Length)
            } elseif ($text.Length -gt 0) {
                $lines.Add($text)
                Write-Log ('  {0}' -f $text) 'DETAIL'
            }
        }
    } finally {
        Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
    }

    if ($null -eq $exitCode) {
        throw ('{0} ended without reporting an exit code.' -f $Description)
    }
    if ($AllowedExitCodes -notcontains $exitCode) {
        throw ('{0} failed with exit code {1}. See {2}.' -f $Description, $exitCode, $DeploymentLog)
    }

    Write-Log ('{0} completed with exit code {1}.' -f $Description, $exitCode) 'PASS'
    return [pscustomobject]@{ ExitCode = $exitCode; Output = ($lines -join "`r`n"); Skipped = $false; Command = $display }
}

function Ensure-WingetInstall {
    param([string]$DisplayName, [string]$PackageId, [string]$Mode = 'install')
    $winget = Find-CommandPath @('winget.exe','winget')
    if (-not $winget) {
        throw ('{0} is required, and winget is unavailable. Install {0} manually, then rerun.' -f $DisplayName)
    }
    if ($script:DryRun) {
        Write-Log ('[WhatIf] Would offer a winget {0} for {1} ({2}).' -f $Mode, $DisplayName, $PackageId) 'WHATIF'
        return
    }
    $answer = Read-Host ('{0} is missing or too old. Install/upgrade it with winget package {1}? [Y/N]' -f $DisplayName, $PackageId)
    if ($answer -notmatch '^(?i)y(?:es)?$') {
        throw ('Required tool installation declined: {0}' -f $DisplayName)
    }
    $verb = 'install'
    if ($Mode -eq 'upgrade') { $verb = 'upgrade' }
    $args = @($verb, '--id', $PackageId, '--exact', '--accept-package-agreements', '--accept-source-agreements')
    Invoke-External -FilePath $winget -Arguments $args -WorkingDirectory $env:USERPROFILE -Description ('winget {0} {1}' -f $verb, $DisplayName) -Mutating | Out-Null
    Refresh-ProcessPath
}

function Test-RemoteMatchesExpected {
    param([string]$RemoteUrl)
    if (-not $RemoteUrl) { return $false }
    return [bool]($RemoteUrl -match '(?i)(?:github\.com[:/])ProfessorMinty/HughesWebAssets(?:\.git)?/?$')
}

function Get-OriginUrl {
    param([string]$Repository)
    $result = Invoke-External -FilePath $script:GitPath -Arguments @('remote','get-url','origin') -WorkingDirectory $Repository -Description 'Reading Git origin URL' -AllowedExitCodes @(0,2)
    if ($result.ExitCode -ne 0) { return $null }
    return $result.Output.Trim()
}

function Search-HughesRepository {
    param([string]$ExplicitPath)
    $candidates = [System.Collections.Generic.List[string]]::new()
    if ($ExplicitPath) { $candidates.Add($ExplicitPath) }
    foreach ($candidate in @(
        'C:\Users\broke\Documents\HughesWebAssets',
        'C:\Users\broke\source\repos\HughesWebAssets',
        'C:\Users\broke\Documents\GitHub\HughesWebAssets',
        'C:\Users\broke\Desktop\HughesWebAssets'
    )) {
        if (-not $candidates.Contains($candidate)) { $candidates.Add($candidate) }
    }

    foreach ($candidate in $candidates) {
        if (Test-Path -LiteralPath (Join-Path $candidate '.git')) {
            $origin = Get-OriginUrl $candidate
            if (Test-RemoteMatchesExpected $origin) {
                return (Resolve-Path -LiteralPath $candidate).Path
            }
            if ($ExplicitPath -and ((Resolve-Path -LiteralPath $candidate).Path -eq (Resolve-Path -LiteralPath $ExplicitPath).Path)) {
                throw ('RepoPath points to a Git repository whose origin is not {0}. Found: {1}' -f $ExpectedRemoteSlug, $origin)
            }
        }
    }

    $roots = @('C:\Users\broke\Documents','C:\Users\broke\source\repos','C:\Users\broke\Documents\GitHub','C:\Users\broke\Desktop')
    foreach ($root in $roots) {
        if (-not (Test-Path -LiteralPath $root)) { continue }
        Write-Log ('Searching for HughesWebAssets under {0}' -f $root) 'DETAIL'
        $matches = @(Get-ChildItem -LiteralPath $root -Directory -Filter 'HughesWebAssets' -Recurse -ErrorAction SilentlyContinue)
        foreach ($match in $matches) {
            if (-not (Test-Path -LiteralPath (Join-Path $match.FullName '.git'))) { continue }
            $origin = Get-OriginUrl $match.FullName
            if (Test-RemoteMatchesExpected $origin) { return $match.FullName }
        }
    }
    return $null
}

function Convert-ToWindowsPath {
    param([string]$PathText)
    if ($null -eq $PathText) { return $null }
    return $PathText.Replace([char]'/', [char]'\')
}

function Convert-ToGitPath {
    param([string]$PathText)
    if ($null -eq $PathText) { return $null }
    return $PathText.Replace([char]'\', [char]'/')
}

function Get-GitStatusEntries {
    param([string]$Repository)
    $result = Invoke-External -FilePath $script:GitPath -Arguments @('status','--porcelain=v1','--untracked-files=all') -WorkingDirectory $Repository -Description 'Inspecting Git working tree'
    $entries = [System.Collections.Generic.List[object]]::new()
    foreach ($line in @($result.Output -split "`r?`n")) {
        if (-not $line -or $line.Length -lt 4) { continue }
        $status = $line.Substring(0,2)
        $path = $line.Substring(3).Trim()
        if ($path -match ' -> ') { $path = ($path -split ' -> ')[-1] }
        $path = Convert-ToWindowsPath ($path.Trim('"'))
        $entries.Add([pscustomobject]@{ Status = $status; Path = $path; BlackHoleOwned = (Test-BlackHoleOwnedPath $path) })
    }
    return $entries.ToArray()
}

function Test-BlackHoleOwnedPath {
    param([string]$RelativePath)
    $p = (Convert-ToWindowsPath $RelativePath).TrimStart([char[]]@([char]'.',[char]'\'))
    $exact = @(
        'package.json','README.md','IMPLEMENTATION_STATUS.md','Deploy-BlackHoleMuseum.ps1',
        'registry\routes.json','channels\black-hole-lab.json',
        'scripts\acquire_black_hole_assets.py','scripts\build_black_hole.py','scripts\test_black_hole.py','scripts\test_black_hole_browser.py',
        'tests\black-hole-local-harness.html'
    )
    if ($exact -contains $p) { return $true }
    foreach ($prefix in @(
        'apps\black-hole-museum\',
        'packages\runtime-bootstrap\',
        'packages\ui-foundation\',
        'fixtures\black-hole-museum\',
        'docs\architecture\black-hole-museum',
        'docs\deployment\black-hole-museum',
        'docs\rollback\black-hole-museum',
        'docs\evidence\black-hole-museum\',
        'dist\v0.1.0-black-hole-lab.1\'
    )) {
        if ($p.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) { return $true }
    }
    if ($p.StartsWith('schemas\', [System.StringComparison]::OrdinalIgnoreCase) -and $p -match '(route-registry|release-channel|release-manifest|black-hole-museum|black-hole-assets|experience-profile)\.schema\.json$') { return $true }
    return $false
}

function Assert-NoUnrelatedChanges {
    param([string]$Repository, [string]$Context)
    $entries = @(Get-GitStatusEntries $Repository)
    if ($entries.Count -eq 0) {
        Write-Log ('{0}: working tree is clean.' -f $Context) 'PASS'
        return @()
    }
    Write-Log ('{0}: found {1} uncommitted path(s).' -f $Context, $entries.Count) 'WARN'
    foreach ($entry in $entries) {
        $owner = 'UNRELATED'
        if ($entry.BlackHoleOwned) { $owner = 'black-hole implementation' }
        $level = 'ERROR'
        if ($entry.BlackHoleOwned) { $level = 'WARN' }
        Write-Log ('  {0} {1} [{2}]' -f $entry.Status, $entry.Path, $owner) $level
    }
    $unrelated = @($entries | Where-Object { -not $_.BlackHoleOwned })
    if ($unrelated.Count -gt 0) {
        throw 'Unrelated uncommitted work exists. Nothing was reset, stashed, deleted, overwritten, or committed. Resolve those paths and rerun.'
    }
    return $entries
}

function Ensure-RecoveryDirectory {
    if ($script:RecoveryDirectory) { return $script:RecoveryDirectory }
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $script:RecoveryDirectory = Join-Path $RecoveryBase $stamp
    if (-not $script:DryRun) {
        New-Item -ItemType Directory -Path $script:RecoveryDirectory -Force | Out-Null
    }
    return $script:RecoveryDirectory
}

function Backup-ExistingFile {
    param([string]$Path, [string]$RelativePath, [string]$Reason)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return }
    $recovery = Ensure-RecoveryDirectory
    $backupPath = Join-Path $recovery $RelativePath
    Write-Log ('Replacing existing file: {0} [black-hole implementation: {1}]' -f $RelativePath, (Test-BlackHoleOwnedPath $RelativePath)) 'WARN'
    if ($script:DryRun) {
        Write-Log ('[WhatIf] Would back up {0} to {1}' -f $Path, $backupPath) 'WHATIF'
    } else {
        $parent = Split-Path -Parent $backupPath
        if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
        Copy-Item -LiteralPath $Path -Destination $backupPath -Force
    }
    $script:RecoveryRecords.Add([pscustomobject]@{ path=$Path; relative=$RelativePath; backup=$backupPath; reason=$Reason; at=(Get-Date).ToString('o') })
}

function Get-Sha256 {
    param([string]$Path)
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Should-PreserveContinuationFile {
    param([string]$RelativePath, [string]$TargetPath, [string]$SourcePath)
    if (-not (Test-Path -LiteralPath $TargetPath -PathType Leaf)) { return $false }
    $p = Convert-ToWindowsPath $RelativePath
    if ($p.StartsWith('apps\black-hole-museum\assets\source\', [System.StringComparison]::OrdinalIgnoreCase)) { return $true }
    if ($p.StartsWith('apps\black-hole-museum\assets\derived\', [System.StringComparison]::OrdinalIgnoreCase)) { return $true }
    if ($p.StartsWith('docs\evidence\black-hole-museum\', [System.StringComparison]::OrdinalIgnoreCase)) { return $true }
    if ($p.StartsWith('dist\v0.1.0-black-hole-lab.1\', [System.StringComparison]::OrdinalIgnoreCase)) { return $true }
    if ($p -ieq 'apps\black-hole-museum\content\black-hole-assets.source.yaml') {
        $targetText = Get-Content -LiteralPath $TargetPath -Raw -ErrorAction SilentlyContinue
        $sourceText = Get-Content -LiteralPath $SourcePath -Raw -ErrorAction SilentlyContinue
        if (($targetText -match '(?m)^retrievalStatus:\s*complete\s*$') -and ($sourceText -notmatch '(?m)^retrievalStatus:\s*complete\s*$')) { return $true }
    }
    return $false
}

function Copy-OverlaySafely {
    param([string]$SourceRoot, [string]$TargetRoot)
    $sourceFiles = @(Get-ChildItem -LiteralPath $SourceRoot -File -Recurse -Force | Where-Object {
        $_.FullName -notmatch '[\\/](?:__pycache__|\.git|\.venv)[\\/]'
    })
    $copied = 0
    $same = 0
    $preserved = 0
    foreach ($file in $sourceFiles) {
        $relative = $file.FullName.Substring($SourceRoot.Length).TrimStart([char[]]@([char]'\',[char]'/'))
        $target = Join-Path $TargetRoot $relative
        if (Should-PreserveContinuationFile -RelativePath $relative -TargetPath $target -SourcePath $file.FullName) {
            Write-Log ('Preserving existing deployment-generated state instead of downgrading it from the offline overlay: {0}' -f $relative) 'DETAIL'
            $preserved++
            continue
        }
        if (Test-Path -LiteralPath $target -PathType Container) {
            throw ('Cannot copy file because target is a directory: {0}' -f $target)
        }
        if (Test-Path -LiteralPath $target -PathType Leaf) {
            if ((Get-Sha256 $file.FullName) -eq (Get-Sha256 $target)) { $same++; continue }
            Backup-ExistingFile -Path $target -RelativePath $relative -Reason 'repository overlay replacement'
        }
        if ($script:DryRun) {
            Write-Log ('[WhatIf] Would copy {0}' -f $relative) 'WHATIF'
        } else {
            $parent = Split-Path -Parent $target
            if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
            Copy-Item -LiteralPath $file.FullName -Destination $target -Force
        }
        $copied++
    }
    Write-Log ('Overlay copy summary: copied/replaced={0}, already-identical={1}, preserved continuation state={2}' -f $copied, $same, $preserved) 'PASS'
}

function Write-CorrectedScriptFromBase64 {
    param([string]$TargetPath, [string]$Base64, [string]$RelativePath, [string]$Reason, [string[]]$GoodMarkers)
    $current = Get-Content -LiteralPath $TargetPath -Raw
    $good = $true
    foreach ($marker in $GoodMarkers) {
        if ($current -notmatch [regex]::Escape($marker)) { $good = $false; break }
    }
    if ($good) {
        Write-Log ('Implementation script already contains the required repair: {0}' -f $RelativePath) 'PASS'
        return
    }
    Backup-ExistingFile -Path $TargetPath -RelativePath $RelativePath -Reason $Reason
    if ($script:DryRun) {
        Write-Log ('[WhatIf] Would apply bounded repair to {0}: {1}' -f $RelativePath, $Reason) 'WHATIF'
        return
    }
    $bytes = [Convert]::FromBase64String($Base64)
    [IO.File]::WriteAllBytes($TargetPath, $bytes)
    $after = Get-Content -LiteralPath $TargetPath -Raw
    foreach ($marker in $GoodMarkers) {
        if ($after -notmatch [regex]::Escape($marker)) { throw ('Repair verification failed for {0}; missing marker {1}' -f $RelativePath, $marker) }
    }
    Write-Log ('Applied bounded repair to {0}: {1}' -f $RelativePath, $Reason) 'PASS'
}

function Repair-ImplementationScripts {
    param([string]$Root)
    $buildPath = Join-Path $Root 'scripts\build_black_hole.py'
    $repoTestPath = Join-Path $Root 'scripts\test_black_hole.py'
    $browserPath = Join-Path $Root 'scripts\test_black_hole_browser.py'

    Write-CorrectedScriptFromBase64 -TargetPath $buildPath -Base64 $CorrectedBuildScriptBase64 -RelativePath 'scripts\build_black_hole.py' -Reason 'The existing builder hard-codes a blocked placeholder commit and ignores the deployment source commit/timestamp.' -GoodMarkers @('resolve_source_commit()','HRV_RELEASE_SOURCE_COMMIT','HRV_BUILD_TIMESTAMP')
    Write-CorrectedScriptFromBase64 -TargetPath $repoTestPath -Base64 $CorrectedRepositoryTestBase64 -RelativePath 'scripts\test_black_hole.py' -Reason 'The existing repository test expects deploymentReady=False, which is incorrect after successful authoritative asset acquisition.' -GoodMarkers @("release['deploymentReady'] is True",'authoritative assets were acquired and validated')
    Write-CorrectedScriptFromBase64 -TargetPath $browserPath -Base64 $CorrectedBrowserTestBase64 -RelativePath 'scripts\test_black_hole_browser.py' -Reason 'The existing browser test must use Playwright-managed Chromium and explicitly decode generated UTF-8 release files on Windows.' -GoodMarkers @('p.chromium.launch(headless=True)', "read_text(encoding='utf-8')")
}

function Resolve-SystemPython {
    $py = Find-CommandPath @('py.exe','py')
    if ($py) {
        try {
            $result = Invoke-External -FilePath $py -Arguments @('-3','-c','import sys; print(sys.executable)') -WorkingDirectory $env:USERPROFILE -Description 'Resolving Python 3 interpreter through py launcher' -AllowedExitCodes @(0,1,103,9009)
            if ($result.ExitCode -eq 0) {
                $candidate = ($result.Output -split "`r?`n" | Where-Object { $_ -match '\.exe$' } | Select-Object -Last 1)
                if ($candidate -and (Test-Path -LiteralPath $candidate)) { return $candidate.Trim() }
            }
        } catch { Write-Log ('Python launcher probe did not resolve a runtime: {0}' -f $_.Exception.Message) 'DETAIL' }
    }
    $python = Find-CommandPath @('python.exe','python')
    if ($python) {
        try {
            $result = Invoke-External -FilePath $python -Arguments @('-c','import sys; print(sys.executable)') -WorkingDirectory $env:USERPROFILE -Description 'Resolving Python interpreter' -AllowedExitCodes @(0,1,103,9009)
            if ($result.ExitCode -eq 0) {
                $candidate = ($result.Output -split "`r?`n" | Where-Object { $_ -match '\.exe$' } | Select-Object -Last 1)
                if ($candidate -and (Test-Path -LiteralPath $candidate)) { return $candidate.Trim() }
            }
        } catch { Write-Log ('python.exe probe did not resolve a runtime: {0}' -f $_.Exception.Message) 'DETAIL' }
    }
    return $null
}

function Ensure-RequiredSystemTools {
    $script:SystemPython = Resolve-SystemPython
    if (-not $script:SystemPython) {
        Ensure-WingetInstall -DisplayName 'Python 3.12' -PackageId 'Python.Python.3.12'
        $script:SystemPython = Resolve-SystemPython
        if (-not $script:SystemPython -and -not $script:DryRun) { throw 'Python installation completed but no usable Python interpreter was found in PATH.' }
    }

    $node = Find-CommandPath @('node.exe','node')
    $nodeTooOld = $false
    if ($node) {
        $nodeResult = Invoke-External -FilePath $node -Arguments @('--version') -WorkingDirectory $env:USERPROFILE -Description 'Checking Node.js version'
        $versionText = $nodeResult.Output.Trim().TrimStart('v')
        try { if ([version]$versionText -lt [version]'20.0.0') { $nodeTooOld = $true } } catch { $nodeTooOld = $true }
    }
    if (-not $node) {
        Ensure-WingetInstall -DisplayName 'Node.js LTS' -PackageId 'OpenJS.NodeJS.LTS'
        $node = Find-CommandPath @('node.exe','node')
    } elseif ($nodeTooOld) {
        Ensure-WingetInstall -DisplayName 'Node.js LTS 20 or newer' -PackageId 'OpenJS.NodeJS.LTS' -Mode 'upgrade'
        $node = Find-CommandPath @('node.exe','node')
    }
    if (-not $node -and -not $script:DryRun) { throw 'Node.js 20 or newer is required by package.json and the JavaScript syntax tests.' }

    $npm = Find-CommandPath @('npm.cmd','npm.exe','npm')
    if ($npm) {
        $npmResult = Invoke-External -FilePath $npm -Arguments @('--version') -WorkingDirectory $env:USERPROFILE -Description 'Checking npm availability'
        Write-Log ('npm is available ({0}). The current black-hole pipeline does not need npm package installation.' -f $npmResult.Output.Trim()) 'PASS'
    } elseif (-not $script:DryRun) {
        throw 'npm was not found after Node.js verification. The Node installation appears incomplete.'
    }

    $ffmpeg = Find-CommandPath @('ffmpeg.exe','ffmpeg')
    $ffprobe = Find-CommandPath @('ffprobe.exe','ffprobe')
    if (-not $ffmpeg -or -not $ffprobe) {
        Ensure-WingetInstall -DisplayName 'FFmpeg' -PackageId 'Gyan.FFmpeg'
        $ffmpeg = Find-CommandPath @('ffmpeg.exe','ffmpeg')
        $ffprobe = Find-CommandPath @('ffprobe.exe','ffprobe')
    }
    if ((-not $ffmpeg -or -not $ffprobe) -and -not $script:DryRun) { throw 'FFmpeg and ffprobe are required for the approved scientific video derivatives.' }

    if ($script:SystemPython) {
        $pythonVersion = Invoke-External -FilePath $script:SystemPython -Arguments @('--version') -WorkingDirectory $env:USERPROFILE -Description 'Checking Python version'
        Write-Log ('Python: {0}' -f $pythonVersion.Output.Trim()) 'PASS'
    }
    if ($node) { Write-Log ('Node.js path: {0}' -f $node) 'PASS' }
    if ($ffmpeg) { Write-Log ('FFmpeg path: {0}' -f $ffmpeg) 'PASS' }
    $gh = Find-CommandPath @('gh.exe','gh')
    if ($gh) {
        $ghVersion = Invoke-External -FilePath $gh -Arguments @('--version') -WorkingDirectory $env:USERPROFILE -Description 'Checking optional GitHub CLI' -AllowedExitCodes @(0,1)
        Write-Log ('GitHub CLI is available: {0}' -f (($ghVersion.Output -split "`r?`n")[0])) 'PASS'
    } else {
        Write-Log 'GitHub CLI is not installed. It is optional; Git push will use the existing local Git authentication.' 'INFO'
    }
}

function Ensure-PythonEnvironment {
    if ($script:DryRun) {
        Write-Log ('[WhatIf] Would create/reuse isolated Python venv at {0}, install only missing PyYAML/jsonschema/Pillow/playwright/truststore packages, and ensure Playwright Chromium is installed.' -f $VenvRoot) 'WHATIF'
        return
    }
    if (-not $script:SystemPython) { throw 'System Python was not resolved.' }
    $venvPython = Join-Path $VenvRoot 'Scripts\python.exe'
    if (-not (Test-Path -LiteralPath $venvPython)) {
        $parent = Split-Path -Parent $VenvRoot
        if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
        Invoke-External -FilePath $script:SystemPython -Arguments @('-m','venv',$VenvRoot) -WorkingDirectory $env:USERPROFILE -Description 'Creating isolated Black Hole Museum Python environment' -Mutating | Out-Null
    }
    if (-not (Test-Path -LiteralPath $venvPython)) { throw ('Virtual environment Python was not created: {0}' -f $venvPython) }
    $script:VenvPython = $venvPython

    $pip = Invoke-External -FilePath $script:VenvPython -Arguments @('-m','pip','--version') -WorkingDirectory $env:USERPROFILE -Description 'Checking project pip' -AllowedExitCodes @(0,1)
    if ($pip.ExitCode -ne 0) {
        Invoke-External -FilePath $script:VenvPython -Arguments @('-m','ensurepip','--upgrade') -WorkingDirectory $env:USERPROFILE -Description 'Bootstrapping pip inside the project deployment venv' -Mutating | Out-Null
    }

    $requirements = @(
        @{ Import='yaml'; Package='PyYAML' },
        @{ Import='jsonschema'; Package='jsonschema' },
        @{ Import='PIL'; Package='Pillow' },
        @{ Import='playwright'; Package='playwright' },
        @{ Import='truststore'; Package='truststore' }
    )
    $missing = [System.Collections.Generic.List[string]]::new()
    foreach ($req in $requirements) {
        $probe = Invoke-External -FilePath $script:VenvPython -Arguments @('-c', ('import {0}' -f $req.Import)) -WorkingDirectory $env:USERPROFILE -Description ('Checking Python package {0}' -f $req.Package) -AllowedExitCodes @(0,1)
        if ($probe.ExitCode -ne 0) { $missing.Add([string]$req.Package) }
    }
    if ($missing.Count -gt 0) {
        $args = @('-m','pip','install','--disable-pip-version-check') + $missing.ToArray()
        Invoke-External -FilePath $script:VenvPython -Arguments $args -WorkingDirectory $env:USERPROFILE -Description ('Installing missing project Python dependencies: {0}' -f ($missing -join ', ')) -Mutating | Out-Null
    } else {
        Write-Log 'All required project Python packages are already available in the isolated venv.' 'PASS'
    }

    $browserProbe = Invoke-External -FilePath $script:VenvPython -Arguments @('-c',"from playwright.sync_api import sync_playwright; import os; p=sync_playwright().start(); x=p.chromium.executable_path; print(x); print(os.path.exists(x)); p.stop()") -WorkingDirectory $env:USERPROFILE -Description 'Checking Playwright Chromium installation' -AllowedExitCodes @(0,1)
    if (($browserProbe.ExitCode -ne 0) -or ($browserProbe.Output -notmatch '(?im)^True\s*$')) {
        Invoke-External -FilePath $script:VenvPython -Arguments @('-m','playwright','install','chromium') -WorkingDirectory $env:USERPROFILE -Description 'Installing the Playwright-managed Chromium browser required by the existing browser tests' -Mutating | Out-Null
    } else {
        Write-Log 'Playwright-managed Chromium is already installed.' 'PASS'
    }
}

function Get-RemoteHeadSha {
    param([string]$Repository, [string]$Ref)
    $result = Invoke-External -FilePath $script:GitPath -Arguments @('ls-remote','origin',$Ref) -WorkingDirectory $Repository -Description ('Reading remote ref {0}' -f $Ref) -AllowedExitCodes @(0)
    $line = ($result.Output -split "`r?`n" | Where-Object { $_ -match '^[0-9a-f]{40}\s' } | Select-Object -First 1)
    if (-not $line) { return $null }
    return ($line -split '\s+')[0]
}

function Get-RemoteTagCommit {
    param([string]$Repository)
    $peeled = Get-RemoteHeadSha -Repository $Repository -Ref ('refs/tags/{0}^{{}}' -f $ReleaseTag)
    if ($peeled) { return $peeled }
    return Get-RemoteHeadSha -Repository $Repository -Ref ('refs/tags/{0}' -f $ReleaseTag)
}

function Prepare-FeatureBranch {
    param([string]$Repository)
    $script:InitialBranch = (Invoke-External -FilePath $script:GitPath -Arguments @('rev-parse','--abbrev-ref','HEAD') -WorkingDirectory $Repository -Description 'Recording initial branch').Output.Trim()
    $script:InitialHead = (Invoke-External -FilePath $script:GitPath -Arguments @('rev-parse','HEAD') -WorkingDirectory $Repository -Description 'Recording initial commit').Output.Trim()

    Invoke-External -FilePath $script:GitPath -Arguments @('fetch','origin','--prune','--tags') -WorkingDirectory $Repository -Description 'Fetching latest remote refs and tags' -Mutating | Out-Null
    if ($script:DryRun) { return }

    $localExists = ((Invoke-External -FilePath $script:GitPath -Arguments @('show-ref','--verify','--quiet',('refs/heads/{0}' -f $BranchName)) -WorkingDirectory $Repository -Description 'Checking local feature branch' -AllowedExitCodes @(0,1)).ExitCode -eq 0)
    $remoteExists = ((Invoke-External -FilePath $script:GitPath -Arguments @('show-ref','--verify','--quiet',('refs/remotes/origin/{0}' -f $BranchName)) -WorkingDirectory $Repository -Description 'Checking remote feature branch' -AllowedExitCodes @(0,1)).ExitCode -eq 0)

    if ($localExists) {
        Invoke-External -FilePath $script:GitPath -Arguments @('checkout',$BranchName) -WorkingDirectory $Repository -Description 'Switching to existing local feature branch' -Mutating | Out-Null
    } elseif ($remoteExists) {
        Invoke-External -FilePath $script:GitPath -Arguments @('checkout','-b',$BranchName,'--track',('origin/{0}' -f $BranchName)) -WorkingDirectory $Repository -Description 'Creating local tracking branch from existing remote feature branch' -Mutating | Out-Null
    } else {
        $mainExists = ((Invoke-External -FilePath $script:GitPath -Arguments @('show-ref','--verify','--quiet','refs/remotes/origin/main') -WorkingDirectory $Repository -Description 'Checking origin/main' -AllowedExitCodes @(0,1)).ExitCode -eq 0)
        if (-not $mainExists) { throw 'origin/main was not found after fetch.' }
        Invoke-External -FilePath $script:GitPath -Arguments @('checkout','-b',$BranchName,'origin/main') -WorkingDirectory $Repository -Description 'Creating feature branch from the latest origin/main' -Mutating | Out-Null
    }

    if ($remoteExists) {
        $status = @(Get-GitStatusEntries $Repository)
        $behind = (Invoke-External -FilePath $script:GitPath -Arguments @('rev-list','--count',('HEAD..origin/{0}' -f $BranchName)) -WorkingDirectory $Repository -Description 'Checking whether local feature branch is behind remote').Output.Trim()
        $ahead = (Invoke-External -FilePath $script:GitPath -Arguments @('rev-list','--count',('origin/{0}..HEAD' -f $BranchName)) -WorkingDirectory $Repository -Description 'Checking whether local feature branch is ahead of remote').Output.Trim()
        if ([int]$behind -gt 0 -and [int]$ahead -gt 0) {
            throw ('Local and remote {0} have diverged. The script will not reset, rebase, merge, or overwrite either history.' -f $BranchName)
        }
        if ([int]$behind -gt 0) {
            if ($status.Count -gt 0) { throw 'The local feature branch is behind its remote and black-hole work is uncommitted. The script will not stash or discard it. Commit/reconcile that branch once, then rerun.' }
            Invoke-External -FilePath $script:GitPath -Arguments @('merge','--ff-only',('origin/{0}' -f $BranchName)) -WorkingDirectory $Repository -Description 'Fast-forwarding existing feature branch to its remote' -Mutating | Out-Null
        }
    }
}

function Write-AssetVerificationHelper {
    param([string]$Path)
    $code = @'
from __future__ import annotations
import argparse, hashlib, json, subprocess, sys
from pathlib import Path
from urllib.parse import urlparse
import yaml
from PIL import Image

p=argparse.ArgumentParser()
p.add_argument('--root',required=True)
p.add_argument('--output',required=True)
a=p.parse_args()
root=Path(a.root)
source=root/'apps/black-hole-museum/content/black-hole-assets.source.yaml'
data=yaml.safe_load(source.read_text(encoding='utf-8'))
allowed_hosts=('eso.org','eventhorizontelescope.org','nasa.gov')

def host_ok(url):
    h=(urlparse(url).hostname or '').lower()
    return any(h==x or h.endswith('.'+x) for x in allowed_hosts)

def sha(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''): h.update(chunk)
    return h.hexdigest()

checks=[]
errors=[]
for asset in data.get('assets',[]):
    rec={'id':asset.get('id'),'classification':asset.get('classification'),'credit':asset.get('credit'),'rightsNote':asset.get('license'),'sourcePage':asset.get('sourcePage'),'downloadUrl':asset.get('downloadUrl'),'kind':asset.get('kind'),'checks':[]}
    def ck(name,ok,detail=''):
        rec['checks'].append({'name':name,'passed':bool(ok),'detail':detail})
        if not ok: errors.append(f"{asset.get('id')}: {name}: {detail}")
    ck('approved source host',host_ok(asset.get('sourcePage','')),asset.get('sourcePage',''))
    ck('approved acquisition host',host_ok(asset.get('downloadUrl','')),asset.get('downloadUrl',''))
    ck('classification present',bool(asset.get('classification')))
    ck('credit present',bool(asset.get('credit')))
    ck('rights note present',bool(asset.get('license')))
    ck('acquisition complete',asset.get('acquisitionStatus')=='complete',str(asset.get('acquisitionStatus')))
    master=root/asset.get('masterPath','') if asset.get('masterPath') else None
    ck('master exists',bool(master and master.is_file()),str(master) if master else '')
    if master and master.is_file():
        actual=sha(master); ck('master checksum matches ledger',actual==asset.get('masterSha256'),actual)
        if asset.get('kind')=='image':
            try:
                with Image.open(master) as im:
                    ck('image dimensions valid',im.width>0 and im.height>0,f'{im.width}x{im.height}')
                    im.verify()
                ck('image file decodes',True)
            except Exception as exc: ck('image file decodes',False,str(exc))
        elif asset.get('kind')=='video':
            try:
                r=subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height','-show_entries','format=duration','-of','json',str(master)],capture_output=True,text=True,check=True)
                meta=json.loads(r.stdout); stream=(meta.get('streams') or [{}])[0]; duration=float((meta.get('format') or {}).get('duration') or 0)
                ck('video dimensions valid',int(stream.get('width') or 0)>0 and int(stream.get('height') or 0)>0,f"{stream.get('width')}x{stream.get('height')}")
                ck('video duration valid',duration>0,str(duration))
            except Exception as exc: ck('video metadata valid',False,str(exc))
    derivatives=asset.get('derivatives') or []
    ck('derivatives recorded',len(derivatives)>0,str(len(derivatives)))
    formats=set()
    widths=set()
    for d in derivatives:
        path=root/d.get('path','')
        formats.add(d.get('format'))
        if d.get('width'): widths.add(int(d['width']))
        ck('derivative exists: '+str(d.get('path')),path.is_file(),str(path))
        if path.is_file(): ck('derivative checksum: '+str(d.get('path')),sha(path)==d.get('sha256'),sha(path))
    if asset.get('kind')=='image':
        ck('responsive WebP derivative exists','webp' in formats,str(sorted(formats)))
        ck('responsive widths generated',len(widths)>=2,str(sorted(widths)))
    else:
        ck('MP4 derivative exists','mp4' in formats,str(sorted(formats)))
        ck('WebM derivative exists','webm' in formats,str(sorted(formats)))
        ck('poster derivative exists','webp' in formats,str(sorted(formats)))
    checks.append(rec)

summary={'total':len(checks),'complete':sum(1 for a in data.get('assets',[]) if a.get('acquisitionStatus')=='complete'),'failed':sum(1 for a in data.get('assets',[]) if a.get('acquisitionStatus')!='complete'),'errors':errors,'assets':checks}
Path(a.output).write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps({'total':summary['total'],'complete':summary['complete'],'failed':summary['failed'],'errors':len(errors)}))
if errors: sys.exit(1)
# Replace the offline/pending note only after every asset-level validation has passed.
data['retrievalStatus']='complete'
data['retrievalNote']='Acquired and validated during deployment against the approved authoritative asset ledger: source host, classification, credit, rights note, file type, dimensions or duration, and recorded checksums verified.'
source.write_text(yaml.safe_dump(data,sort_keys=False,allow_unicode=True,width=1000),encoding='utf-8')
'@
    Set-Content -LiteralPath $Path -Value $code -Encoding UTF8
}

function Validate-Assets {
    param([string]$Root)
    $evidence = Join-Path $Root $EvidenceRelative
    if (-not (Test-Path -LiteralPath $evidence)) { New-Item -ItemType Directory -Path $evidence -Force | Out-Null }
    $helper = Join-Path $env:TEMP ('bhm-asset-verify-{0}.py' -f ([guid]::NewGuid().ToString('N')))
    $out = Join-Path $evidence 'asset-verification.json'
    Write-AssetVerificationHelper -Path $helper
    try {
        $result = Invoke-External -FilePath $script:VenvPython -Arguments @($helper,'--root',$Root,'--output',$out) -WorkingDirectory $Root -Description 'Validating authoritative asset source records, checksums, media metadata, and derivatives' -AllowedExitCodes @(0,1)
        if (-not (Test-Path -LiteralPath $out)) { throw 'Asset verifier did not produce asset-verification.json.' }
        $summary = Get-Content -LiteralPath $out -Raw | ConvertFrom-Json
        $script:AssetTotal = [int]$summary.total
        $script:AssetComplete = [int]$summary.complete
        $script:AssetFailed = [int]$summary.failed
        if ($result.ExitCode -ne 0 -or $summary.errors.Count -gt 0) {
            throw ('Authoritative asset validation failed with {0} error(s). See {1}.' -f $summary.errors.Count, $out)
        }
        Write-Log ('Asset verification passed: total={0}, complete={1}, failed={2}' -f $script:AssetTotal, $script:AssetComplete, $script:AssetFailed) 'PASS'
    } finally {
        Remove-Item -LiteralPath $helper -Force -ErrorAction SilentlyContinue
    }
}

function Write-SystemTrustLauncher {
    param([string]$Path)
    $code = @'
from __future__ import annotations
import runpy
import sys
import truststore

# This is an application/script launcher, which is the supported use case for
# truststore.inject_into_ssl(). It keeps normal hostname and certificate
# verification enabled while delegating trust-chain construction to Windows CryptoAPI.
truststore.inject_into_ssl()

if len(sys.argv) < 2:
    raise SystemExit("system-trust launcher requires a Python script path")
script = sys.argv[1]
sys.argv = [script] + sys.argv[2:]
runpy.run_path(script, run_name="__main__")
'@
    Set-Content -LiteralPath $Path -Value $code -Encoding UTF8
}

function Test-PythonNativeCertificateTrust {
    param([string]$Root)
    $probeCode = @'
import sys
import urllib.request
import truststore

truststore.inject_into_ssl()
urls = [
    "https://cdn.eso.org/images/large/eso1907a.jpg",
    "https://svs.gsfc.nasa.gov/vis/a010000/a013300/a013326/BH_labeled.jpg",
]
for url in urls:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "HughesRoomViews-BlackHoleMuseum/1.0",
            "Range": "bytes=0-0",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        response.read(1)
        print(f"[tls-ok] {url} status={response.status} content-type={response.headers.get('Content-Type')}")
print("[tls-ok] Python HTTPS verification is using the Windows native certificate trust store.")
'@
    Invoke-External -FilePath $script:VenvPython -Arguments @('-c',$probeCode) -WorkingDirectory $Root -Description 'Verifying Python HTTPS through the Windows native certificate trust store' | Out-Null
    Write-Log 'Python authoritative-media HTTPS verification passed using Windows CryptoAPI trust. SSL verification remains enabled.' 'PASS'
}

function Acquire-AssetsWithOneRepair {
    param([string]$Root)

    # Resume optimization: if a prior safe run already acquired and validated all
    # authoritative media, preserve that work instead of transcoding every derivative again.
    $assetSourcePath = Join-Path $Root 'apps\black-hole-museum\content\black-hole-assets.source.yaml'
    if (Test-Path -LiteralPath $assetSourcePath -PathType Leaf) {
        $assetSourceText = Get-Content -LiteralPath $assetSourcePath -Raw
        if ($assetSourceText -match '(?m)^retrievalStatus:\s*complete\s*$') {
            Write-Log 'Existing authoritative asset ledger reports retrievalStatus=complete. Verifying it before deciding whether acquisition can be skipped.' 'DETAIL'
            try {
                Validate-Assets -Root $Root
                if (($script:AssetTotal -eq 12) -and ($script:AssetComplete -eq 12) -and ($script:AssetFailed -eq 0)) {
                    Write-Log 'All 12 authoritative assets and derivatives from the previous safe run revalidated successfully. Skipping redundant download/transcode work.' 'PASS'
                    return
                }
            } catch {
                Write-Log ('Existing asset state did not revalidate cleanly; normal acquisition will run. Reason: {0}' -f $_.Exception.Message) 'WARN'
            }
        }
    }

    # The original implementation remains unchanged. We launch it through a tiny
    # application-level truststore shim so urllib validates HTTPS with Windows'
    # native certificate store instead of relying solely on OpenSSL's CA paths.
    Test-PythonNativeCertificateTrust -Root $Root
    $trustLauncher = Join-Path $env:TEMP ('bhm-system-trust-{0}.py' -f ([guid]::NewGuid().ToString('N')))
    Write-SystemTrustLauncher -Path $trustLauncher
    try {
        $first = Invoke-External -FilePath $script:VenvPython -Arguments @($trustLauncher,'scripts\acquire_black_hole_assets.py') -WorkingDirectory $Root -Description 'Acquiring and optimizing approved NASA, ESO, EHT, and related scientific media with Windows native certificate trust' -AllowedExitCodes @(0,1) -Mutating
        if ($first.Skipped) { return }
        if ($first.ExitCode -eq 0) { return }

        Write-Log 'Asset acquisition reported a failure after native certificate trust was verified. Performing one bounded repair: move any failed partial master files into the recovery area, then retry only the failed asset ids.' 'WARN'
        $listCode = "import yaml, pathlib; p=pathlib.Path(r'apps/black-hole-museum/content/black-hole-assets.source.yaml'); d=yaml.safe_load(p.read_text(encoding='utf-8')); print('\n'.join(a['id']+'|'+a['filename'] for a in d['assets'] if a.get('acquisitionStatus')!='complete'))"
        $failed = Invoke-External -FilePath $script:VenvPython -Arguments @('-c',$listCode) -WorkingDirectory $Root -Description 'Reading failed asset ids after acquisition' -AllowedExitCodes @(0)
        $failedRows = @($failed.Output -split "`r?`n" | Where-Object { $_ -match '\|' })
        if ($failedRows.Count -eq 0) { throw 'Asset acquisition failed but no failed asset ids could be identified.' }
        foreach ($row in $failedRows) {
            $parts = $row -split '\|',2
            $id = $parts[0]; $filename = $parts[1]
            $master = Join-Path $Root ('apps\black-hole-museum\assets\source\{0}' -f $filename)
            if (Test-Path -LiteralPath $master -PathType Leaf) {
                Backup-ExistingFile -Path $master -RelativePath ('apps\black-hole-museum\assets\source\{0}' -f $filename) -Reason ('partial/invalid acquired master for retry: {0}' -f $id)
                if (-not $script:DryRun) { Remove-Item -LiteralPath $master -Force }
            }
            $retry = Invoke-External -FilePath $script:VenvPython -Arguments @($trustLauncher,'scripts\acquire_black_hole_assets.py','--only',$id) -WorkingDirectory $Root -Description ('Retrying authoritative asset acquisition with Windows native certificate trust: {0}' -f $id) -AllowedExitCodes @(0,1) -Mutating
            if ($retry.ExitCode -ne 0) { throw ('Asset acquisition still fails after bounded retry: {0}' -f $id) }
        }
    } finally {
        Remove-Item -LiteralPath $trustLauncher -Force -ErrorAction SilentlyContinue
    }
}

function Set-BuildEnvironment {
    param([string]$SourceCommit)
    $env:HRV_RELEASE_SOURCE_COMMIT = $SourceCommit
    $env:HRV_BUILD_TIMESTAMP = $BuildTimestamp
}

function Assert-ReleaseClean {
    param([string]$Root, [string]$ExpectedSourceCommit)
    $releaseDir = Join-Path $Root $ReleaseRelative
    $releasePath = Join-Path $releaseDir 'release.json'
    $assetPath = Join-Path $releaseDir 'content\black-hole-assets.json'
    if (-not (Test-Path -LiteralPath $releasePath)) { throw ('Release manifest missing: {0}' -f $releasePath) }
    if (-not (Test-Path -LiteralPath $assetPath)) { throw ('Runtime asset manifest missing: {0}' -f $assetPath) }
    $release = Get-Content -LiteralPath $releasePath -Raw | ConvertFrom-Json
    $assets = Get-Content -LiteralPath $assetPath -Raw | ConvertFrom-Json
    if ($release.release -ne $ReleaseId) { throw ('Wrong release id in release.json: {0}' -f $release.release) }
    if ($release.immutableRef -ne $ReleaseTag) { throw ('Wrong immutableRef: {0}' -f $release.immutableRef) }
    if ($release.commit -ne $ExpectedSourceCommit) { throw ('release.json source commit mismatch. Expected {0}, found {1}' -f $ExpectedSourceCommit, $release.commit) }
    if (-not [bool]$release.deploymentReady) { throw 'release.json is not deploymentReady. Authoritative assets were not fully admitted.' }
    foreach ($asset in @($assets.assets)) {
        if ([bool]$asset.stub) { throw ('Runtime asset manifest still points to an offline acquisition stub: {0}' -f $asset.id) }
        if (-not $asset.localUrl) { throw ('Runtime asset has no local immutable URL: {0}' -f $asset.id) }
        if ($asset.localUrl -notmatch [regex]::Escape('@' + $ReleaseTag + '/')) { throw ('Runtime asset URL is not pinned to the release tag: {0}' -f $asset.localUrl) }
    }

    $forbidden = @('@main','@latest','GITHUB_WRITE_BLOCKED','PLACEHOLDER_URL','TODO','C:\Users\','/mnt/data/','blocked-in-current-environment')
    $textFiles = @(Get-ChildItem -LiteralPath $releaseDir -File -Recurse | Where-Object { $_.Extension -match '^\.(json|js|css|html|txt|md)$' })
    foreach ($file in $textFiles) {
        $text = Get-Content -LiteralPath $file.FullName -Raw
        foreach ($needle in $forbidden) {
            if ($text.IndexOf($needle, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
                throw ('Forbidden unresolved value found in release file {0}: {1}' -f $file.FullName, $needle)
            }
        }
    }

    foreach ($asset in @($assets.assets)) {
        $uri = [Uri]$asset.localUrl
        $name = [IO.Path]::GetFileName($uri.AbsolutePath)
        $local = Join-Path $releaseDir ('assets\{0}' -f $name)
        if (-not (Test-Path -LiteralPath $local -PathType Leaf)) { throw ('Release asset reference is missing locally: {0}' -f $local) }
        if ($asset.PSObject.Properties.Name -contains 'posterUrl' -and $asset.posterUrl) {
            $posterName = [IO.Path]::GetFileName(([Uri]$asset.posterUrl).AbsolutePath)
            $poster = Join-Path $releaseDir ('assets\{0}' -f $posterName)
            if (-not (Test-Path -LiteralPath $poster -PathType Leaf)) { throw ('Release video poster is missing locally: {0}' -f $poster) }
        }
    }
    Write-Log ('Release integrity checks passed for {0}; source commit {1}.' -f $ReleaseTag, $ExpectedSourceCommit) 'PASS'
}

function Get-TestTotals {
    param([string]$Output)
    return [pscustomobject]@{
        Passed = @([regex]::Matches($Output, '(?m)^\[PASS\]')).Count
        Failed = @([regex]::Matches($Output, '(?m)^\[FAIL\]')).Count
        Skipped = @([regex]::Matches($Output, '(?im)^\[SKIP(?:PED)?\]')).Count
        Blocked = @([regex]::Matches($Output, '(?im)^\[BLOCKED\]')).Count
    }
}

function Run-RequiredTests {
    param([string]$Root, [string]$Label)
    $repo = Invoke-External -FilePath $script:VenvPython -Arguments @('scripts\test_black_hole.py') -WorkingDirectory $Root -Description ('{0}: repository and schema tests' -f $Label) -AllowedExitCodes @(0,1)
    $browser = Invoke-External -FilePath $script:VenvPython -Arguments @('scripts\test_black_hole_browser.py') -WorkingDirectory $Root -Description ('{0}: browser, responsive, keyboard, reduced-motion, and zoom tests' -f $Label) -AllowedExitCodes @(0,1)
    $repoTotals = Get-TestTotals $repo.Output
    $browserTotals = Get-TestTotals $browser.Output
    return [pscustomobject]@{ Repo=$repo; Browser=$browser; RepoTotals=$repoTotals; BrowserTotals=$browserTotals }
}

function Save-TestEvidence {
    param([string]$Root, $Tests, [string]$Prefix)
    $evidence = Join-Path $Root $EvidenceRelative
    if (-not (Test-Path -LiteralPath $evidence)) { New-Item -ItemType Directory -Path $evidence -Force | Out-Null }
    Set-Content -LiteralPath (Join-Path $evidence ($Prefix + '-repository-test-output.txt')) -Value $Tests.Repo.Output -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $evidence ($Prefix + '-browser-test-output.txt')) -Value $Tests.Browser.Output -Encoding UTF8
}

function Try-OneBoundedTestRepair {
    param([string]$Root, $Tests, [string]$SourceCommit)
    $combined = $Tests.Repo.Output + "`r`n" + $Tests.Browser.Output
    $repaired = $false

    if ($combined -match '(?i)(UnicodeDecodeError|charmap.+codec|can.t decode byte)') {
        Write-Log 'Bounded repair: browser tests detected a Windows locale decoding failure. Reapplying the UTF-8-safe browser harness once.' 'WARN'
        Repair-ImplementationScripts -Root $Root
        $repaired = $true
    }

    if ($combined -match '(?i)(Executable doesn.t exist|playwright install|browser executable)') {
        Write-Log 'Bounded repair: browser tests indicate a missing Playwright Chromium binary. Reinstalling Chromium once.' 'WARN'
        Invoke-External -FilePath $script:VenvPython -Arguments @('-m','playwright','install','chromium') -WorkingDirectory $env:USERPROFILE -Description 'Bounded repair: reinstalling Playwright Chromium' -Mutating | Out-Null
        $repaired = $true
    }

    # Only react to an actual failing test line. R6 matched successful PASS lines containing
    # "authoritative asset", which caused an irrelevant rebuild after a browser-only failure.
    if ($combined -match '(?im)^\s*\[FAIL\].*(deployment-ready|deploymentReady|acquisition stub|authoritative asset)') {
        Write-Log 'Bounded repair: an asset/release readiness test actually failed. Revalidating assets and rebuilding once.' 'WARN'
        Validate-Assets -Root $Root
        Set-BuildEnvironment -SourceCommit $SourceCommit
        Invoke-External -FilePath $script:VenvPython -Arguments @('scripts\build_black_hole.py') -WorkingDirectory $Root -Description 'Bounded repair: rebuilding release after asset validation' -Mutating | Out-Null
        $repaired = $true
    }
    return $repaired
}

function Stage-BlackHoleImplementation {
    param([string]$Root)
    $paths = @(
        'package.json','README.md','IMPLEMENTATION_STATUS.md','Deploy-BlackHoleMuseum.ps1',
        'apps\black-hole-museum','packages\runtime-bootstrap','packages\ui-foundation','registry\routes.json','channels\black-hole-lab.json',
        'schemas','fixtures\black-hole-museum','scripts\acquire_black_hole_assets.py','scripts\build_black_hole.py','scripts\test_black_hole.py','scripts\test_black_hole_browser.py',
        'tests\black-hole-local-harness.html','docs\architecture\black-hole-museum.md','docs\deployment\black-hole-museum-edublogs-block.html','docs\deployment\black-hole-museum.md','docs\rollback\black-hole-museum.md','docs\evidence\black-hole-museum',
        'dist\v0.1.0-black-hole-lab.1'
    )
    $existing = @($paths | Where-Object { Test-Path -LiteralPath (Join-Path $Root $_) })
    if ($existing.Count -eq 0) { throw 'No black-hole implementation paths were available to stage.' }
    $args = @('add','--') + $existing
    Invoke-External -FilePath $script:GitPath -Arguments $args -WorkingDirectory $Root -Description 'Staging only black-hole implementation paths' -Mutating | Out-Null
}

function Commit-IfNeeded {
    param([string]$Root, [string]$Message)
    Stage-BlackHoleImplementation -Root $Root
    $diff = Invoke-External -FilePath $script:GitPath -Arguments @('diff','--cached','--quiet') -WorkingDirectory $Root -Description 'Checking whether staged black-hole changes need a commit' -AllowedExitCodes @(0,1)
    if ($diff.ExitCode -eq 0) {
        $head = (Invoke-External -FilePath $script:GitPath -Arguments @('rev-parse','HEAD') -WorkingDirectory $Root -Description 'Reading existing HEAD because there is nothing new to commit').Output.Trim()
        Write-Log ('No new staged black-hole changes. Reusing HEAD {0}.' -f $head) 'PASS'
        return $head
    }
    Invoke-External -FilePath $script:GitPath -Arguments @('commit','-m',$Message) -WorkingDirectory $Root -Description ('Creating commit: {0}' -f $Message) -Mutating | Out-Null
    return (Invoke-External -FilePath $script:GitPath -Arguments @('rev-parse','HEAD') -WorkingDirectory $Root -Description 'Reading new commit SHA').Output.Trim()
}

function Verify-JsDelivrOnce {
    param([string]$Root, [string]$ExpectedSourceCommit)
    $release = Get-Content -LiteralPath (Join-Path $Root ($ReleaseRelative + '\release.json')) -Raw | ConvertFrom-Json
    $critical = @(
        @{ Url=('https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets@{0}/dist/{0}/release.json' -f $ReleaseTag); Sha=$null; Name='release.json' },
        @{ Url=$release.bootstrap.url; Sha=$release.bootstrap.sha256; Name='runtime-bootstrap.js' },
        @{ Url=$release.pageSystems.'black-hole-museum'.script.url; Sha=$release.pageSystems.'black-hole-museum'.script.sha256; Name='black-hole-museum.js' },
        @{ Url=$release.pageSystems.'black-hole-museum'.style.url; Sha=$release.pageSystems.'black-hole-museum'.style.sha256; Name='black-hole-museum.css' },
        @{ Url=$release.pageSystems.'black-hole-museum'.content.url; Sha=$release.pageSystems.'black-hole-museum'.content.sha256; Name='black-hole-museum.json' },
        @{ Url=$release.pageSystems.'black-hole-museum'.assets.url; Sha=$release.pageSystems.'black-hole-museum'.assets.sha256; Name='black-hole-assets.json' },
        @{ Url=$release.pageSystems.'black-hole-museum'.experience.url; Sha=$release.pageSystems.'black-hole-museum'.experience.sha256; Name='black-hole-experience.json' }
    )
    foreach ($item in $critical) {
        $temp = Join-Path $env:TEMP ('bhm-cdn-{0}.bin' -f ([guid]::NewGuid().ToString('N')))
        try {
            Invoke-WebRequest -Uri $item.Url -UseBasicParsing -TimeoutSec 25 -Headers @{ 'Cache-Control'='no-cache' } -OutFile $temp | Out-Null
            if (-not (Test-Path -LiteralPath $temp) -or (Get-Item -LiteralPath $temp).Length -le 0) { return $false }
            if ($item.Name -eq 'release.json') {
                $remoteRelease = Get-Content -LiteralPath $temp -Raw | ConvertFrom-Json
                if ($remoteRelease.release -ne $ReleaseId -or $remoteRelease.commit -ne $ExpectedSourceCommit -or -not [bool]$remoteRelease.deploymentReady) { return $false }
            } elseif ($item.Sha) {
                if ((Get-Sha256 $temp) -ne ([string]$item.Sha).ToLowerInvariant()) { return $false }
            }
        } catch {
            Write-Log ('jsDelivr not ready for {0}: {1}' -f $item.Name, $_.Exception.Message) 'DETAIL'
            return $false
        } finally {
            Remove-Item -LiteralPath $temp -Force -ErrorAction SilentlyContinue
        }
    }

    $assetManifest = Get-Content -LiteralPath (Join-Path $Root ($ReleaseRelative + '\content\black-hole-assets.json')) -Raw | ConvertFrom-Json
    foreach ($asset in @($assetManifest.assets)) {
        try {
            $response = Invoke-WebRequest -Uri $asset.localUrl -UseBasicParsing -Method Head -TimeoutSec 20 -Headers @{ 'Cache-Control'='no-cache' }
            if ([int]$response.StatusCode -lt 200 -or [int]$response.StatusCode -ge 400) { return $false }
            if ($asset.PSObject.Properties.Name -contains 'posterUrl' -and $asset.posterUrl) {
                $poster = Invoke-WebRequest -Uri $asset.posterUrl -UseBasicParsing -Method Head -TimeoutSec 20 -Headers @{ 'Cache-Control'='no-cache' }
                if ([int]$poster.StatusCode -lt 200 -or [int]$poster.StatusCode -ge 400) { return $false }
            }
        } catch {
            Write-Log ('jsDelivr media not ready for {0}: {1}' -f $asset.id, $_.Exception.Message) 'DETAIL'
            return $false
        }
    }
    return $true
}

function Wait-ForJsDelivr {
    param([string]$Root, [string]$ExpectedSourceCommit)
    $deadline = (Get-Date).AddMinutes(10)
    $attempt = 0
    while ((Get-Date) -lt $deadline) {
        $attempt++
        Write-Log ('jsDelivr propagation check attempt {0}. Waiting up to ten minutes total; immutable tag {1}.' -f $attempt, $ReleaseTag) 'INFO'
        if (Verify-JsDelivrOnce -Root $Root -ExpectedSourceCommit $ExpectedSourceCommit) {
            Write-Log ('jsDelivr immutable release verified on attempt {0}.' -f $attempt) 'PASS'
            return $true
        }
        $remaining = [int](($deadline - (Get-Date)).TotalSeconds)
        if ($remaining -le 0) { break }
        Write-Log ('jsDelivr is still propagating. {0}s remain in the bounded verification window. Detailed status is in {1}.' -f $remaining, $DeploymentLog) 'WARN'
        Start-Sleep -Seconds 20
    }
    return $false
}

function Verify-AndExportEdublogsBlock {
    param([string]$Root)
    $path = Join-Path $Root $EdublogsBlockRelative
    if (-not (Test-Path -LiteralPath $path)) { throw ('Edublogs block missing: {0}' -f $path) }
    $text = Get-Content -LiteralPath $path -Raw
    $required = @(
        'id="hrv-black-hole-museum-root"',
        'data-hrv-page="repository-page-lab-black-holes"',
        'data-path="/repository-page-lab/"',
        'SIMULATED CLASSROOM RECAP',
        'DUMMY CONTENT FOR UNPUBLISHED PROTOTYPE TESTING',
        ('HughesWebAssets@{0}/dist/{0}/runtime-bootstrap.js' -f $ReleaseTag),
        ('HughesWebAssets@{0}/dist/{0}/release.json' -f $ReleaseTag),
        'data-hrv-fallback',
        '<noscript>'
    )
    foreach ($needle in $required) {
        if ($text.IndexOf($needle, [System.StringComparison]::Ordinal) -lt 0) { throw ('Edublogs block verification failed; missing: {0}' -f $needle) }
    }
    foreach ($bad in @('@main','@latest','PLACEHOLDER','TODO','C:\Users\','/mnt/data/')) {
        if ($text.IndexOf($bad, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) { throw ('Edublogs block contains forbidden unresolved value: {0}' -f $bad) }
    }
    if ($script:DryRun) {
        Write-Log ('[WhatIf] Would copy verified Edublogs block to {0} and {1}' -f $FinalHtmlCopy, $FinalTextCopy) 'WHATIF'
    } else {
        Copy-Item -LiteralPath $path -Destination $FinalHtmlCopy -Force
        Set-Content -LiteralPath $FinalTextCopy -Value $text -Encoding UTF8
    }
    Write-Log ('Final Edublogs block verified. HTML copy: {0}; text copy: {1}' -f $FinalHtmlCopy, $FinalTextCopy) 'PASS'
}

function Save-RecoveryRecord {
    if (-not $script:RecoveryDirectory) { return }
    if ($script:DryRun) { return }
    $record = [ordered]@{
        generatedAt=(Get-Date).ToString('o')
        sourceImplementation=$SourceImplementationDirectory
        repository=$script:RepoRoot
        initialBranch=$script:InitialBranch
        initialHead=$script:InitialHead
        targetBranch=$BranchName
        sourceCommit=$script:SourceCommit
        finalCommit=$script:FinalCommit
        backups=$script:RecoveryRecords.ToArray()
    }
    $record | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $script:RecoveryDirectory 'recovery-record.json') -Encoding UTF8
}

function Print-Summary {
    param([bool]$Succeeded, [string]$FailureMessage)
    if ($script:DryRun -and $Succeeded) {
        Write-Banner -Title 'WHATIF PREVIEW COMPLETE - NO REPOSITORY, ASSET, GIT, OR RELEASE CHANGES WERE MADE' -Kind 'WhatIf'
    } elseif ($Succeeded) {
        Write-Banner -Title 'BLACK HOLE MUSEUM DEPLOYMENT SUCCEEDED' -Kind 'Success'
    } else {
        Write-Banner -Title 'BLACK HOLE MUSEUM DEPLOYMENT FAILED SAFELY' -Kind 'Failure'
    }
    Write-Host ('Repository path:             {0}' -f $script:RepoRoot)
    Write-Host ('Branch:                      {0}' -f $BranchName)
    Write-Host ('Source commit SHA:           {0}' -f $script:SourceCommit)
    Write-Host ('Final release commit SHA:    {0}' -f $script:FinalCommit)
    Write-Host ('Release tag:                 {0}' -f $ReleaseTag)
    Write-Host ('Tests passed:                {0}' -f ($script:RepoPassed + $script:BrowserPassed))
    Write-Host ('Tests failed:                {0}' -f ($script:RepoFailed + $script:BrowserFailed))
    Write-Host ('Tests skipped:               {0}' -f $script:SkippedChecks)
    Write-Host ('Tests blocked:               {0}' -f $script:BlockedChecks)
    Write-Host ('Assets total/complete/failed:{0}/{1}/{2}' -f $script:AssetTotal, $script:AssetComplete, $script:AssetFailed)
    Write-Host ('Remote branch verified:      {0}' -f $script:RemoteBranchVerified)
    Write-Host ('Remote tag verified:         {0}' -f $script:RemoteTagVerified)
    Write-Host ('jsDelivr verified:           {0}' -f $script:JsDelivrVerified)
    Write-Host ('Deployment log:              {0}' -f $DeploymentLog)
    Write-Host ('Final Edublogs block:        {0}' -f $FinalHtmlCopy)
    if ($Succeeded -and -not $script:DryRun) {
        Write-Host ''
        Write-Host 'EXACT NEXT EDUBLOGS ACTION:' -ForegroundColor Green
        Write-Host 'Open the unpublished Edublogs page whose route is /repository-page-lab/, add or open the dedicated Custom HTML block, and replace that block contents with the entire verified Black-Hole-Museum-Edublogs-Block.html file.' -ForegroundColor Green
    }
    if (-not $Succeeded -and $FailureMessage) {
        Write-Host ''
        Write-Host ('Failure reason: {0}' -f $FailureMessage) -ForegroundColor Red
        Write-Host ('The script did not claim later stages succeeded. Review {0} for the exact last verified operation.' -f $DeploymentLog) -ForegroundColor Yellow
    }
}

Initialize-Log
Write-Banner -Title 'HUGHES ROOM VIEWS - ARCTIC PREFERRED BLACK HOLE MUSEUM DEPLOYMENT' -Kind 'Info'
Write-Host ('Script revision:        {0}' -f $ScriptRevision) -ForegroundColor Green
Write-Host ('Source implementation: {0}' -f $SourceImplementationDirectory)
Write-Host ('Target repository:     {0}' -f $(if ($RepoPath) { $RepoPath } else { '<automatic discovery>' }))
Write-Host ('Expected Git remote:   {0}' -f $ExpectedRemoteUrl)
Write-Host ('Feature branch:        {0}' -f $BranchName)
Write-Host ('Immutable release tag: {0}' -f $ReleaseTag)
Write-Host ('Deployment log:        {0}' -f $DeploymentLog)
Write-Host ('WhatIf preview:        {0}' -f $script:DryRun)

$success = $false
$failure = ''
try {
    Start-Step 'Checking the existing source implementation package'
    if (-not (Test-Path -LiteralPath $SourceImplementationDirectory -PathType Container)) { throw ('Source implementation directory does not exist: {0}' -f $SourceImplementationDirectory) }
    $requiredSource = @(
        'package.json','apps\black-hole-museum','packages\runtime-bootstrap','registry\routes.json','channels\black-hole-lab.json','schemas',
        'scripts\acquire_black_hole_assets.py','scripts\build_black_hole.py','scripts\test_black_hole.py','scripts\test_black_hole_browser.py','docs'
    )
    foreach ($relative in $requiredSource) {
        $full = Join-Path $SourceImplementationDirectory $relative
        if (-not (Test-Path -LiteralPath $full)) { throw ('Expected implementation item is missing: {0}' -f $full) }
        Write-Log ('Found: {0}' -f $relative) 'PASS'
    }

    Start-Step 'Locating the HughesWebAssets repository and verifying Git'
    $script:GitPath = Find-CommandPath @('git.exe','git')
    if (-not $script:GitPath) {
        Ensure-WingetInstall -DisplayName 'Git for Windows' -PackageId 'Git.Git'
        $script:GitPath = Find-CommandPath @('git.exe','git')
    }
    if (-not $script:GitPath) {
        if ($script:DryRun) { throw 'Git is missing. WhatIf preview cannot discover or verify a repository until Git is available.' }
        throw 'Git is required but no git executable was found after the installation attempt.'
    }
    $gitVersion = Invoke-External -FilePath $script:GitPath -Arguments @('--version') -WorkingDirectory $env:USERPROFILE -Description 'Checking Git version'
    Write-Log ('Git: {0}' -f $gitVersion.Output.Trim()) 'PASS'
    $script:RepoRoot = Search-HughesRepository -ExplicitPath $RepoPath
    if (-not $script:RepoRoot) {
        if ($script:DryRun) {
            Write-Log ('[WhatIf] No local repository found. A real run would ask once, then clone {0} to {1} using local Git authentication.' -f $ExpectedRemoteUrl, $DefaultClonePath) 'WHATIF'
            throw 'WhatIf preview reached the clone boundary. No clone was performed.'
        }
        $answer = Read-Host ('No local HughesWebAssets repository was found. Clone {0} to {1}? [Y/N]' -f $ExpectedRemoteUrl, $DefaultClonePath)
        if ($answer -notmatch '^(?i)y(?:es)?$') { throw 'Repository clone was declined.' }
        if ((Test-Path -LiteralPath $DefaultClonePath) -and @(Get-ChildItem -LiteralPath $DefaultClonePath -Force -ErrorAction SilentlyContinue).Count -gt 0) {
            throw ('Default clone path exists and is not empty: {0}' -f $DefaultClonePath)
        }
        $parent = Split-Path -Parent $DefaultClonePath
        if (-not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
        Invoke-External -FilePath $script:GitPath -Arguments @('clone',$ExpectedRemoteUrl,$DefaultClonePath) -WorkingDirectory $parent -Description 'Cloning HughesWebAssets with local Git authentication' -Mutating | Out-Null
        $script:RepoRoot = $DefaultClonePath
    }
    Write-Log ('Repository selected: {0}' -f $script:RepoRoot) 'PASS'

    Start-Step 'Checking Git origin and protecting unrelated working-tree changes'
    $origin = Get-OriginUrl $script:RepoRoot
    if (-not (Test-RemoteMatchesExpected $origin)) { throw ('Repository origin does not point to {0}. Found: {1}' -f $ExpectedRemoteSlug, $origin) }
    Write-Log ('Verified origin: {0}' -f $origin) 'PASS'
    Assert-NoUnrelatedChanges -Repository $script:RepoRoot -Context 'Before branch preparation' | Out-Null

    Start-Step 'Fetching remote refs and preparing feature/arctic-black-hole-museum'
    Prepare-FeatureBranch -Repository $script:RepoRoot
    if (-not $script:DryRun) {
        Assert-NoUnrelatedChanges -Repository $script:RepoRoot -Context 'After branch preparation' | Out-Null
        $script:PublishedTagCommit = Get-RemoteTagCommit -Repository $script:RepoRoot
        if ($script:PublishedTagCommit) {
            $remoteBranch = Get-RemoteHeadSha -Repository $script:RepoRoot -Ref ('refs/heads/{0}' -f $BranchName)
            if (-not $remoteBranch) { throw ('Immutable tag {0} exists remotely, but the required feature branch does not.' -f $ReleaseTag) }
            $contains = Invoke-External -FilePath $script:GitPath -Arguments @('merge-base','--is-ancestor',$script:PublishedTagCommit,('origin/{0}' -f $BranchName)) -WorkingDirectory $script:RepoRoot -Description 'Checking that the published immutable release belongs to the feature branch' -AllowedExitCodes @(0,1)
            if ($contains.ExitCode -ne 0) { throw ('Remote tag {0} is not contained by origin/{1}. Refusing to reinterpret the immutable release.' -f $ReleaseTag, $BranchName) }
            $script:ResumePublishedRelease = $true
            $script:FinalCommit = $script:PublishedTagCommit
            Write-Log ('Remote immutable tag already exists at {0}. Entering verification/resume mode; the tag will not be moved or rebuilt.' -f $script:PublishedTagCommit) 'WARN'
        }
    }

    if ($script:ResumePublishedRelease) {
        # Preserve step numbering and skip all build mutations. The remaining stages verify the already-published immutable release.
        Start-Step 'Preserving the already-published immutable overlay state'
        Write-Log 'Skipped overlay copy because the immutable release tag already exists remotely.' 'INFO'
        Start-Step 'Checking required deployment tools'
        Write-Log 'Skipped tool installation in resume mode; only Git and network verification are required.' 'INFO'
        Start-Step 'Preparing isolated Python project dependencies'
        Write-Log 'Skipped Python environment preparation in resume mode.' 'INFO'
        Start-Step 'Inspecting implementation scripts for deployment repairs'
        Write-Log 'Skipped script repair in resume mode to avoid modifying an already-published immutable release.' 'INFO'
        Start-Step 'Acquiring authoritative scientific assets'
        Write-Log 'Skipped acquisition in resume mode; immutable release assets will be verified through jsDelivr.' 'INFO'
        Start-Step 'Validating acquired assets and derivatives'
        Write-Log 'Skipped local asset mutation in resume mode.' 'INFO'
        Start-Step 'Building provisional immutable release'
        Write-Log 'Skipped build in resume mode.' 'INFO'
        Start-Step 'Running pre-commit repository and browser tests'
        Write-Log 'Skipped local pre-commit tests in resume mode.' 'INFO'
        Start-Step 'Creating source implementation commit'
        Write-Log 'Skipped source commit in resume mode.' 'INFO'
        Start-Step 'Rebuilding immutable release with source commit'
        Write-Log 'Skipped final build in resume mode.' 'INFO'
        Start-Step 'Running final required tests and writing evidence'
        Write-Log 'Reading published test summary when available.' 'INFO'
        $summaryText = (Invoke-External -FilePath $script:GitPath -Arguments @('show',('{0}:{1}\deployment-test-summary.json' -f $ReleaseTag,$EvidenceRelative)) -WorkingDirectory $script:RepoRoot -Description 'Reading deployment test summary from immutable tag' -AllowedExitCodes @(0,128)).Output
        if ($summaryText) {
            try {
                $summary = $summaryText | ConvertFrom-Json
                $script:RepoPassed=[int]$summary.repository.passed; $script:RepoFailed=[int]$summary.repository.failed
                $script:BrowserPassed=[int]$summary.browser.passed; $script:BrowserFailed=[int]$summary.browser.failed
                $script:SkippedChecks=[int]$summary.skipped; $script:BlockedChecks=[int]$summary.blocked
                $script:AssetTotal=[int]$summary.assets.total; $script:AssetComplete=[int]$summary.assets.complete; $script:AssetFailed=[int]$summary.assets.failed
            } catch { Write-Log 'Published test summary could not be parsed; CDN verification will still proceed.' 'WARN' }
        }
        Start-Step 'Confirming immutable release commit and tag'
        Write-Log ('Immutable tag preserved at {0}.' -f $script:FinalCommit) 'PASS'
        Start-Step 'Confirming branch and tag are already pushed'
        $script:RemoteBranchVerified = [bool](Get-RemoteHeadSha -Repository $script:RepoRoot -Ref ('refs/heads/{0}' -f $BranchName))
        $script:RemoteTagVerified = [bool](Get-RemoteTagCommit -Repository $script:RepoRoot)
        Start-Step 'Verifying remote branch and release tag'
        if (-not $script:RemoteBranchVerified -or -not $script:RemoteTagVerified) { throw 'Remote branch/tag verification failed in resume mode.' }
        Write-Log 'Remote feature branch and immutable release tag exist.' 'PASS'
        Start-Step 'Waiting for and verifying jsDelivr immutable URLs'
        # Extract exact tagged manifests into a temporary directory for hash/source-commit verification.
        $tempRelease = Join-Path $env:TEMP ('bhm-tag-{0}' -f ([guid]::NewGuid().ToString('N')))
        New-Item -ItemType Directory -Path (Join-Path $tempRelease $ReleaseRelative) -Force | Out-Null
        foreach ($rel in @('release.json','content/black-hole-assets.json')) {
            $gitPath = (Convert-ToGitPath $ReleaseRelative) + '/' + (Convert-ToGitPath $rel)
            $data = (Invoke-External -FilePath $script:GitPath -Arguments @('show',('{0}:{1}' -f $ReleaseTag,$gitPath)) -WorkingDirectory $script:RepoRoot -Description ('Reading tagged {0}' -f $rel)).Output
            $dest = Join-Path (Join-Path $tempRelease $ReleaseRelative) (Convert-ToWindowsPath $rel)
            $parent = Split-Path -Parent $dest; if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
            Set-Content -LiteralPath $dest -Value $data -Encoding UTF8
        }
        $taggedRelease = Get-Content -LiteralPath (Join-Path $tempRelease ($ReleaseRelative + '\release.json')) -Raw | ConvertFrom-Json
        $script:SourceCommit = [string]$taggedRelease.commit
        $script:JsDelivrVerified = Wait-ForJsDelivr -Root $tempRelease -ExpectedSourceCommit $script:SourceCommit
        Remove-Item -LiteralPath $tempRelease -Recurse -Force -ErrorAction SilentlyContinue
        if (-not $script:JsDelivrVerified) { throw 'jsDelivr did not verify the already-published immutable release within ten minutes.' }
        Start-Step 'Verifying and exporting final Edublogs block'
        $taggedBlock = (Invoke-External -FilePath $script:GitPath -Arguments @('show',('{0}:{1}' -f $ReleaseTag,(Convert-ToGitPath $EdublogsBlockRelative))) -WorkingDirectory $script:RepoRoot -Description 'Reading tagged Edublogs handoff block').Output
        $tempBlockRoot = Join-Path $env:TEMP ('bhm-block-{0}' -f ([guid]::NewGuid().ToString('N')))
        $tempBlockPath = Join-Path $tempBlockRoot $EdublogsBlockRelative
        New-Item -ItemType Directory -Path (Split-Path -Parent $tempBlockPath) -Force | Out-Null
        Set-Content -LiteralPath $tempBlockPath -Value $taggedBlock -Encoding UTF8
        Verify-AndExportEdublogsBlock -Root $tempBlockRoot
        Remove-Item -LiteralPath $tempBlockRoot -Recurse -Force -ErrorAction SilentlyContinue
        $success = $true
    } else {
        Start-Step 'Backing up and applying the repository overlay without touching historical laboratories'
        $runtimeLabBefore = Test-Path -LiteralPath (Join-Path $script:RepoRoot 'test\repo-runtime-lab')
        $layoutLabBefore = Test-Path -LiteralPath (Join-Path $script:RepoRoot 'test\repo-layout-lab')
        Copy-OverlaySafely -SourceRoot $SourceImplementationDirectory -TargetRoot $script:RepoRoot
        if ($runtimeLabBefore -and -not (Test-Path -LiteralPath (Join-Path $script:RepoRoot 'test\repo-runtime-lab'))) { throw 'Historical test/repo-runtime-lab disappeared during overlay copy.' }
        if ($layoutLabBefore -and -not (Test-Path -LiteralPath (Join-Path $script:RepoRoot 'test\repo-layout-lab'))) { throw 'Historical test/repo-layout-lab disappeared during overlay copy.' }
        Write-Log 'Historical repository laboratories were preserved.' 'PASS'

        Start-Step 'Checking required deployment tools'
        Ensure-RequiredSystemTools

        Start-Step 'Preparing isolated Python project dependencies and Playwright Chromium'
        Ensure-PythonEnvironment
        if ($script:DryRun) {
            Write-Log 'WhatIf preview stops before acquisition/build/test because the required isolated venv and repository mutations were intentionally not created.' 'WHATIF'
            Start-Step 'Inspecting implementation scripts for deployment repairs'
            Write-Log '[WhatIf] The real run will repair only the three inspection-proven incompatibilities documented at the top of this script.' 'WHATIF'
            Start-Step 'Acquiring authoritative scientific assets'; Write-Log '[WhatIf] Would verify Python HTTPS against Windows native certificate trust, then run the existing scripts\acquire_black_hole_assets.py through that trusted SSL context.' 'WHATIF'
            Start-Step 'Validating acquired assets and derivatives'; Write-Log '[WhatIf] Would validate source host, classification, credit, rights note, file type, dimensions/duration, checksums, and derivatives.' 'WHATIF'
            Start-Step 'Building provisional immutable release'; Write-Log '[WhatIf] Would run scripts\build_black_hole.py with a real 40-character source commit.' 'WHATIF'
            Start-Step 'Running pre-commit repository and browser tests'; Write-Log '[WhatIf] Would run both existing test scripts and block commits on failures.' 'WHATIF'
            Start-Step 'Creating source implementation commit'; Write-Log '[WhatIf] Would commit only black-hole-owned paths.' 'WHATIF'
            Start-Step 'Rebuilding immutable release with source commit'; Write-Log '[WhatIf] Would rebuild with the verified source commit and fixed build timestamp.' 'WHATIF'
            Start-Step 'Running final required tests and writing evidence'; Write-Log '[WhatIf] Would rerun both required suites and write evidence.' 'WHATIF'
            Start-Step 'Creating immutable release commit and tag'; Write-Log ('[WhatIf] Would create immutable tag {0}.' -f $ReleaseTag) 'WHATIF'
            Start-Step 'Pushing feature branch and tag'; Write-Log '[WhatIf] Would push with local Git authentication.' 'WHATIF'
            Start-Step 'Verifying remote branch and release tag'; Write-Log '[WhatIf] Would verify both refs with git ls-remote.' 'WHATIF'
            Start-Step 'Waiting for and verifying jsDelivr immutable URLs'; Write-Log '[WhatIf] Would retry immutable CDN verification for up to ten minutes.' 'WHATIF'
            Start-Step 'Verifying and exporting final Edublogs block'; Write-Log ('[WhatIf] Would export to {0} and {1} only after CDN verification.' -f $FinalHtmlCopy,$FinalTextCopy) 'WHATIF'
            $success = $true
        } else {
            Start-Step 'Inspecting and repairing only implementation scripts proven incompatible with deployment'
            Repair-ImplementationScripts -Root $script:RepoRoot

            Start-Step 'Acquiring authoritative scientific assets'
            Acquire-AssetsWithOneRepair -Root $script:RepoRoot

            Start-Step 'Validating acquired assets, credits, classifications, rights notes, checksums, and derivatives'
            Validate-Assets -Root $script:RepoRoot
            if ($script:AssetFailed -gt 0 -or $script:AssetComplete -ne $script:AssetTotal) { throw 'Not all authoritative assets passed admission.' }

            Start-Step 'Building provisional immutable release'
            $provisionalCommit = (Invoke-External -FilePath $script:GitPath -Arguments @('rev-parse','HEAD') -WorkingDirectory $script:RepoRoot -Description 'Reading provisional source commit').Output.Trim()
            if ($provisionalCommit -notmatch '^[0-9a-f]{40}$') { throw ('Invalid provisional commit SHA: {0}' -f $provisionalCommit) }
            Set-BuildEnvironment -SourceCommit $provisionalCommit
            $build = Invoke-External -FilePath $script:VenvPython -Arguments @('scripts\build_black_hole.py') -WorkingDirectory $script:RepoRoot -Description 'Running existing deterministic black-hole build pipeline' -Mutating
            Assert-ReleaseClean -Root $script:RepoRoot -ExpectedSourceCommit $provisionalCommit

            Start-Step 'Running pre-commit repository and browser tests'
            $preTests = Run-RequiredTests -Root $script:RepoRoot -Label 'Pre-commit'
            Save-TestEvidence -Root $script:RepoRoot -Tests $preTests -Prefix 'precommit'
            if ($preTests.Repo.ExitCode -ne 0 -or $preTests.Browser.ExitCode -ne 0) {
                $didRepair = Try-OneBoundedTestRepair -Root $script:RepoRoot -Tests $preTests -SourceCommit $provisionalCommit
                if (-not $didRepair) { throw 'Required pre-commit tests failed and no safe bounded automatic repair applies. Commit and push are blocked.' }
                $preTests = Run-RequiredTests -Root $script:RepoRoot -Label 'Pre-commit after bounded repair'
                Save-TestEvidence -Root $script:RepoRoot -Tests $preTests -Prefix 'precommit-retry'
                if ($preTests.Repo.ExitCode -ne 0 -or $preTests.Browser.ExitCode -ne 0) { throw 'Required tests still fail after one bounded repair attempt. Commit and push are blocked.' }
            }
            Write-Log 'Pre-commit required tests passed.' 'PASS'

            Start-Step 'Creating the source implementation commit'
            Assert-NoUnrelatedChanges -Repository $script:RepoRoot -Context 'Before source commit' | Out-Null
            $script:SourceCommit = Commit-IfNeeded -Root $script:RepoRoot -Message 'feat: add Arctic Preferred black hole museum source'
            if ($script:SourceCommit -notmatch '^[0-9a-f]{40}$') { throw ('Invalid source commit SHA: {0}' -f $script:SourceCommit) }
            Write-Log ('Source commit SHA: {0}' -f $script:SourceCommit) 'PASS'

            Start-Step 'Rebuilding immutable release with the verified source commit'
            Set-BuildEnvironment -SourceCommit $script:SourceCommit
            $finalBuild = Invoke-External -FilePath $script:VenvPython -Arguments @('scripts\build_black_hole.py') -WorkingDirectory $script:RepoRoot -Description 'Rebuilding immutable release with verified source commit' -Mutating
            Assert-ReleaseClean -Root $script:RepoRoot -ExpectedSourceCommit $script:SourceCommit
            $evidenceDir = Join-Path $script:RepoRoot $EvidenceRelative
            if (-not (Test-Path -LiteralPath $evidenceDir)) { New-Item -ItemType Directory -Path $evidenceDir -Force | Out-Null }
            Set-Content -LiteralPath (Join-Path $evidenceDir 'build-output.txt') -Value $finalBuild.Output -Encoding UTF8

            Start-Step 'Running final required tests and writing evidence'
            $finalTests = Run-RequiredTests -Root $script:RepoRoot -Label 'Final release'
            Save-TestEvidence -Root $script:RepoRoot -Tests $finalTests -Prefix 'final'
            if ($finalTests.Repo.ExitCode -ne 0 -or $finalTests.Browser.ExitCode -ne 0) {
                $didRepair = Try-OneBoundedTestRepair -Root $script:RepoRoot -Tests $finalTests -SourceCommit $script:SourceCommit
                if ($didRepair) {
                    Assert-ReleaseClean -Root $script:RepoRoot -ExpectedSourceCommit $script:SourceCommit
                    $finalTests = Run-RequiredTests -Root $script:RepoRoot -Label 'Final release after bounded repair'
                    Save-TestEvidence -Root $script:RepoRoot -Tests $finalTests -Prefix 'final-retry'
                }
            }
            $r = $finalTests.RepoTotals; $b = $finalTests.BrowserTotals
            $script:RepoPassed=[int]$r.Passed; $script:RepoFailed=[int]$r.Failed
            $script:BrowserPassed=[int]$b.Passed; $script:BrowserFailed=[int]$b.Failed
            $script:SkippedChecks=[int]$r.Skipped + [int]$b.Skipped
            $script:BlockedChecks=[int]$r.Blocked + [int]$b.Blocked
            if ($finalTests.Repo.ExitCode -ne 0 -or $finalTests.Browser.ExitCode -ne 0 -or $script:RepoFailed -gt 0 -or $script:BrowserFailed -gt 0) { throw 'Final required tests failed. Release commit, tag, and push are blocked.' }
            $summaryRecord = [ordered]@{
                generatedAt=(Get-Date).ToString('o')
                repository=[ordered]@{ passed=$script:RepoPassed; failed=$script:RepoFailed }
                browser=[ordered]@{ passed=$script:BrowserPassed; failed=$script:BrowserFailed }
                skipped=$script:SkippedChecks
                blocked=$script:BlockedChecks
                assets=[ordered]@{ total=$script:AssetTotal; complete=$script:AssetComplete; failed=$script:AssetFailed }
            }
            $summaryRecord | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $evidenceDir 'deployment-test-summary.json') -Encoding UTF8
            Write-Log ('FINAL TEST SUMMARY: passed={0}, failed={1}, skipped={2}, blocked={3}' -f ($script:RepoPassed+$script:BrowserPassed),($script:RepoFailed+$script:BrowserFailed),$script:SkippedChecks,$script:BlockedChecks) 'PASS'

            Start-Step 'Creating immutable release commit and tag'
            Assert-NoUnrelatedChanges -Repository $script:RepoRoot -Context 'Before release commit' | Out-Null
            $script:FinalCommit = Commit-IfNeeded -Root $script:RepoRoot -Message ('build: add immutable black hole museum release {0}' -f $ReleaseTag)
            if ($script:FinalCommit -notmatch '^[0-9a-f]{40}$') { throw ('Invalid final release commit SHA: {0}' -f $script:FinalCommit) }
            $localTag = Invoke-External -FilePath $script:GitPath -Arguments @('rev-parse','-q','--verify',('refs/tags/{0}^{{}}' -f $ReleaseTag)) -WorkingDirectory $script:RepoRoot -Description 'Checking existing local immutable tag' -AllowedExitCodes @(0,1)
            if ($localTag.ExitCode -eq 0) {
                $tagCommit = $localTag.Output.Trim()
                if ($tagCommit -ne $script:FinalCommit) { throw ('Local immutable tag {0} already points to {1}; it will not be moved to {2}.' -f $ReleaseTag,$tagCommit,$script:FinalCommit) }
                Write-Log ('Local immutable tag already points to final release commit: {0}' -f $ReleaseTag) 'PASS'
            } else {
                Invoke-External -FilePath $script:GitPath -Arguments @('tag','-a',$ReleaseTag,'-m','Arctic Preferred Black Hole Museum immutable release 0.1.0') -WorkingDirectory $script:RepoRoot -Description 'Creating annotated immutable release tag' -Mutating | Out-Null
            }

            Start-Step 'Pushing feature branch and immutable tag'
            $remoteTagBefore = Get-RemoteTagCommit -Repository $script:RepoRoot
            if ($remoteTagBefore -and $remoteTagBefore -ne $script:FinalCommit) { throw ('Remote immutable tag {0} already points to {1}; it will not be moved.' -f $ReleaseTag,$remoteTagBefore) }
            Invoke-External -FilePath $script:GitPath -Arguments @('push','--set-upstream','origin',$BranchName) -WorkingDirectory $script:RepoRoot -Description 'Pushing feature branch with local Git authentication' -Mutating | Out-Null
            if (-not $remoteTagBefore) { Invoke-External -FilePath $script:GitPath -Arguments @('push','origin',('refs/tags/{0}' -f $ReleaseTag)) -WorkingDirectory $script:RepoRoot -Description 'Pushing immutable release tag with local Git authentication' -Mutating | Out-Null }

            Start-Step 'Verifying remote branch and release tag'
            $remoteBranchSha = Get-RemoteHeadSha -Repository $script:RepoRoot -Ref ('refs/heads/{0}' -f $BranchName)
            $remoteTagSha = Get-RemoteTagCommit -Repository $script:RepoRoot
            $script:RemoteBranchVerified = ($remoteBranchSha -eq $script:FinalCommit)
            $script:RemoteTagVerified = ($remoteTagSha -eq $script:FinalCommit)
            if (-not $script:RemoteBranchVerified) { throw ('Remote branch verification failed. Expected {0}, found {1}' -f $script:FinalCommit,$remoteBranchSha) }
            if (-not $script:RemoteTagVerified) { throw ('Remote tag verification failed. Expected {0}, found {1}' -f $script:FinalCommit,$remoteTagSha) }
            Write-Log ('Remote feature branch and immutable tag both resolve to final commit {0}.' -f $script:FinalCommit) 'PASS'

            Start-Step 'Waiting for and verifying jsDelivr immutable release URLs'
            $script:JsDelivrVerified = Wait-ForJsDelivr -Root $script:RepoRoot -ExpectedSourceCommit $script:SourceCommit
            if (-not $script:JsDelivrVerified) { throw 'jsDelivr did not expose and validate every required immutable release URL within the bounded ten-minute propagation window.' }

            Start-Step 'Verifying and exporting the final Edublogs handoff block'
            Verify-AndExportEdublogsBlock -Root $script:RepoRoot

            $remaining = @(Get-GitStatusEntries $script:RepoRoot)
            if ($remaining.Count -gt 0) {
                foreach ($entry in $remaining) { Write-Log ('Uncommitted after deployment: {0} {1}' -f $entry.Status,$entry.Path) 'ERROR' }
                throw 'Repository working tree is not clean after deployment. Success is not claimed.'
            }
            $success = $true
        }
    }
} catch {
    $failure = $_.Exception.Message
    Write-Log $failure 'ERROR'
} finally {
    try { Save-RecoveryRecord } catch { Write-Log ('Could not save recovery record: {0}' -f $_.Exception.Message) 'WARN' }
    Print-Summary -Succeeded $success -FailureMessage $failure
    Write-Log ('Deployment finished. success={0}' -f $success) $(if ($success) { 'PASS' } else { 'ERROR' })
}

if (-not $success) { exit 1 }
exit 0
