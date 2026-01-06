#!/usr/bin/env python3
import os
import re
import sys

def find_yaml_in_comments(file_path):
    """Find YAML syntax in JSDoc comments"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract JSDoc comment blocks that look like YAML
    yaml_blocks = []
    lines = content.split('\n')

    i = 0
    while i < len(lines):
        line = lines[i]
        # Look for JSDoc comment start
        if '/**' in line or ' *' in line:
            yaml_line = line
            # Extract the YAML-like content from JSDoc
            while i < len(lines) and ('*' in lines[i] or lines[i].strip().startswith('*')):
                # Remove the JSDoc comment markers and keep the content
                clean_line = re.sub(r'^\s*\*\s*', '', lines[i])
                yaml_line += '\n' + clean_line
                i += 1

            # Check if this looks like YAML (has schema, type, properties, etc.)
            if any(keyword in yaml_line.lower() for keyword in ['schema:', 'properties:', 'type:', 'items:']):
                yaml_blocks.append(yaml_line)

        i += 1

    return yaml_blocks

def validate_yaml(yaml_content, file_path):
    """Try to validate YAML content"""
    import yaml
    try:
        # Try to parse as YAML
        yaml.safe_load(yaml_content)
        return True, None
    except yaml.YAMLError as e:
        return False, str(e)

def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_yaml.py <file_or_directory>")
        sys.exit(1)

    target = sys.argv[1]

    errors = []

    if os.path.isfile(target):
        files = [target]
    elif os.path.isdir(target):
        files = [os.path.join(target, f) for f in os.listdir(target) if f.endswith('.routes.ts')]
    else:
        print(f"Error: {target} is not a valid file or directory")
        sys.exit(1)

    for file_path in files:
        print(f"\nChecking {file_path}...")
        yaml_blocks = find_yaml_in_comments(file_path)

        if not yaml_blocks:
            print("  No YAML blocks found")
            continue

        for i, yaml_block in enumerate(yaml_blocks):
            is_valid, error = validate_yaml(yaml_block, file_path)
            if not is_valid:
                errors.append(f"{file_path}: YAML block {i+1} error:\n{error}\n{yaml_block[:200]}...")

    if errors:
        print("\n" + "="*80)
        print("YAML VALIDATION ERRORS FOUND:")
        print("="*80)
        for error in errors:
            print(error)
            print("-"*80)
        sys.exit(1)
    else:
        print("\nAll YAML blocks are valid!")

if __name__ == '__main__':
    main()
