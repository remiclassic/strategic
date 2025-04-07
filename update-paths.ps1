# PowerShell script to update image paths in Astro components

# Get all .astro files in the project
$astroFiles = Get-ChildItem -Path . -Recurse -Filter "*.astro"

# Counter for modified files
$modifiedFiles = 0

# Process each file
foreach ($file in $astroFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if file contains the old path pattern
    if ($content -match "/strategic/images/") {
        # Replace the old path with the new path
        $newContent = $content -replace "/strategic/images/", "/images/"
        $newContent = $newContent -replace "/strategic/media/", "/media/"
        
        # Write the updated content back to the file
        Set-Content -Path $file.FullName -Value $newContent
        
        # Increment counter
        $modifiedFiles++
        
        Write-Host "Updated paths in: $($file.FullName)"
    }
}

Write-Host "Total files modified: $modifiedFiles" 