param(
    [string[]] $UmbracoVersions = @('17.7.0', '18.0.0', '18.3.1'),
    [string[]] $BackofficeVersions = @('18.0.0', '18.3.1')
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
$project = Join-Path $repo 'src/EditorAssistant.AI.Umbraco/EditorAssistant.AI.Umbraco.csproj'
$client = Join-Path $repo 'src/EditorAssistant.AI.Umbraco/Client'
$hostProject = Join-Path $PSScriptRoot 'CompatibilityHost/CompatibilityHost.csproj'
$feed = Join-Path $repo 'src/EditorAssistant.AI.Umbraco/artifacts/compatibility'
# Unique version prevents a previous run's package being read from NuGet's cache.
$packageVersion = '1.2.1-compatibility.' + [DateTime]::UtcNow.ToString('yyyyMMddHHmmssfff')

function Invoke-Checked([string] $command, [string[]] $arguments) {
    $tool = Get-Command $command -ErrorAction Stop
    # Windows PowerShell 5 treats native stderr warnings as errors when output
    # is redirected. Use the process exit code to determine success instead.
    $previousPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        & $tool @arguments
    }
    finally { $ErrorActionPreference = $previousPreference }
    if ($LASTEXITCODE -ne 0) { throw "$command failed with exit code $LASTEXITCODE" }
}

Push-Location $client
try {
    Invoke-Checked npm @('ci')
    Invoke-Checked npm @('test')
    Invoke-Checked npm @('run', 'build')
    # Build the release assets against the supported 17.x baseline, then check
    # that the same source also type-checks against the 18.x public APIs.
    foreach ($version in $BackofficeVersions) {
        Write-Host "Checking backoffice API $version"
        Invoke-Checked npm @('install', '--no-save', '--package-lock=false', "@umbraco-cms/backoffice@$version")
        Invoke-Checked npx @('tsc', '--noEmit')
        Invoke-Checked npm @('test')
    }
}
finally {
    # Leave node_modules aligned with the committed package-lock.json.
    try { Invoke-Checked npm @('ci') } finally { Pop-Location }
}

Invoke-Checked dotnet @('test', (Join-Path $repo 'EditorAssistant.AI.Umbraco.slnx'), '--nologo')
Invoke-Checked dotnet @('pack', $project, '-c', 'Release', '-o', $feed, "-p:PackageVersion=$packageVersion", '--nologo')
foreach ($version in $UmbracoVersions) {
    Write-Host "Testing packed package on Umbraco $version"
    $properties = @("-p:UmbracoVersion=$version", "-p:EditorAssistantVersion=$packageVersion")
    Invoke-Checked dotnet (@('restore', $hostProject, '--configfile', (Join-Path $PSScriptRoot 'CompatibilityHost/NuGet.Config')) + $properties)
    Invoke-Checked dotnet (@('run', '--project', $hostProject, '--no-restore') + $properties)
}
