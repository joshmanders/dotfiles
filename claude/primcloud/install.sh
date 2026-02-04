#!/usr/bin/env bash
#
# Install shared Claude config into primcloud projects
#
# Usage:
#   ./install.sh                      # All projects
#   ./install.sh platform             # Single project
#   ./install.sh platform,agent       # Multiple projects
#
# What it does:
#   1. Creates .claude/skills/ directory if needed
#   2. Symlinks shared skills (skips if exists)
#   3. Removes broken symlinks (skills that were deleted)
#   4. Updates .gitignore to exclude symlinked skills
#   5. Never overwrites existing project-specific config

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRIMCLOUD_DIR="${DOTFILES_PRIMCLOUD_DIR:-$HOME/Code/primcloud}"

# All known primcloud projects
ALL_PROJECTS=(platform agent ingress builder placeholder)

# Get list of shared skill names
get_shared_skills() {
    local skills=()
    for skill in "$SCRIPT_DIR/skills/"*/; do
        [[ -d "$skill" ]] || continue
        skills+=("$(basename "$skill")")
    done
    echo "${skills[@]}"
}

# Update .gitignore to include symlinked skills
update_gitignore() {
    local project_path="$1"
    local skills_dir="$project_path/.claude/skills"
    local gitignore="$project_path/.claude/.gitignore"

    # Collect current symlinked skill names
    local symlinked=()
    for item in "$skills_dir"/*; do
        [[ -L "$item" ]] || continue
        symlinked+=("$(basename "$item")")
    done

    # If no symlinks, remove .gitignore if it only has our managed entries
    if [[ ${#symlinked[@]} -eq 0 ]]; then
        if [[ -f "$gitignore" ]]; then
            # Check if file only contains skill entries (skills/*)
            if grep -qvE '^skills/|^$|^#' "$gitignore" 2>/dev/null; then
                # Has other content, just remove our entries
                grep -vE '^skills/' "$gitignore" > "$gitignore.tmp" 2>/dev/null || true
                mv "$gitignore.tmp" "$gitignore"
            else
                # Only our entries, remove the file
                rm "$gitignore"
                echo "  Removed: .gitignore (no symlinks)"
            fi
        fi
        return
    fi

    # Build new gitignore content
    local new_content=""
    for skill in "${symlinked[@]}"; do
        new_content+="skills/$skill"$'\n'
    done

    # Read existing non-skill entries if file exists
    local existing=""
    if [[ -f "$gitignore" ]]; then
        existing=$(grep -vE '^skills/' "$gitignore" 2>/dev/null || true)
    fi

    # Write combined content
    {
        [[ -n "$existing" ]] && echo "$existing"
        echo "$new_content"
    } | sort -u > "$gitignore"

    echo "  Updated: .gitignore"
}

install_project() {
    local project_path="$1"
    local project_name
    project_name=$(basename "$project_path")

    if [[ ! -d "$project_path" ]]; then
        echo "Skip: $project_name (directory not found)"
        return
    fi

    echo "Installing: $project_name"

    local claude_dir="$project_path/.claude"
    local skills_dir="$claude_dir/skills"

    mkdir -p "$skills_dir"

    # Remove broken symlinks
    for item in "$skills_dir"/*; do
        [[ -L "$item" ]] || continue
        if [[ ! -e "$item" ]]; then
            local name
            name=$(basename "$item")
            rm "$item"
            echo "  Removed: $name (broken symlink)"
        fi
    done

    # Add new symlinks
    for skill in "$SCRIPT_DIR/skills/"*/; do
        [[ -d "$skill" ]] || continue
        local skill_name
        skill_name=$(basename "$skill")
        local target="$skills_dir/$skill_name"

        if [[ -e "$target" ]]; then
            echo "  Skip: $skill_name (exists)"
        else
            ln -s "$skill" "$target"
            echo "  Linked: $skill_name"
        fi
    done

    # Update .gitignore
    update_gitignore "$project_path"
}

# Determine which projects to install
if [[ $# -eq 0 ]]; then
    # No args = all projects
    projects=("${ALL_PROJECTS[@]}")
else
    # Parse comma-delimited list
    IFS=',' read -ra projects <<< "$1"
fi

for project in "${projects[@]}"; do
    # Handle both basename and full path
    if [[ "$project" == /* ]]; then
        install_project "$project"
    else
        install_project "$PRIMCLOUD_DIR/$project"
    fi
done

echo "Done!"
