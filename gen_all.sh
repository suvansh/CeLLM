#!/bin/bash

# remove all.gs if it exists
[ -e all.gs ] && rm all.gs

# iterate over .gs files
for file in *.gs; do
    # skip all.gs
    if [ "$file" = "all.gs" ]; then
        continue
    fi
    
    # append filename as a comment and file content to all.gs
    echo "// FILE: $file" >> all.gs
    cat "$file" >> all.gs
    echo -e "\n\n" >> all.gs
done
