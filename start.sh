#!/bin/bash 
# Create the virtual environment if it doesn't exist
cd ..
cd ..
cd ..

sudo wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

cd search/webapp

nvm install node

ng serve --host 0.0.0.0 --disable-host-check


